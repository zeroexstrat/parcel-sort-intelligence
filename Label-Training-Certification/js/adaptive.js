/* ══════════════════════════════════════════════
   adaptive.js — Adaptive Testing + Elo Engine

   Three layers, zero supervisor input:
     1. Gap profile  — Laplace-smoothed, recency-decayed miss rates per
                       dimension (state, belt, question type, air service),
                       recomputed from the event log at session start.
     2. Serving      — the profile is translated into the quiz engine's own
                       config weights (stateWeights / airWeight / etc.) with
                       a 70/30 targeted-vs-broad blend, plus a spaced
                       re-test queue for individually missed questions.
     3. Elo          — one comparable ability number per sorter. Every rated
                       question is a match vs a bucket difficulty. K=32 for
                       the first 50 rated answers, then 16. Re-tests are
                       unrated; daily rated cap stops grinding.

   Persistence: adaptive_state.json in the shared folder (IDB fallback),
   same pattern as quiz_config. Loadable in Node for unit tests.
══════════════════════════════════════════════ */

const Adaptive = (() => {

  /* ── Tunables ─────────────────────────────── */
  const T = {
    HALF_LIFE_DAYS: 14,      // recency decay half-life for profile counts
    MIX: 0.7,                // targeted share (0.7 = 70/30 targeted/broad)
    BASE_RATING: 1000,
    K_PROVISIONAL: 32,
    K_STABLE: 16,
    PROVISIONAL_N: 50,       // rated answers before K drops
    K_BUCKET: 8,             // bucket difficulty drift speed
    BUCKET_MIN: 400,
    BUCKET_MAX: 1600,
    DAILY_RATED_CAP: 150,
    RETEST_GAPS: [8, 25, 60],// questions until re-ask (per streak step)
    RETEST_RETIRE: 2,        // consecutive correct answers to retire an item
    RETEST_PROB: 0.25,       // chance a due re-test is injected per question
    QUEUE_MAX: 40,           // per-sorter re-test queue cap
    MIN_OBS: 3,              // decayed observations before a dim is trusted
    FRONTIER_P: 0.7,         // Elo serving sweet spot P(correct)
    FRONTIER_SD: 0.15,
    RUST_DAYS: 14,           // days idle before leaderboard rust marker
  };

  // Tier ladder — Bronze to Diamond.
  const TIERS = [
    { min: 1300, name: 'Diamond',  color: '#33A7D8' },
    { min: 1200, name: 'Platinum', color: '#78909C' },
    { min: 1100, name: 'Gold',     color: '#C9A227' },
    { min: 1000, name: 'Silver',   color: '#8E8E8E' },
    { min: -1e9, name: 'Bronze',   color: '#CD7F32' },
  ];

  /* ── Session state ────────────────────────── */
  let _enabled   = true;
  let _sorterId  = null;
  let _state     = null;    // full adaptive_state.json contents
  let _me        = null;    // _state.sorters[_sorterId]
  let _profile   = null;    // { dims: { key: {miss, n} }, overall }
  let _sessionStartRating = null;
  let _saveTimer = null;

  /* ─────────────────────────────────────────
     PURE MATH (exported for unit tests)
  ───────────────────────────────────────── */

  function expectedScore(rating, difficulty) {
    return 1 / (1 + Math.pow(10, (difficulty - rating) / 400));
  }

  function kFor(ratedCount) {
    return ratedCount < T.PROVISIONAL_N ? T.K_PROVISIONAL : T.K_STABLE;
  }

  function eloUpdate(rating, difficulty, correct, ratedCount) {
    const e = expectedScore(rating, difficulty);
    const s = correct ? 1 : 0;
    const newR = rating + kFor(ratedCount) * (s - e);
    let newD = difficulty + T.K_BUCKET * ((1 - s) - (1 - e));
    newD = Math.min(T.BUCKET_MAX, Math.max(T.BUCKET_MIN, newD));
    return { rating: newR, difficulty: newD, expected: e, delta: newR - rating };
  }

  function decayWeight(ageDays) {
    return Math.pow(0.5, Math.max(0, ageDays) / T.HALF_LIFE_DAYS);
  }

  // Laplace-smoothed decayed miss rate
  function missRate(missW, totalW) {
    return (missW + 1) / (totalW + 2);
  }

  // Bootstrap a bucket difficulty from a global miss rate
  function bootstrapDifficulty(globalMiss) {
    const m = Math.min(0.95, Math.max(0.05, globalMiss));
    const d = T.BASE_RATING + 400 * Math.log10(m / (1 - m));
    return Math.min(T.BUCKET_MAX, Math.max(T.BUCKET_MIN, d));
  }

  // Elo frontier bonus — peaks where P(correct) ≈ 0.7 (max learning + max
  // rating information), floors at 0.25 so nothing is ever fully starved.
  function frontierBonus(p) {
    const z = (p - T.FRONTIER_P) / T.FRONTIER_SD;
    return 0.25 + Math.exp(-0.5 * z * z);
  }

  function tierFor(rating) {
    return TIERS.find(t => rating >= t.min);
  }

  /* ─────────────────────────────────────────
     EVENT → DIMENSIONS
  ───────────────────────────────────────── */

  // Each event contributes to several profile dimensions.
  function dimsForEvent(e) {
    const dims = [];
    const qtype = e.qtype || _inferType(e);
    dims.push('type:' + qtype);
    if (qtype === 'air') {
      if (e.svc) dims.push('svc:' + e.svc);
    } else if (qtype === 'exception') {
      if (e.exc_id) dims.push('exc:' + e.exc_id);
    }
    if (e.state) dims.push('state:' + e.state);
    if (e.expected_belt !== undefined && e.expected_belt !== null) {
      dims.push('belt:' + e.expected_belt);
    }
    return dims;
  }

  // Primary Elo bucket for a question
  function bucketForEvent(e) {
    const qtype = e.qtype || _inferType(e);
    if (qtype === 'air')       return 'svc:' + (e.svc || 'AIR');
    if (qtype === 'exception') return 'exc:' + (e.exc_id || 'EXC');
    if (qtype === 'multidest')     return 'type:multidest';
    return 'belt:' + e.expected_belt;
  }

  // Legacy events (pre-adaptive) lack qtype — infer what we can.
  function _inferType(e) {
    if (e.expected_belt === 14 || e.expected_belt === 15) return 'air';
    if (e.multi_valid) return 'multidest';
    return 'ground';
  }

  /* ─────────────────────────────────────────
     PROFILE — per-sorter decayed miss rates
  ───────────────────────────────────────── */

  function buildProfile(events, sorterId, now) {
    const nowMs = now ? new Date(now).getTime() : Date.now();
    const dims = {};
    let totW = 0, missW = 0;
    for (const e of events) {
      if (String(e.sorter_id) !== String(sorterId)) continue;
      const age = (nowMs - new Date(e.timestamp || 0).getTime()) / 86400000;
      const w = decayWeight(isFinite(age) ? age : 365);
      totW += w;
      if (!e.correct) missW += w;
      for (const d of dimsForEvent(e)) {
        if (!dims[d]) dims[d] = { miss: 0, n: 0 };
        dims[d].n += w;
        if (!e.correct) dims[d].miss += w;
      }
    }
    return { dims, totalW: totW, overallMiss: missRate(missW, totW) };
  }

  // Global bucket difficulties bootstrapped from everyone's events
  function buildGlobalDifficulties(events, now) {
    const nowMs = now ? new Date(now).getTime() : Date.now();
    const agg = {};
    for (const e of events) {
      const age = (nowMs - new Date(e.timestamp || 0).getTime()) / 86400000;
      const w = decayWeight(isFinite(age) ? age : 365);
      const b = bucketForEvent(e);
      if (!agg[b]) agg[b] = { miss: 0, n: 0 };
      agg[b].n += w;
      if (!e.correct) agg[b].miss += w;
    }
    const out = {};
    for (const [b, a] of Object.entries(agg)) {
      if (a.n >= T.MIN_OBS) out[b] = bootstrapDifficulty(missRate(a.miss, a.n));
    }
    return out;
  }

  /* ─────────────────────────────────────────
     SERVING — profile → quiz config weights
  ───────────────────────────────────────── */

  function _dimMiss(profile, key) {
    const d = profile.dims[key];
    if (!d || d.n < T.MIN_OBS) return null;   // not enough signal
    return missRate(d.miss, d.n);
  }

  // Blend an admin base weight with an adaptive need multiplier (70/30).
  function _blend(base, needFactor, lo, hi) {
    const targeted = base * needFactor;
    const w = (1 - T.MIX) * base + T.MIX * targeted;
    return Math.min(hi, Math.max(lo, Math.round(w)));
  }

  function servingConfig(profile, baseCfg) {
    const cfg = { ...(baseCfg || {}) };
    const overall = Math.max(profile.overallMiss, 0.05);

    // Type-level weights — exception / air / multidest buckets
    const baseExc   = baseCfg && baseCfg.exceptionWeight ? baseCfg.exceptionWeight : 5;
    const baseAir   = baseCfg && baseCfg.airWeight       ? baseCfg.airWeight       : 3;
    const baseCchil = baseCfg && baseCfg.multidestWeight !== undefined ? baseCfg.multidestWeight : 8;

    const need = key => {
      const m = _dimMiss(profile, key);
      if (m === null) return 1;                       // no data → neutral
      return Math.min(3, Math.max(0.5, m / overall)); // 0.5×..3× need
    };

    cfg.exceptionWeight = _blend(baseExc,   need('type:exception'), 1, 20);
    cfg.airWeight       = _blend(baseAir,   need('type:air'),       1, 20);
    cfg.multidestWeight     = _blend(baseCchil, need('type:multidest'),     0, 20);

    // State weights — weak states drawn proportionally more often.
    // Admin boosts are respected as the floor.
    const stateWeights = { ...((baseCfg && baseCfg.stateWeights) || {}) };
    const stateMisses = [];
    for (const key of Object.keys(profile.dims)) {
      if (!key.startsWith('state:')) continue;
      const m = _dimMiss(profile, key);
      if (m !== null) stateMisses.push([key.slice(6), m]);
    }
    if (stateMisses.length >= 2) {
      const vals = stateMisses.map(x => x[1]);
      const lo = Math.min(...vals), hi = Math.max(...vals);
      for (const [st, m] of stateMisses) {
        const norm = hi > lo ? (m - lo) / (hi - lo) : 0;
        const adaptiveW = 1 + Math.round(9 * norm * T.MIX);  // 1..7
        stateWeights[st] = Math.max(stateWeights[st] || 1, adaptiveW);
      }
    }
    cfg.stateWeights = stateWeights;
    return cfg;
  }

  // Weighted pick among air rules / exception templates: mastery need ×
  // Elo frontier bonus. items: [{key, ref}]; returns ref.
  function pickTargeted(items, profile, rating, buckets) {
    if (!items.length) return null;
    const overall = Math.max(profile ? profile.overallMiss : 0.3, 0.05);
    let total = 0;
    const cum = [];
    for (const it of items) {
      const m = profile ? _dimMiss(profile, it.key) : null;
      const needF = m === null ? 1 : Math.min(3, Math.max(0.4, m / overall));
      const d = buckets && buckets[it.key] !== undefined ? buckets[it.key] : T.BASE_RATING;
      const p = expectedScore(rating || T.BASE_RATING, d);
      const w = ((1 - T.MIX) + T.MIX * needF) * frontierBonus(p);
      total += w;
      cum.push([total, it.ref]);
    }
    const r = Math.random() * total;
    for (const [end, ref] of cum) if (r < end) return ref;
    return cum[cum.length - 1][1];
  }

  /* ─────────────────────────────────────────
     SPACED RE-TEST QUEUE (pure helpers)
  ───────────────────────────────────────── */

  function queueAfterAnswer(queue, item, correct, answeredCount) {
    const q = queue.filter(x => x.id !== item.id);
    if (correct) {
      const streak = (item.streak || 0) + 1;
      if (streak >= T.RETEST_RETIRE) return q;        // mastered — retire
      const gap = T.RETEST_GAPS[Math.min(streak, T.RETEST_GAPS.length - 1)];
      q.push({ ...item, streak, due: answeredCount + gap });
    } else {
      q.push({ ...item, streak: 0, due: answeredCount + T.RETEST_GAPS[0] });
    }
    return q.slice(-T.QUEUE_MAX);
  }

  function queueAddMiss(queue, item, answeredCount) {
    const q = queue.filter(x => x.id !== item.id);
    q.push({ ...item, streak: 0, due: answeredCount + T.RETEST_GAPS[0] });
    return q.slice(-T.QUEUE_MAX);
  }

  function queueDue(queue, answeredCount) {
    return (queue || []).filter(x => x.due <= answeredCount);
  }

  /* ─────────────────────────────────────────
     STATE PERSISTENCE
  ───────────────────────────────────────── */

  function _blankSorter() {
    return {
      rating: T.BASE_RATING, ratedCount: 0, answered: 0,
      daily: { date: '', count: 0 },
      lastRatedAt: null, queue: [],
    };
  }

  async function _loadState() {
    let s = null;
    try { s = await Storage.getAdaptiveState(); } catch (_) {}
    if (!s || typeof s !== 'object' || Array.isArray(s)) s = {};
    if (!s.sorters) s.sorters = {};
    if (!s.buckets) s.buckets = {};
    if (!s.v) s.v = 1;
    return s;
  }

  function _scheduleSave() {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => { _persist(); }, 2000);
  }

  async function _persist() {
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    if (!_state) return;
    try { await Storage.saveAdaptiveState(_state); }
    catch (e) { console.error('[Adaptive] persist failed:', e); }
  }

  /* ─────────────────────────────────────────
     SESSION LIFECYCLE
  ───────────────────────────────────────── */

  async function beginSession(sorterId, baseCfg) {
    _sorterId = String(sorterId);
    _enabled  = !baseCfg || baseCfg.adaptiveEnabled !== false;
    if (!_enabled) return baseCfg;

    let events = [];
    try { events = await Storage.getEvents(); } catch (_) {}

    _state = await _loadState();
    if (!_state.sorters[_sorterId]) _state.sorters[_sorterId] = _blankSorter();
    _me = _state.sorters[_sorterId];
    _sessionStartRating = _me.rating;

    // Bootstrap any bucket difficulties we haven't learned yet
    const boot = buildGlobalDifficulties(events);
    for (const [b, d] of Object.entries(boot)) {
      if (_state.buckets[b] === undefined) _state.buckets[b] = Math.round(d);
    }

    _profile = buildProfile(events, _sorterId);
    return servingConfig(_profile, baseCfg);
  }

  function isActive() { return _enabled && !!_me; }

  // Returns a due re-test item (probabilistically) or null.
  function maybeRetest() {
    if (!isActive()) return null;
    const due = queueDue(_me.queue, _me.answered);
    if (!due.length) return null;
    // Force when backlog builds up; otherwise inject at RETEST_PROB
    if (due.length < 3 && Math.random() > T.RETEST_PROB) return null;
    return due[0];
  }

  // Weighted air-rule pick (called by quiz.js for air questions)
  function pickAirGroup(groups) {
    if (!isActive() || !groups.length) {
      return groups[Math.floor(Math.random() * groups.length)] || null;
    }
    const items = groups.map(g => ({ key: 'svc:' + g.rule.serviceCode, ref: g }));
    return pickTargeted(items, _profile, _me.rating, _state.buckets);
  }

  // Weighted exception-template pick
  function pickException(templates) {
    if (!isActive() || !templates.length) {
      return templates[Math.floor(Math.random() * templates.length)] || null;
    }
    const items = templates.map(t => ({ key: 'exc:' + t.id, ref: t }));
    return pickTargeted(items, _profile, _me.rating, _state.buckets);
  }

  /* ─────────────────────────────────────────
     ANSWER RECORDING — Elo + queue update
  ───────────────────────────────────────── */

  function recordAnswer(meta) {
    // meta: { qtype, svc, excId, state, zip, belts, correct, isRetest }
    if (!isActive()) return { rated: false, delta: 0, rating: null };

    _me.answered++;

    // live profile update so serving sharpens within the session
    if (_profile) {
      const pseudo = { qtype: meta.qtype, svc: meta.svc, exc_id: meta.excId,
        state: meta.state, expected_belt: (meta.belts || [])[0],
        correct: meta.correct, multi_valid: meta.qtype === 'multidest' };
      for (const d of dimsForEvent(pseudo)) {
        if (!_profile.dims[d]) _profile.dims[d] = { miss: 0, n: 0 };
        _profile.dims[d].n += 1;
        if (!meta.correct) _profile.dims[d].miss += 1;
      }
    }

    // Daily rated cap
    const today = new Date().toISOString().slice(0, 10);
    if (_me.daily.date !== today) _me.daily = { date: today, count: 0 };
    const capped = _me.daily.count >= T.DAILY_RATED_CAP;
    const rated  = !meta.isRetest && !capped;

    let delta = 0, expected = null;
    if (rated) {
      const bucket = bucketForEvent({ qtype: meta.qtype, svc: meta.svc,
        exc_id: meta.excId, expected_belt: (meta.belts || [])[0],
        multi_valid: meta.qtype === 'multidest' });
      const d0 = _state.buckets[bucket] !== undefined ? _state.buckets[bucket] : T.BASE_RATING;
      const r = eloUpdate(_me.rating, d0, meta.correct, _me.ratedCount);
      _me.rating = Math.round(r.rating * 10) / 10;
      _state.buckets[bucket] = Math.round(r.difficulty * 10) / 10;
      _me.ratedCount++;
      _me.daily.count++;
      _me.lastRatedAt = new Date().toISOString();
      delta = Math.round(r.delta);
      expected = Math.round(r.expected * 100) / 100;
    }

    // Re-test queue
    const item = {
      id: (meta.qtype || 'g') + ':' + (meta.excId || meta.svc || meta.zip || '?'),
      qtype: meta.qtype, zip: meta.zip, svc: meta.svc, excId: meta.excId,
    };
    if (meta.isRetest) {
      const existing = (_me.queue || []).find(x => x.id === item.id) || item;
      _me.queue = queueAfterAnswer(_me.queue || [], existing, meta.correct, _me.answered);
    } else if (!meta.correct) {
      _me.queue = queueAddMiss(_me.queue || [], item, _me.answered);
    }

    _scheduleSave();
    return { rated, delta, rating: Math.round(_me.rating), expected,
             tier: tierFor(_me.rating) };
  }

  function currentRating() { return _me ? Math.round(_me.rating) : null; }

  function sessionSummary() {
    if (!isActive()) return null;
    const rating = Math.round(_me.rating);
    const delta  = _sessionStartRating !== null
      ? Math.round(_me.rating - _sessionStartRating) : 0;

    // Focus areas: weakest trusted dimensions (states, types, services)
    const focus = [];
    if (_profile) {
      for (const [key, d] of Object.entries(_profile.dims)) {
        if (d.n < T.MIN_OBS) continue;
        focus.push([key, missRate(d.miss, d.n)]);
      }
      focus.sort((a, b) => b[1] - a[1]);
    }
    const named = focus.slice(0, 3).map(([key, m]) => ({
      label: _dimLabel(key), missPct: Math.round(m * 100),
    }));
    _persist();
    return { rating, delta, tier: tierFor(_me.rating), focus: named };
  }

  function _dimLabel(key) {
    const [kind, val] = key.split(':');
    if (kind === 'belt')  return (typeof BELT_NAMES !== 'undefined' && BELT_NAMES[val]) || ('Belt ' + val);
    if (kind === 'state') return val + ' ZIPs';
    if (kind === 'svc') {
      const names = { NDA: 'Next Day Air', NDA_EARLY: 'NDA Early A.M.',
        '2DA': '2nd Day Air', '2DA_SAT': '2nd Day Air Saturday',
        '3DA': '3 Day Select', '3DS': '3 Day Select', INTL: 'International air' };
      return names[val] || val;
    }
    if (kind === 'exc')   return 'Shipper-error ' + val;
    if (kind === 'type')  return { ground: 'Ground routing', exception: 'Shipper errors',
        air: 'Air sort', multidest: 'MULTIDEST states' }[val] || val;
    return key;
  }

  /* ─────────────────────────────────────────
     LEADERBOARD
  ───────────────────────────────────────── */

  async function getLeaderboard() {
    const state = _state || await _loadState();
    let roster = [];
    try { roster = await Storage.getSorterRoster(); } catch (_) {}
    const names = {};
    for (const r of roster) names[r.employee_id] = r.name || '';

    const now = Date.now();
    const rows = Object.entries(state.sorters).map(([id, s]) => {
      const idleDays = s.lastRatedAt
        ? (now - new Date(s.lastRatedAt).getTime()) / 86400000 : Infinity;
      return {
        id, name: names[id] || '',
        rating: Math.round(s.rating),
        tier: tierFor(s.rating),
        answered: s.answered || 0,
        ratedCount: s.ratedCount || 0,
        provisional: (s.ratedCount || 0) < T.PROVISIONAL_N,
        rust: idleDays > T.RUST_DAYS,
        lastRatedAt: s.lastRatedAt,
      };
    });
    rows.sort((a, b) => b.rating - a.rating);
    return rows;
  }

  async function renderLeaderboard(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const rows = await getLeaderboard();
    if (!rows.length) {
      el.innerHTML = `<div class="card"><div class="card-hd">Sort Aisle Ladder</div>
        <p style="font-size:12px;color:var(--text-soft);padding:8px 0;">
        No rated sessions yet — ratings appear after sorters answer adaptive questions.</p></div>`;
      return;
    }
    const tierLegend = TIERS.slice().reverse().map(t =>
      `<span class="ladder-tier-chip" style="--tier-c:${t.color}">${t.name}${
        t.min > -1e8 ? ' · ' + t.min + '+' : ''}</span>`).join('');
    el.innerHTML = `
      <div class="card">
        <div class="card-hd">Sort Aisle Ladder</div>
        <p style="font-size:12px;color:var(--text-soft);margin-bottom:10px;line-height:1.6;">
          Elo rating — scored against question difficulty, so a sorter facing hard air and
          exception questions can outrank one farming easy ground ZIPs. Re-tests are unrated.
          Certification still comes from accuracy, not the ladder.
        </p>
        <div class="ladder-legend">${tierLegend}</div>
        <table>
          <thead><tr><th>#</th><th>Sorter</th><th>Tier</th><th>Rating</th><th>Answered</th><th></th></tr></thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td style="font-weight:700;">${i + 1}</td>
                <td><strong>${r.name || r.id}</strong>${r.name ? ` <span style="color:var(--text-soft);font-size:11px;">${r.id}</span>` : ''}</td>
                <td><span class="ladder-tier-chip" style="--tier-c:${r.tier.color}">${r.tier.name}</span></td>
                <td style="font-weight:700;">${r.rating}${r.provisional ? '<span class="ladder-prov" title="Provisional — fewer than 50 rated answers">?</span>' : ''}</td>
                <td>${r.answered}</td>
                <td>${r.rust ? '<span class="ladder-rust" title="No rated answers in 14+ days">rusty</span>' : ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ─────────────────────────────────────────
     PUBLIC SURFACE
  ───────────────────────────────────────── */

  const api = {
    beginSession, isActive, maybeRetest, pickAirGroup, pickException,
    recordAnswer, currentRating, sessionSummary,
    getLeaderboard, renderLeaderboard, tierFor,
    flush: _persist,
    // pure internals exposed for unit tests
    _math: { expectedScore, eloUpdate, kFor, decayWeight, missRate,
             bootstrapDifficulty, frontierBonus, tierFor,
             buildProfile, buildGlobalDifficulties, servingConfig,
             pickTargeted, queueAfterAnswer, queueAddMiss, queueDue,
             dimsForEvent, bucketForEvent, T },
  };
  return api;

})();

// Node (unit tests)
if (typeof module !== 'undefined' && module.exports) module.exports = Adaptive;
