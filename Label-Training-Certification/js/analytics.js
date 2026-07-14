/* ══════════════════════════════════════════════
   analytics.js — Supervisor Dashboards

   Pure reducers + DOM renderers.
   All reducers receive events[] and return
   plain data objects — no side effects.
══════════════════════════════════════════════ */

const Analytics = (() => {

  /* ══════════════════════════════════════════════
     MODULE STATE
  ══════════════════════════════════════════════ */
  let _drilldownSorter = null;
  let _selectedBelt    = null;
  let _allSorterRows   = [];
  let _sorterAisleMap  = {};   // employee_id → sort_aisle, refreshed on renderSorters/_drilldown

  /* ══════════════════════════════════════════════
     REDUCERS — pure functions, no side effects
  ══════════════════════════════════════════════ */

  function overviewStats(events) {
    const total   = events.length;
    const correct = events.filter(e => e.correct).length;
    const sorters = new Set(events.map(e => e.sorter_id)).size;
    const errRate = total ? Math.round((1 - correct / total) * 100) : 0;
    return { total, correct, sorters, errRate };
  }

  function beltStats(events) {
    const stats = {};
    events.forEach(e => {
      const k = e.expected_belt;
      if (k === undefined) return;
      stats[k] ??= { total: 0, errors: 0 };
      stats[k].total++;
      if (!e.correct) stats[k].errors++;
    });
    Object.entries(stats).forEach(([k, s]) => {
      s.accuracy = s.total ? Math.round((1 - s.errors / s.total) * 100) : 100;
    });
    return stats;
  }

  function sorterStats(events) {
    const stats = {};
    events.forEach(e => {
      stats[e.sorter_id] ??= { total: 0, correct: 0 };
      stats[e.sorter_id].total++;
      if (e.correct) stats[e.sorter_id].correct++;
    });
    Object.entries(stats).forEach(([k, s]) => {
      s.accuracy = s.total ? Math.round(s.correct / s.total * 100) : 0;
    });
    return stats;
  }

  function missortMatrix(events) {
    const errs = events.filter(e => !e.correct);
    if (!errs.length) return null;
    const bset = new Set([...errs.map(e => e.expected_belt), ...errs.map(e => e.actual_belt)]);
    const belts = [...bset].filter(b => b !== undefined).sort((a, b) => a - b);
    const mx = {};
    errs.forEach(e => {
      mx[e.expected_belt] ??= {};
      mx[e.expected_belt][e.actual_belt] ??= 0;
      mx[e.expected_belt][e.actual_belt]++;
    });
    return { belts, mx };
  }

  function teamTrend(events) {
    if (!events.length) return { current7: null, prior7: null, recentCount: 0, priorCount: 0 };
    const now   = Date.now();
    const day   = 86400000;
    const cut7  = now - 7 * day;
    const cut14 = now - 14 * day;
    const recent = events.filter(e => new Date(e.timestamp).getTime() >= cut7);
    const prior  = events.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= cut14 && t < cut7;
    });
    const acc = arr => arr.length ? Math.round(arr.filter(e => e.correct).length / arr.length * 100) : null;
    return { current7: acc(recent), prior7: acc(prior), recentCount: recent.length, priorCount: prior.length };
  }

  function worstBelt(events) {
    const stats = beltStats(events);
    const qualifying = Object.entries(stats).filter(([, s]) => s.total >= 5);
    if (!qualifying.length) return null;
    const [bi, s] = qualifying.sort((a, b) => a[1].accuracy - b[1].accuracy)[0];
    return { beltIdx: parseInt(bi), ...s };
  }

  function worstSorter(events) {
    const stats = sorterStats(events);
    const qualifying = Object.entries(stats).filter(([, s]) => s.total >= 10);
    if (!qualifying.length) return null;
    const [id, s] = qualifying.sort((a, b) => a[1].accuracy - b[1].accuracy)[0];
    return { id, ...s };
  }

  function sorterSessions(events, sorterId) {
    const CHUNK = 15;
    const ev = events
      .filter(e => e.sorter_id === sorterId)
      .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    const chunks = [];
    for (let i = 0; i < ev.length; i += CHUNK) {
      const chunk   = ev.slice(i, i + CHUNK);
      const correct = chunk.filter(e => e.correct).length;
      chunks.push({
        date:     (chunk[0].timestamp || '').slice(0, 10),
        accuracy: Math.round(correct / chunk.length * 100),
        total:    chunk.length,
        correct,
      });
    }
    return chunks;
  }

  function sorterBeltBreakdown(events, sorterId) {
    const ev = events.filter(e => e.sorter_id === sorterId);
    const byBelt = {};
    ev.forEach(e => {
      if (e.expected_belt === undefined) return;
      byBelt[e.expected_belt] ??= { total: 0, correct: 0 };
      byBelt[e.expected_belt].total++;
      if (e.correct) byBelt[e.expected_belt].correct++;
    });
    return Object.entries(byBelt)
      .map(([bi, s]) => ({
        beltIdx:  parseInt(bi),
        total:    s.total,
        correct:  s.correct,
        accuracy: Math.round(s.correct / s.total * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  function sorterMissorts(events, sorterId) {
    const errs = events.filter(e => e.sorter_id === sorterId && !e.correct);
    const patterns = {};
    errs.forEach(e => {
      const k = `${e.expected_belt}|${e.actual_belt}`;
      patterns[k] = (patterns[k] || 0) + 1;
    });
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k, count]) => {
        const [exp, act] = k.split('|').map(Number);
        return { expected: exp, actual: act, count };
      });
  }

  function beltAnalysisData(events, beltIdx) {
    const asExpected = events.filter(e => e.expected_belt === beltIdx);
    const misses     = asExpected.filter(e => !e.correct);

    const fnBySorter = {};
    asExpected.forEach(e => {
      fnBySorter[e.sorter_id] ??= { total: 0, errors: 0 };
      fnBySorter[e.sorter_id].total++;
      if (!e.correct) fnBySorter[e.sorter_id].errors++;
    });

    const choseInstead = {};
    misses.forEach(e => {
      choseInstead[e.actual_belt] = (choseInstead[e.actual_belt] || 0) + 1;
    });

    const falsePos = events.filter(e => e.actual_belt === beltIdx && !e.correct);
    const fpBySorter = {};
    falsePos.forEach(e => {
      fpBySorter[e.sorter_id] = (fpBySorter[e.sorter_id] || 0) + 1;
    });
    const shouldBe = {};
    falsePos.forEach(e => {
      shouldBe[e.expected_belt] = (shouldBe[e.expected_belt] || 0) + 1;
    });

    return {
      total:    asExpected.length,
      fnCount:  misses.length,
      accuracy: asExpected.length
        ? Math.round((asExpected.length - misses.length) / asExpected.length * 100)
        : null,
      fnBySorter: Object.entries(fnBySorter)
        .map(([id, s]) => ({ id, ...s, rate: Math.round(s.errors / s.total * 100) }))
        .sort((a, b) => b.rate - a.rate),
      choseInstead: Object.entries(choseInstead)
        .sort((a, b) => b[1] - a[1])
        .map(([bi, count]) => ({ beltIdx: parseInt(bi), count })),
      fpCount:   falsePos.length,
      fpBySorter: Object.entries(fpBySorter)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({ id, count })),
      shouldBe: Object.entries(shouldBe)
        .sort((a, b) => b[1] - a[1])
        .map(([bi, count]) => ({ beltIdx: parseInt(bi), count })),
    };
  }

  // Knowledge Map — filter state (persists across tab switches)
  let _kmStates  = new Set();   // selected US state codes
  let _kmSpecial = new Set();   // 'multidest' | 'air'
  let _kmEvents  = [];
  let _kmTmap    = null;

  const _KM_PRESETS = {
    northeast: { states: ['MA','ME','VT','NH','NJ','RI','CT'], special: [] },
    multidest:     { states: MULTIDEST_STATES,                         special: [] },
    air:       { states: [],                                    special: ['air'] },
  };

  const _KM_ALL_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  ];

  function aisleStats(events, roster) {
    const sorterAisle = {};
    roster.forEach(s => { if (s.sort_aisle) sorterAisle[s.employee_id] = s.sort_aisle; });

    const AISLES = ['Sort-1', 'Sort-2', 'Sort-3', 'Sort-4'];
    const data   = {};
    AISLES.forEach(a => {
      data[a] = { total: 0, correct: 0, sorters: new Set(), beltErrors: {}, sorterMap: {} };
    });

    events.forEach(e => {
      const a = sorterAisle[e.sorter_id];
      if (!a || !data[a]) return;
      const d = data[a];
      d.total++;
      if (e.correct) d.correct++;
      d.sorters.add(e.sorter_id);
      if (!e.correct && e.expected_belt != null)
        d.beltErrors[e.expected_belt] = (d.beltErrors[e.expected_belt] || 0) + 1;
      d.sorterMap[e.sorter_id] ??= { total: 0, correct: 0 };
      d.sorterMap[e.sorter_id].total++;
      if (e.correct) d.sorterMap[e.sorter_id].correct++;
    });

    return AISLES.map(a => {
      const d         = data[a];
      const accuracy  = d.total ? Math.round(d.correct / d.total * 100) : null;
      const topMissE  = Object.entries(d.beltErrors).sort((x, y) => y[1] - x[1])[0];
      const sorterList = Object.entries(d.sorterMap)
        .map(([id, s]) => ({ id, ...s, accuracy: Math.round(s.correct / s.total * 100) }))
        .sort((x, y) => y.accuracy - x.accuracy);
      return {
        aisle: a, total: d.total, correct: d.correct, accuracy,
        sorterCount: d.sorters.size,
        topMissBelt:  topMissE ? parseInt(topMissE[0]) : null,
        topMissCount: topMissE ? topMissE[1] : 0,
        sorterList,
      };
    }).sort((a, b) => {
      if (a.accuracy === null && b.accuracy === null) return 0;
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      return b.accuracy - a.accuracy;
    });
  }

  /* ══════════════════════════════════════════════
     PHASE 1 REDUCERS — pure aggregations, no side effects
  ══════════════════════════════════════════════ */

  // Helper — get YYYY-MM-DD for a timestamp (handles ISO strings + ms)
  function _dayKey(ts) {
    if (!ts) return null;
    const s = String(ts);
    if (s.length >= 10 && s[4] === '-') return s.slice(0, 10);
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  // Build a sorted list of the last N day keys ending today (inclusive)
  function _recentDayKeys(days) {
    const out = [];
    const day = 86400000;
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      out.push(new Date(now - i * day).toISOString().slice(0, 10));
    }
    return out;
  }

  // Per-aisle daily accuracy series — { aisle, points: [{date, accuracy, total}] }
  function aisleDailySeries(events, roster, days = 7) {
    const sorterAisle = {};
    roster.forEach(s => { if (s.sort_aisle) sorterAisle[s.employee_id] = s.sort_aisle; });
    const AISLES = ['Sort-1', 'Sort-2', 'Sort-3', 'Sort-4'];
    const dayKeys = _recentDayKeys(days);
    const grid = {};
    dayKeys.forEach(k => {
      grid[k] = {};
      AISLES.forEach(a => { grid[k][a] = { total: 0, correct: 0 }; });
    });
    events.forEach(e => {
      const a = sorterAisle[e.sorter_id];
      const k = _dayKey(e.timestamp);
      if (!a || !grid[k]) return;
      const b = grid[k][a];
      if (!b) return;
      b.total++;
      if (e.correct) b.correct++;
    });
    return AISLES.map(aisle => ({
      aisle,
      points: dayKeys.map(date => ({
        date,
        total: grid[date][aisle].total,
        accuracy: grid[date][aisle].total
          ? Math.round(grid[date][aisle].correct / grid[date][aisle].total * 100)
          : null,
      })),
    }));
  }

  // Team-wide daily accuracy series
  function teamDailySeries(events, days = 7) {
    const dayKeys = _recentDayKeys(days);
    const grid = {};
    dayKeys.forEach(k => { grid[k] = { total: 0, correct: 0 }; });
    events.forEach(e => {
      const k = _dayKey(e.timestamp);
      if (!grid[k]) return;
      grid[k].total++;
      if (e.correct) grid[k].correct++;
    });
    return dayKeys.map(date => ({
      date,
      total: grid[date].total,
      accuracy: grid[date].total
        ? Math.round(grid[date].correct / grid[date].total * 100)
        : null,
    }));
  }

  // Team-wide daily volume (for the Sort Events sparkline)
  function teamDailyVolume(events, days = 7) {
    return teamDailySeries(events, days).map(p => ({ date: p.date, value: p.total }));
  }

  // Team-wide daily active sorter count
  function teamDailyActiveSorters(events, days = 7) {
    const dayKeys = _recentDayKeys(days);
    const grid = {};
    dayKeys.forEach(k => { grid[k] = new Set(); });
    events.forEach(e => {
      const k = _dayKey(e.timestamp);
      if (grid[k]) grid[k].add(e.sorter_id);
    });
    return dayKeys.map(date => ({ date, value: grid[date].size }));
  }

  // Sorter of the Week — top accuracy in last N days, min attempts threshold
  function sorterOfWeek(events, days = 7, minAttempts = 20) {
    const day = 86400000;
    const cut = Date.now() - days * day;
    const recent = events.filter(e => new Date(e.timestamp).getTime() >= cut);
    if (!recent.length) return null;
    const stats = {};
    recent.forEach(e => {
      stats[e.sorter_id] ??= { total: 0, correct: 0 };
      stats[e.sorter_id].total++;
      if (e.correct) stats[e.sorter_id].correct++;
    });
    const ranked = Object.entries(stats)
      .map(([id, s]) => ({ id, ...s, accuracy: Math.round(s.correct / s.total * 100) }))
      .filter(r => r.total >= minAttempts)
      .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
    if (!ranked.length) return null;
    const winner = ranked[0];

    // Half-split improvement: compare last half vs first half of recent events for this sorter
    const myEvents = recent.filter(e => e.sorter_id === winner.id)
      .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    const half = Math.floor(myEvents.length / 2);
    let improvement = null;
    if (half >= 5) {
      const firstHalf = myEvents.slice(0, half);
      const lastHalf  = myEvents.slice(myEvents.length - half);
      const a1 = Math.round(firstHalf.filter(e => e.correct).length / firstHalf.length * 100);
      const a2 = Math.round(lastHalf.filter(e => e.correct).length / lastHalf.length * 100);
      improvement = a2 - a1;
    }
    return { ...winner, improvement };
  }

  // Per-aisle weekly digest: biggest belt swing this week vs prior week
  function aisleWeeklyDigest(events, roster, aisleName, days = 7) {
    const sorterAisle = {};
    roster.forEach(s => { if (s.sort_aisle) sorterAisle[s.employee_id] = s.sort_aisle; });
    const day = 86400000;
    const now = Date.now();
    const aEvents = events.filter(e => sorterAisle[e.sorter_id] === aisleName);
    const cutA = now - days * day;
    const cutB = now - 2 * days * day;
    const thisWeek  = aEvents.filter(e => new Date(e.timestamp).getTime() >= cutA);
    const priorWeek = aEvents.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= cutB && t < cutA;
    });
    const beltErrs = arr => {
      const m = {};
      arr.forEach(e => {
        if (e.correct || e.expected_belt == null) return;
        m[e.expected_belt] = (m[e.expected_belt] || 0) + 1;
      });
      return m;
    };
    const tw = beltErrs(thisWeek), pw = beltErrs(priorWeek);
    const allBelts = new Set([...Object.keys(tw), ...Object.keys(pw)]);
    const swings = [];
    allBelts.forEach(bi => {
      const delta = (tw[bi] || 0) - (pw[bi] || 0);
      if (delta !== 0) swings.push({ beltIdx: parseInt(bi), delta });
    });
    swings.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const top = swings[0] || null;
    if (!top) return { line: 'Steady — no notable swings.', tone: 'flat' };
    if (top.delta < 0) {
      return {
        line: `Fixed ${_beltName(top.beltIdx)}.`,
        sub:  `${Math.abs(top.delta)} fewer error${Math.abs(top.delta) !== 1 ? 's' : ''} than last week`,
        tone: 'good',
      };
    }
    return {
      line: `${_beltName(top.beltIdx)} regressed.`,
      sub:  `${top.delta} more error${top.delta !== 1 ? 's' : ''} than last week`,
      tone: 'bad',
    };
  }

  // Time-of-day × day-of-week heatmap (last N days)
  function heatmapData(events, days = 30) {
    const day = 86400000;
    const cut = Date.now() - days * day;
    const recent = events.filter(e => new Date(e.timestamp).getTime() >= cut);
    // grid[dow][hour] = { total, errors }
    const grid = {};
    for (let d = 0; d < 7; d++) {
      grid[d] = {};
      for (let h = 0; h < 24; h++) grid[d][h] = { total: 0, errors: 0 };
    }
    recent.forEach(e => {
      const t = new Date(e.timestamp);
      if (isNaN(t.getTime())) return;
      const d = t.getDay(), h = t.getHours();
      grid[d][h].total++;
      if (!e.correct) grid[d][h].errors++;
    });
    return grid;
  }

  /* ══════════════════════════════════════════════
     DISPLAY HELPERS
  ══════════════════════════════════════════════ */

  // Tiny sparkline SVG for KPI cards
  function _sparklineSVG(values, color, w = 70, h = 24) {
    if (!values || !values.length) return '';
    const nums = values.map(v => v == null ? null : v);
    const defined = nums.filter(v => v != null);
    if (defined.length < 2) return '';
    const min = Math.min(...defined), max = Math.max(...defined);
    const range = Math.max(0.01, max - min);
    const pts = nums.map((v, i) => {
      if (v == null) return null;
      const x = (i / (nums.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).filter(Boolean).join(' ');
    const fill = `0,${h} ${pts} ${w},${h}`;
    return `<svg class="kpi-spark" viewBox="0 0 ${w} ${h}">
      <polygon points="${fill}" fill="${color}" opacity="0.14"/>
      <polyline points="${pts}" stroke="${color}" stroke-width="1.6" fill="none"/>
    </svg>`;
  }

  // Multi-line time-series chart for the aisles tab
  function _aisleSeriesSVG(series, dayKeys) {
    const W = 1100, H = 280, padL = 44, padR = 12, padT = 14, padB = 32;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const n = dayKeys.length;
    const yMin = 70, yMax = 100, yRange = yMax - yMin;
    const xOf = i => padL + (n < 2 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yOf = v => padT + (1 - (v - yMin) / yRange) * innerH;
    const yTicks = [70, 80, 90, 100];

    const COLORS  = { 'Sort-1': '#9be88f', 'Sort-2': '#ffb347', 'Sort-3': '#ff8a4d', 'Sort-4': '#ff7b7b' };
    const lines = series.map(s => {
      const color = COLORS[s.aisle] || '#ffb347';
      const pts = s.points.map((p, i) => p.accuracy == null ? null : `${xOf(i)},${yOf(p.accuracy)}`)
        .filter(Boolean).join(' ');
      const dots = s.points.map((p, i) => p.accuracy == null ? '' :
        `<circle cx="${xOf(i)}" cy="${yOf(p.accuracy)}" r="4" fill="#1c1108" stroke="${color}" stroke-width="2"/>`
      ).join('');
      return `<polyline points="${pts}" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
    }).join('');

    const yGrid = yTicks.map(v => `
      <line x1="${padL}" y1="${yOf(v)}" x2="${W - padR}" y2="${yOf(v)}" stroke="rgba(255,255,255,0.10)" stroke-dasharray="2 4"/>
      <text x="${padL - 8}" y="${yOf(v) + 4}" font-size="11" fill="#a89070" font-family="JetBrains Mono, monospace" text-anchor="end">${v}%</text>
    `).join('');

    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const xLabels = dayKeys.map((k, i) => {
      const d = new Date(k);
      const lbl = isNaN(d.getTime()) ? k.slice(5) : labels[d.getDay()];
      return `<text x="${xOf(i)}" y="${H - 8}" font-size="11" fill="#a89070" font-family="JetBrains Mono, monospace" text-anchor="middle">${lbl}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" class="aisle-series-svg" preserveAspectRatio="xMidYMid meet">
      ${yGrid}${lines}${xLabels}
    </svg>`;
  }

  /* ══════════════════════════════════════════════
     DISPLAY HELPERS (continued)
  ══════════════════════════════════════════════ */

  function _beltName(bi) {
    return (typeof BELT_NAMES !== 'undefined' && BELT_NAMES[bi]) || 'Belt ' + bi;
  }

  function _beltSwatch(bi) {
    const col = (typeof BELT_COLORS !== 'undefined' && BELT_COLORS[bi]) || '#ccc';
    return `<span class="sw" style="background:${col}"></span>`;
  }

  function _trendArrow(current, prior) {
    if (current === null || prior === null) return '';
    const diff = current - prior;
    if (Math.abs(diff) < 2) return '<span class="trend-flat">—</span>';
    const cls = diff > 0 ? 'trend-up' : 'trend-down';
    return `<span class="${cls}">${diff > 0 ? '+' : ''}${diff}%</span>`;
  }

  function _trendSVG(sessions) {
    if (sessions.length < 2) {
      return '<p style="font-size:11px;color:var(--text-soft);padding:8px 0;">Need at least 2 sessions to show trend.</p>';
    }
    const W = 420, H = 90, PX = 14, PY = 10;
    const iW = W - PX * 2, iH = H - PY * 2;
    const n  = sessions.length;
    const xOf = i => PX + (n < 2 ? iW / 2 : (i / (n - 1)) * iW);
    const yOf = v => PY + (1 - v / 100) * iH;

    const pts     = sessions.map((s, i) => `${xOf(i)},${yOf(s.accuracy)}`).join(' ');
    const fillPts = `${xOf(0)},${H + PY} ` +
      sessions.map((s, i) => `${xOf(i)},${yOf(s.accuracy)}`).join(' ') +
      ` ${xOf(n - 1)},${H + PY}`;

    const dots = sessions.map((s, i) => {
      const col = s.accuracy >= 90 ? '#2E7D32' : s.accuracy >= 75 ? '#E65100' : '#C62828';
      return `<circle cx="${xOf(i)}" cy="${yOf(s.accuracy)}" r="3.5" fill="${col}" stroke="#fff" stroke-width="1.2"/>`;
    }).join('');

    // Date labels for last 4 sessions
    const labelCount = Math.min(4, n);
    const labels = [];
    for (let li = 0; li < labelCount; li++) {
      const idx = n - labelCount + li;
      labels.push(
        `<text x="${xOf(idx)}" y="${H + PY - 1}" font-size="7.5" text-anchor="middle" fill="#8B5E3C">${sessions[idx].date.slice(5)}</text>`
      );
    }

    return `<div class="trend-svg-wrap"><svg viewBox="0 0 ${W} ${H + PY + 12}" width="100%">
      <polygon points="${fillPts}" fill="rgba(53,28,21,0.06)"/>
      <line x1="${PX}" y1="${yOf(90)}" x2="${W - PX}" y2="${yOf(90)}"
        stroke="#2E7D32" stroke-width="0.9" stroke-dasharray="4,3" opacity="0.55"/>
      <line x1="${PX}" y1="${yOf(75)}" x2="${W - PX}" y2="${yOf(75)}"
        stroke="#E65100" stroke-width="0.9" stroke-dasharray="4,3" opacity="0.55"/>
      <text x="${PX}" y="${yOf(90) - 3}" font-size="7" fill="#2E7D32" opacity="0.7">90%</text>
      <text x="${PX}" y="${yOf(75) - 3}" font-size="7" fill="#E65100" opacity="0.7">75%</text>
      <polyline points="${pts}" fill="none" stroke="#5C3A2A" stroke-width="2"
        stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      ${labels.join('')}
    </svg></div>`;
  }

  /* Navigate directly to a sorter drilldown from another tab.
     Bypasses App.svTab so there's no async race with renderSorters. */
  function jumpToSorter(sorterId) {
    const TABS = ['overview', 'belts', 'sorters', 'aisles', 'matrix', 'knowledge', 'overlays', 'roster', 'flags'];
    TABS.forEach(t => {
      const el = document.getElementById('sv-' + t);
      if (el) el.style.display = t === 'sorters' ? 'block' : 'none';
    });
    const tabBtns = document.querySelectorAll('#page-supervisor .tabs .tab');
    TABS.forEach((t, i) => {
      if (tabBtns[i]) tabBtns[i].classList.toggle('on', t === 'sorters');
    });
    _drilldown(sorterId);
  }

  function _esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ══════════════════════════════════════════════
     RENDERER — OVERVIEW
  ══════════════════════════════════════════════ */

  async function renderOverview() {
    const events = await Storage.getEvents().catch(() => []);
    const s      = overviewStats(events);
    const trend  = teamTrend(events);
    const wb     = worstBelt(events);
    const ws     = worstSorter(events);

    // ── PHASE 3: Sorter of the Week ──
    const sotw = sorterOfWeek(events, 7, 20);
    let sotwEl = document.getElementById('sv-sotw');
    if (!sotwEl) {
      sotwEl = document.createElement('div');
      sotwEl.id = 'sv-sotw';
      const met = document.getElementById('sv-met');
      met.parentNode.insertBefore(sotwEl, met);
    }
    if (sotw) {
      const impHtml = sotw.improvement != null && sotw.improvement > 1
        ? `<div class="sotw-stat">
             <div class="sotw-stat-val">+${sotw.improvement}pp</div>
             <div class="sotw-stat-lbl">improved this week</div>
           </div>`
        : '';
      sotwEl.innerHTML = `
        <div class="sotw-card">
          <div>
            <div class="sotw-eyebrow">★ Sorter of the week</div>
            <div class="sotw-name">${sotw.id}</div>
            <div class="sotw-sub">${sotw.correct} correct of ${sotw.total} attempts · last 7 days</div>
          </div>
          <div class="sotw-stat">
            <div class="sotw-stat-val">${sotw.accuracy}%</div>
            <div class="sotw-stat-lbl">accuracy</div>
          </div>
          <div class="sotw-stat">
            <div class="sotw-stat-val">${sotw.total}</div>
            <div class="sotw-stat-lbl">attempts</div>
          </div>
          ${impHtml}
        </div>`;
      sotwEl.style.display = '';
    } else {
      sotwEl.style.display = 'none';
    }

    // ── PHASE 3: Sparkline KPIs ──
    const accSeries     = teamDailySeries(events, 7).map(p => p.accuracy);
    const volSeries     = teamDailyVolume(events, 7).map(p => p.value);
    const sorterSeries  = teamDailyActiveSorters(events, 7).map(p => p.value);
    const errSeries     = teamDailySeries(events, 7).map(p => p.accuracy == null ? null : 100 - p.accuracy);

    const totalAcc = s.total ? Math.round(s.correct / s.total * 100) : 0;

    document.getElementById('sv-met').innerHTML = `
      <div class="metric">
        <div class="metric-lbl" style="margin-bottom:6px;">Total Events</div>
        <div class="metric-spark-row">
          <div class="metric-val">${s.total.toLocaleString()}</div>
          ${_sparklineSVG(volSeries, '#ffb347')}
        </div>
      </div>
      <div class="metric">
        <div class="metric-lbl" style="margin-bottom:6px;">Accuracy</div>
        <div class="metric-spark-row">
          <div class="metric-val">${totalAcc}%</div>
          ${_sparklineSVG(accSeries, '#9be88f')}
        </div>
      </div>
      <div class="metric">
        <div class="metric-lbl" style="margin-bottom:6px;">Error Rate</div>
        <div class="metric-spark-row">
          <div class="metric-val">${s.errRate}%</div>
          ${_sparklineSVG(errSeries, '#ff7b7b')}
        </div>
      </div>
      <div class="metric">
        <div class="metric-lbl" style="margin-bottom:6px;">Active Sorters</div>
        <div class="metric-spark-row">
          <div class="metric-val">${s.sorters}</div>
          ${_sparklineSVG(sorterSeries, '#ffd084')}
        </div>
      </div>
    `;

    // Callout cards
    const calloutEl = document.getElementById('sv-callouts');
    if (calloutEl) {
      const parts = [];

      if (trend.current7 !== null) {
        const arrow  = _trendArrow(trend.current7, trend.prior7);
        const cls    = trend.current7 >= 90 ? '' : trend.current7 >= 75 ? 'callout-warn' : 'callout-alert';
        const subTxt = trend.prior7 !== null
          ? `${trend.recentCount} events &nbsp;·&nbsp; vs ${trend.prior7}% prior week ${arrow}`
          : `${trend.recentCount} events this week`;
        parts.push(`<div class="callout-card ${cls}">
          <div class="callout-lbl">7-Day Accuracy</div>
          <div class="callout-val">${trend.current7}%</div>
          <div class="callout-sub">${subTxt}</div>
        </div>`);
      }

      if (wb) {
        const cls = wb.accuracy >= 90 ? '' : wb.accuracy >= 75 ? 'callout-warn' : 'callout-alert';
        parts.push(`<div class="callout-card ${cls}">
          <div class="callout-lbl">Biggest Problem Belt</div>
          <div class="callout-val">${_beltName(wb.beltIdx)}</div>
          <div class="callout-sub">${wb.accuracy}% accuracy &nbsp;·&nbsp; ${wb.errors} errors of ${wb.total}</div>
        </div>`);
      }

      if (ws) {
        const cls = ws.accuracy >= 75 ? 'callout-warn' : 'callout-alert';
        parts.push(`<div class="callout-card ${cls}">
          <div class="callout-lbl">Sorter Needs Coaching</div>
          <div class="callout-val">${ws.id}</div>
          <div class="callout-sub">${ws.accuracy}% accuracy &nbsp;·&nbsp; ${ws.total} attempts</div>
        </div>`);
      }

      if (parts.length) {
        calloutEl.innerHTML = parts.join('');
        calloutEl.style.display = 'grid';
      } else {
        calloutEl.innerHTML = '';
        calloutEl.style.display = 'none';
      }
    }

    const recent = events.slice(-20).reverse();
    document.querySelector('#sv-recent tbody').innerHTML =
      recent.map(e => `
        <tr>
          <td><strong>${e.sorter_id || '—'}</strong></td>
          <td><strong>${e.zip || '—'}</strong></td>
          <td style="font-size:11px;">${_beltName(e.expected_belt)}</td>
          <td style="font-size:11px;">${_beltName(e.actual_belt)}</td>
          <td>
            <span class="badge ${e.correct ? 'b-ok' : 'b-err'}">${e.correct ? 'Correct' : 'Wrong'}</span>
            ${e.multi_valid ? ' <span class="badge b-info">multi</span>' : ''}
          </td>
          <td style="color:var(--text-soft);font-size:11px;">${(e.timestamp || '').slice(11, 19)}</td>
        </tr>
      `).join('') ||
      '<tr><td colspan="6" style="color:var(--text-soft);padding:16px;">No events recorded yet</td></tr>';

    const mode = Storage.getMode();
    document.getElementById('ov-storage-mode').textContent =
      mode === 'shared'
        ? `Shared drive: ${Storage.getFolderName()}`
        : 'Local storage (IndexedDB) — connect shared folder to sync across computers';
    document.getElementById('ov-storage-mode').className =
      mode === 'shared' ? 'banner banner-ok' : 'banner banner-warn';
  }

  /* ══════════════════════════════════════════════
     RENDERER — BELT ANALYSIS
  ══════════════════════════════════════════════ */

  async function renderBelts() {
    const events    = await Storage.getEvents().catch(() => []);
    const wrap      = document.getElementById('sv-belts');
    if (!wrap) return;

    const statsRows = Object.entries(beltStats(events))
      .sort((a, b) => a[1].accuracy - b[1].accuracy);

    wrap.innerHTML = `
      <div class="card">
        <div class="card-hd">Belt Deep Dive</div>
        <div class="belt-sel-row">
          <label class="lbl" style="white-space:nowrap;margin-bottom:0;">Select Belt</label>
          <select class="inp" id="belt-select" onchange="Analytics._onBeltSelect(this.value)">
            <option value="">— Choose a belt to analyze —</option>
            ${BELT_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('')}
          </select>
        </div>
        <div id="belt-analysis-panel" style="margin-top:18px;"></div>
      </div>
      <div class="card">
        <div class="card-hd">Error Rate by Belt — worst first</div>
        <p style="font-size:11px;color:var(--text-soft);margin-bottom:10px;">
          Click a row to deep-dive that belt.
        </p>
        <table>
          <thead>
            <tr><th>Belt</th><th>Total</th><th>Errors</th><th>Accuracy</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${statsRows.map(([bi, s]) => {
              const cls = s.accuracy >= 90 ? 'b-ok' : s.accuracy >= 75 ? 'b-warn' : 'b-err';
              return `<tr style="cursor:pointer;"
                onclick="Analytics._onBeltSelect('${bi}');
                         document.getElementById('belt-select').value='${bi}';
                         document.getElementById('belt-select').scrollIntoView({behavior:'smooth',block:'nearest'});">
                <td>${_beltSwatch(parseInt(bi))}${_beltName(parseInt(bi))}</td>
                <td>${s.total}</td>
                <td>${s.errors}</td>
                <td><strong>${s.accuracy}%</strong></td>
                <td><span class="badge ${cls}">${
                  s.accuracy >= 90 ? 'Good' : s.accuracy >= 75 ? 'Watch' : 'At Risk'
                }</span></td>
              </tr>`;
            }).join('') ||
            '<tr><td colspan="5" style="color:var(--text-soft);padding:16px;">No events yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    if (_selectedBelt !== null) {
      const sel = document.getElementById('belt-select');
      if (sel) sel.value = String(_selectedBelt);
      _renderBeltPanel(_selectedBelt, events);
    }
  }

  function _onBeltSelect(val) {
    _selectedBelt = val === '' ? null : parseInt(val);
    if (_selectedBelt === null) {
      const panel = document.getElementById('belt-analysis-panel');
      if (panel) panel.innerHTML = '';
      return;
    }
    Storage.getEvents().catch(() => []).then(events => _renderBeltPanel(_selectedBelt, events));
  }

  function _renderBeltPanel(beltIdx, events) {
    const panel = document.getElementById('belt-analysis-panel');
    if (!panel) return;
    const d     = beltAnalysisData(events, beltIdx);
    const bName = _beltName(beltIdx);

    if (d.total === 0 && d.fpCount === 0) {
      panel.innerHTML = `<p style="font-size:13px;color:var(--text-soft);">No events recorded for <strong>${bName}</strong> yet.</p>`;
      return;
    }

    let h = `<div class="analysis-grid">`;

    /* Left panel: when this IS the correct belt */
    h += `<div class="analysis-panel">
      <div class="analysis-ph">When correct belt is ${bName}</div>
      <div class="analysis-kpi">
        <span class="analysis-big">${d.accuracy !== null ? d.accuracy + '%' : 'N/A'}</span>
        <span class="analysis-sub">${d.total} events &nbsp;·&nbsp; ${d.fnCount} missed</span>
      </div>`;

    if (d.choseInstead.length) {
      h += `<div class="analysis-section-lbl">Sorted to instead:</div>
        <table><thead><tr><th>Wrong Belt</th><th>Count</th></tr></thead><tbody>
        ${d.choseInstead.slice(0, 6).map(r =>
          `<tr>
            <td>${_beltSwatch(r.beltIdx)}${_beltName(r.beltIdx)}</td>
            <td><strong>${r.count}</strong></td>
          </tr>`
        ).join('')}
        </tbody></table>`;
    }

    const missers = d.fnBySorter.filter(r => r.errors > 0);
    if (missers.length) {
      h += `<div class="analysis-section-lbl" style="margin-top:12px;">Sorters who miss this belt:</div>
        <table><thead><tr><th>Sorter</th><th>Attempts</th><th>Miss Rate</th></tr></thead><tbody>
        ${missers.slice(0, 8).map(r => {
          const cls = r.rate >= 30 ? 'b-err' : r.rate >= 15 ? 'b-warn' : 'b-ok';
          return `<tr>
            <td><strong class="sorter-link" onclick="Analytics.jumpToSorter('${r.id}')">${r.id}</strong></td>
            <td>${r.total}</td>
            <td><span class="badge ${cls}">${r.rate}%</span></td>
          </tr>`;
        }).join('')}
        </tbody></table>`;
    }

    h += `</div>`;

    /* Right panel: false positives sent here */
    h += `<div class="analysis-panel">
      <div class="analysis-ph">Packages incorrectly sorted here</div>
      <div class="analysis-kpi">
        <span class="analysis-big">${d.fpCount}</span>
        <span class="analysis-sub">false positives total</span>
      </div>`;

    if (d.shouldBe.length) {
      h += `<div class="analysis-section-lbl">Should have gone to:</div>
        <table><thead><tr><th>Correct Belt</th><th>Count</th></tr></thead><tbody>
        ${d.shouldBe.slice(0, 6).map(r =>
          `<tr>
            <td>${_beltSwatch(r.beltIdx)}${_beltName(r.beltIdx)}</td>
            <td><strong>${r.count}</strong></td>
          </tr>`
        ).join('')}
        </tbody></table>`;
    }

    if (d.fpBySorter.length) {
      h += `<div class="analysis-section-lbl" style="margin-top:12px;">Sorters contributing false positives:</div>
        <table><thead><tr><th>Sorter</th><th>Times</th></tr></thead><tbody>
        ${d.fpBySorter.slice(0, 8).map(r =>
          `<tr>
            <td><strong class="sorter-link" onclick="Analytics.jumpToSorter('${r.id}')">${r.id}</strong></td>
            <td><strong>${r.count}</strong></td>
          </tr>`
        ).join('')}
        </tbody></table>`;
    }

    h += `</div></div>`;
    panel.innerHTML = h;
  }

  /* ══════════════════════════════════════════════
     RENDERER — SORTERS (list + drilldown)
  ══════════════════════════════════════════════ */

  async function renderSorters() {
    _drilldownSorter = null;
    const [events, roster] = await Promise.all([
      Storage.getEvents().catch(() => []),
      Storage.getSorterRoster().catch(() => []),
    ]);
    _sorterAisleMap = {};
    roster.forEach(s => { if (s.sort_aisle) _sorterAisleMap[s.employee_id] = s.sort_aisle; });

    const stats  = sorterStats(events);
    _allSorterRows = Object.entries(stats).sort((a, b) => a[1].accuracy - b[1].accuracy);

    const wrap = document.getElementById('sv-sorters');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:14px;">
          <div class="card-hd" style="margin-bottom:0;">Sorter Performance</div>
          <input class="inp" id="sorter-search" placeholder="Search employee ID..."
            style="width:210px;font-size:12px;padding:7px 11px;"
            oninput="Analytics._filterSorters(this.value)">
        </div>
        <p style="font-size:11px;color:var(--text-soft);margin-bottom:10px;">
          Click any row for full history and per-belt breakdown.
        </p>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th><th>Aisle</th><th>Answered</th><th>Correct</th>
              <th>Accuracy</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="sorter-tbody"></tbody>
        </table>
      </div>
    `;

    _renderSorterRows(_allSorterRows);
  }

  function _renderSorterRows(rows) {
    const tbody = document.getElementById('sorter-tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(([id, s]) => {
      const cls   = s.accuracy >= 90 ? 'b-ok' : s.accuracy >= 75 ? 'b-warn' : 'b-err';
      const aisle = _sorterAisleMap[id];
      return `<tr class="sorter-row" onclick="Analytics._drilldown('${id}')">
        <td><strong>${id}</strong></td>
        <td>${aisle ? `<span class="aisle-badge">${aisle}</span>` : '<span style="color:var(--text-soft);font-size:11px;">—</span>'}</td>
        <td>${s.total}</td>
        <td>${s.correct}</td>
        <td><strong>${s.accuracy}%</strong></td>
        <td><span class="badge ${cls}">${
          s.accuracy >= 90 ? 'Proficient' : s.accuracy >= 75 ? 'Developing' : 'Needs Coaching'
        }</span></td>
      </tr>`;
    }).join('') ||
    '<tr><td colspan="6" style="color:var(--text-soft);padding:16px;">No sorters yet</td></tr>';
  }

  function _filterSorters(query) {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? _allSorterRows.filter(([id]) => id.toLowerCase().includes(q))
      : _allSorterRows;
    _renderSorterRows(filtered);
  }

  async function _drilldown(sorterId) {
    _drilldownSorter = sorterId;
    const [events, roster] = await Promise.all([
      Storage.getEvents().catch(() => []),
      Storage.getSorterRoster().catch(() => []),
    ]);

    // Refresh aisle map with latest roster
    roster.forEach(s => { if (s.sort_aisle) _sorterAisleMap[s.employee_id] = s.sort_aisle; });
    const sorterAisle = _sorterAisleMap[sorterId] || null;

    const ev        = events.filter(e => e.sorter_id === sorterId)
      .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    const allStats  = sorterStats(events);
    const stats     = allStats[sorterId] || { total: 0, correct: 0, accuracy: 0 };
    const sessions  = sorterSessions(events, sorterId);
    const beltBreak = sorterBeltBreakdown(events, sorterId);
    const missorts  = sorterMissorts(events, sorterId);
    const recent    = ev.slice(-15).reverse();

    // Half-split trend
    const half      = Math.floor(ev.length / 2);
    const firstHalf = ev.slice(0, half);
    const lastHalf  = ev.slice(ev.length - half);
    const firstAcc  = firstHalf.length
      ? Math.round(firstHalf.filter(e => e.correct).length / firstHalf.length * 100) : null;
    const lastAcc   = lastHalf.length
      ? Math.round(lastHalf.filter(e => e.correct).length / lastHalf.length * 100) : null;
    const arrow     = _trendArrow(lastAcc, firstAcc);

    // Overall rank
    const allSorted = Object.entries(allStats).sort((a, b) => b[1].accuracy - a[1].accuracy);
    const rank  = allSorted.findIndex(([id]) => id === sorterId) + 1;
    const total = allSorted.length;

    // Aisle rank
    let aisleRankStr = '';
    if (sorterAisle) {
      const aisleMembers = roster.filter(s => s.sort_aisle === sorterAisle).map(s => s.employee_id);
      const aisleSorted  = Object.entries(allStats)
        .filter(([id]) => aisleMembers.includes(id))
        .sort((a, b) => b[1].accuracy - a[1].accuracy);
      const ar = aisleSorted.findIndex(([id]) => id === sorterId) + 1;
      if (ar > 0) aisleRankStr = `#${ar} of ${aisleSorted.length} in ${sorterAisle}`;
    }

    const wrap = document.getElementById('sv-sorters');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="drilldown-header">
        <button class="btn-ghost" style="padding:6px 14px;font-size:12px;"
          onclick="Analytics.renderSorters()">Back to Sorters</button>
        <div class="drilldown-title">
          ${sorterId}
          ${sorterAisle ? `<span class="aisle-badge" style="margin-left:10px;">${sorterAisle}</span>` : ''}
        </div>
        <div style="font-size:11px;color:var(--text-soft);text-align:right;white-space:nowrap;line-height:1.8;">
          <div>Overall: #${rank} of ${total}</div>
          ${aisleRankStr ? `<div style="color:var(--gold-dark);font-weight:600;">${aisleRankStr}</div>` : ''}
        </div>
      </div>

      <div class="metrics" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px;">
        <div class="metric">
          <div class="metric-val">${stats.total}</div>
          <div class="metric-lbl">Answered</div>
        </div>
        <div class="metric">
          <div class="metric-val">${stats.accuracy}%</div>
          <div class="metric-lbl">Accuracy</div>
        </div>
        <div class="metric">
          <div class="metric-val">${stats.total - stats.correct}</div>
          <div class="metric-lbl">Errors</div>
        </div>
        <div class="metric">
          <div class="metric-val" style="font-size:17px;">
            ${arrow || '<span style="font-size:13px;color:var(--text-soft);">No trend</span>'}
          </div>
          <div class="metric-lbl">Trend</div>
        </div>
      </div>

      ${sessions.length >= 2 ? `
      <div class="card">
        <div class="card-hd">Accuracy Over Time
          <span style="font-weight:400;font-size:10px;margin-left:6px;">(${sessions.length} sessions · 15 events each)</span>
        </div>
        ${_trendSVG(sessions)}
      </div>` : sessions.length === 1 ? `
      <div class="card">
        <div class="card-hd">Accuracy Over Time</div>
        <p style="font-size:12px;color:var(--text-soft);">
          Only 1 session recorded — chart will appear after more attempts.
        </p>
      </div>` : ''}

      <div class="drill-grid" style="margin-bottom:14px;">
        <div class="card" style="margin-bottom:0;">
          <div class="card-hd">Per-Belt Accuracy — worst first</div>
          ${beltBreak.length ? `
            <table>
              <thead><tr><th>Belt</th><th>Attempts</th><th>Accuracy</th></tr></thead>
              <tbody>
                ${beltBreak.map(r => {
                  const cls = r.accuracy >= 90 ? 'b-ok' : r.accuracy >= 75 ? 'b-warn' : 'b-err';
                  return `<tr>
                    <td style="font-size:11px;">${_beltSwatch(r.beltIdx)}${_beltName(r.beltIdx)}</td>
                    <td>${r.total}</td>
                    <td><span class="badge ${cls}">${r.accuracy}%</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>` :
          '<p style="font-size:12px;color:var(--text-soft);">No belt data yet.</p>'}
        </div>

        <div class="card" style="margin-bottom:0;">
          <div class="card-hd">Top Missort Patterns</div>
          ${missorts.length ? `
            <table>
              <thead><tr><th>Expected</th><th>Sent To</th><th>Count</th></tr></thead>
              <tbody>
                ${missorts.map(r => `
                  <tr>
                    <td style="font-size:11px;">${_beltName(r.expected)}</td>
                    <td style="font-size:11px;">${_beltName(r.actual)}</td>
                    <td><strong>${r.count}</strong></td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>` :
          '<p style="font-size:12px;color:var(--text-soft);">No missorts recorded.</p>'}
        </div>
      </div>

      <div class="card">
        <div class="card-hd">Recent 15 Events</div>
        <table>
          <thead>
            <tr><th>ZIP</th><th>Expected Belt</th><th>Answered</th><th>Result</th><th>Time</th></tr>
          </thead>
          <tbody>
            ${recent.map(e => `
              <tr>
                <td><strong>${e.zip || '—'}</strong></td>
                <td style="font-size:11px;">${_beltName(e.expected_belt)}</td>
                <td style="font-size:11px;">${_beltName(e.actual_belt)}</td>
                <td>
                  <span class="badge ${e.correct ? 'b-ok' : 'b-err'}">${e.correct ? 'Correct' : 'Wrong'}</span>
                  ${e.multi_valid ? '<span class="badge b-info" style="margin-left:3px;">multi</span>' : ''}
                </td>
                <td style="font-size:11px;color:var(--text-soft);">
                  ${(e.timestamp || '').slice(0, 16).replace('T', ' ')}
                </td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════
     RENDERER — KNOWLEDGE MAP
  ══════════════════════════════════════════════ */

  function _kmToggleState(st) {
    if (_kmStates.has(st)) _kmStates.delete(st);
    else _kmStates.add(st);
    const btn = document.querySelector(`[data-km-state="${st}"]`);
    if (btn) btn.classList.toggle('qst-active', _kmStates.has(st));
    _kmRefreshTable();
  }

  function _kmToggleSpecial(key) {
    if (_kmSpecial.has(key)) _kmSpecial.delete(key);
    else _kmSpecial.add(key);
    const btn = document.querySelector(`[data-km-special="${key}"]`);
    if (btn) btn.classList.toggle('qbelt-active', _kmSpecial.has(key));
    _kmRefreshTable();
  }

  function _kmPreset(name) {
    if (name === 'clear') {
      _kmStates  = new Set();
      _kmSpecial = new Set();
    } else {
      const p = _KM_PRESETS[name];
      if (!p) return;
      _kmStates  = new Set(p.states);
      _kmSpecial = new Set(p.special);
    }
    // Sync all button appearances
    document.querySelectorAll('[data-km-state]').forEach(btn => {
      btn.classList.toggle('qst-active', _kmStates.has(btn.dataset.kmState));
    });
    document.querySelectorAll('[data-km-special]').forEach(btn => {
      btn.classList.toggle('qbelt-active', _kmSpecial.has(btn.dataset.kmSpecial));
    });
    _kmRefreshTable();
  }

  function _kmRefreshTable() {
    const el = document.getElementById('km-result');
    if (!el) return;

    const hasFilter = _kmStates.size > 0 || _kmSpecial.size > 0;
    if (!hasFilter) {
      el.innerHTML = `<p style="color:var(--text-soft);font-size:13px;padding:12px 0;">
        Select one or more states or categories above to see sorter rankings.
      </p>`;
      return;
    }

    // Filter events to those matching the current selection
    const filtered = _kmEvents.filter(e => {
      // Air belt check first (belt index 14 = AF1, 15 = AF2)
      if (_kmSpecial.has('air')) {
        if (e.expected_belt === 14 || e.expected_belt === 15) return true;
      }
      // State-based checks
      const state = _kmTmap ? _kmTmap.get(e.zip)?.state : null;
      if (!state) return false;
      if (_kmStates.has(state)) return true;
      if (_kmSpecial.has('multidest') && MULTIDEST_STATES.includes(state)) return true;
      return false;
    });

    if (!filtered.length) {
      el.innerHTML = `<p style="color:var(--text-soft);font-size:13px;padding:12px 0;">
        No quiz events match the selected filter yet.
      </p>`;
      return;
    }

    // Compute per-sorter stats on filtered events
    const stats = {};
    filtered.forEach(e => {
      stats[e.sorter_id] ??= { total: 0, correct: 0 };
      stats[e.sorter_id].total++;
      if (e.correct) stats[e.sorter_id].correct++;
    });

    const MIN = 3;
    const ranked = Object.entries(stats)
      .map(([id, s]) => ({ id, ...s, accuracy: Math.round(s.correct / s.total * 100) }))
      .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);

    const qualifying = ranked.filter(r => r.total >= MIN);
    const tooFew     = ranked.filter(r => r.total < MIN);

    const filterParts = [
      ...[..._kmStates].sort(),
      ...(_kmSpecial.has('multidest') ? ['MULTIDEST States'] : []),
      ...(_kmSpecial.has('air')   ? ['Air Sort']     : []),
    ];
    const filterDesc = filterParts.join(', ');

    let html = `<div style="font-size:11px;color:var(--text-soft);margin-bottom:10px;">
      Filter: <strong style="color:var(--brown);">${filterDesc}</strong>
      &nbsp;&middot;&nbsp; ${filtered.length} events across ${Object.keys(stats).length} sorter${Object.keys(stats).length !== 1 ? 's' : ''}
    </div>`;

    if (!qualifying.length) {
      html += `<p style="color:var(--text-soft);font-size:13px;">
        No sorters have ${MIN}+ attempts in this filter yet.
      </p>`;
      el.innerHTML = html;
      return;
    }

    html += `<table>
      <thead>
        <tr>
          <th style="width:44px;">Rank</th>
          <th>Sorter</th>
          <th style="text-align:center;">Accuracy</th>
          <th style="text-align:center;">Attempts</th>
          <th style="text-align:center;">Correct</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${qualifying.map((r, i) => {
          const cls    = r.accuracy >= 90 ? 'b-ok' : r.accuracy >= 75 ? 'b-warn' : 'b-err';
          const medal  = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `#${i + 1}`;
          const mStyle = i < 3
            ? 'color:var(--gold-dark);font-weight:700;'
            : 'color:var(--text-soft);';
          return `<tr class="sorter-row" onclick="Analytics.jumpToSorter('${r.id}')">
            <td style="font-size:12px;${mStyle}">${medal}</td>
            <td><strong>${r.id}</strong></td>
            <td style="text-align:center;"><span class="badge ${cls}">${r.accuracy}%</span></td>
            <td style="text-align:center;">${r.total}</td>
            <td style="text-align:center;">${r.correct}</td>
            <td><span class="badge ${cls}">${
              r.accuracy >= 90 ? 'Proficient' : r.accuracy >= 75 ? 'Developing' : 'Needs Coaching'
            }</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;

    if (tooFew.length) {
      html += `<p style="font-size:11px;color:var(--text-soft);margin-top:10px;">
        ${tooFew.length} sorter${tooFew.length !== 1 ? 's' : ''} hidden — fewer than ${MIN} attempts in this filter.
      </p>`;
    }

    el.innerHTML = html;
  }

  async function renderKnowledgeMap() {
    const wrap = document.getElementById('sv-knowledge');
    if (!wrap) return;

    _kmEvents = await Storage.getEvents().catch(() => []);
    _kmTmap   = Quiz.getTruthMap();

    if (!_kmEvents.length) {
      wrap.innerHTML = `<div class="card"><div class="card-hd">Destination Knowledge Map</div>
        <p style="color:var(--text-soft);font-size:13px;padding:8px 0;">No quiz events recorded yet.</p></div>`;
      return;
    }

    const stateGrid = _KM_ALL_STATES.map(st =>
      `<button class="qst-btn${_kmStates.has(st) ? ' qst-active' : ''}"
         data-km-state="${st}"
         onclick="Analytics._kmToggleState('${st}')">${st}</button>`
    ).join('');

    wrap.innerHTML = `
      <div class="card">
        <div class="card-hd">Destination Knowledge Map</div>
        <p style="font-size:11px;color:var(--text-soft);margin-bottom:16px;">
          Select any combination of states and categories below.
          Rankings update immediately. Click any sorter row for their full history.
          Minimum 3 attempts required to appear in results.
        </p>

        <div style="margin-bottom:14px;">
          <div class="km-section-lbl">Quick Select</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-ghost" style="padding:5px 14px;font-size:12px;"
              onclick="Analytics._kmPreset('northeast')">Northeast</button>
            <button class="btn-ghost" style="padding:5px 14px;font-size:12px;"
              onclick="Analytics._kmPreset('multidest')">MULTIDEST States</button>
            <button class="btn-ghost" style="padding:5px 14px;font-size:12px;"
              onclick="Analytics._kmPreset('air')">Air Only</button>
            <button class="btn-ghost" style="padding:5px 14px;font-size:12px;color:var(--err);"
              onclick="Analytics._kmPreset('clear')">Clear All</button>
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <div class="km-section-lbl">States</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;max-width:740px;">${stateGrid}</div>
        </div>

        <div style="margin-bottom:20px;">
          <div class="km-section-lbl">Special Categories</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="qbelt-btn${_kmSpecial.has('multidest') ? ' qbelt-active' : ''}"
              data-km-special="multidest"
              onclick="Analytics._kmToggleSpecial('multidest')">MULTIDEST States</button>
            <button class="qbelt-btn${_kmSpecial.has('air') ? ' qbelt-active' : ''}"
              data-km-special="air"
              onclick="Analytics._kmToggleSpecial('air')">Air Sort (AF1 / AF2)</button>
          </div>
        </div>

        <div id="km-result"></div>
      </div>
    `;

    _kmRefreshTable();
  }

  /* ══════════════════════════════════════════════
     RENDERER — MISSORT MATRIX
  ══════════════════════════════════════════════ */

  async function renderMatrix() {
    const events = await Storage.getEvents().catch(() => []);
    const panel  = document.getElementById('sv-matrix');
    const result = missortMatrix(events);

    if (!result) {
      panel.innerHTML = `
        <div class="card">
          <div class="card-hd">Belt Confusion Matrix</div>
          <p style="color:var(--text-soft);font-size:13px;padding:8px 0;">
            No missort events recorded yet. Data will appear after sorters have completed quizzes.
          </p>
        </div>`;
      return;
    }

    const { belts, mx } = result;

    // Build ranked confusion pairs (off-diagonal, sorted by count desc)
    const pairs = [];
    belts.forEach(exp => {
      belts.forEach(act => {
        if (exp !== act) {
          const v = (mx[exp] && mx[exp][act]) || 0;
          if (v > 0) pairs.push({ exp, act, count: v });
        }
      });
    });
    pairs.sort((a, b) => b.count - a.count);
    const totalErrors = pairs.reduce((s, p) => s + p.count, 0);
    const topPairs    = pairs.slice(0, 8);

    // Matrix table — absolute heat thresholds (not relative to max)
    let tbl = '<table><thead><tr><th style="font-size:10px;">Expected &darr; &nbsp; Actual &rarr;</th>';
    belts.forEach(b => {
      tbl += `<th style="font-size:9px;max-width:44px;word-break:break-word;">${_beltName(b).split(' · ')[0]}</th>`;
    });
    tbl += '</tr></thead><tbody>';
    belts.forEach(exp => {
      tbl += `<tr><td style="font-size:10px;"><strong>${_beltName(exp).split(' · ')[0]}</strong></td>`;
      belts.forEach(act => {
        const v   = (mx[exp] && mx[exp][act]) || 0;
        const cls = exp === act ? 'mx-diag'
          : v === 0 ? 'mx-zero'
          : v >= 5  ? 'mx-hot'
          : v >= 2  ? 'mx-warm' : 'mx-cool';
        tbl += `<td class="mx-cell ${cls}">${exp === act ? '&mdash;' : v || '0'}</td>`;
      });
      tbl += '</tr>';
    });
    tbl += '</tbody></table>';

    // Top confusion pairs section
    const pairRows = topPairs.map((p, i) => {
      const pct = Math.round(p.count / totalErrors * 100);
      return `
        <tr>
          <td style="font-size:12px;padding:7px 8px;color:var(--text-soft);font-weight:700;">${i + 1}</td>
          <td style="font-size:12px;padding:7px 8px;"><strong>${_beltName(p.exp).split(' · ')[0]}</strong></td>
          <td style="font-size:11px;padding:7px 8px;color:var(--text-soft);">confused with</td>
          <td style="font-size:12px;padding:7px 8px;"><strong>${_beltName(p.act).split(' · ')[0]}</strong></td>
          <td style="font-size:12px;padding:7px 8px;text-align:right;">
            <span style="background:var(--cream);border-radius:4px;padding:2px 7px;">
              ${p.count} error${p.count !== 1 ? 's' : ''}
            </span>
          </td>
          <td style="font-size:11px;padding:7px 8px;color:var(--text-soft);text-align:right;">${pct}%</td>
        </tr>`;
    }).join('');

    panel.innerHTML = `

      <!-- Explainer -->
      <div class="card mx-explainer">
        <div class="card-hd">How to Read This Tab</div>
        <div class="mx-explain-grid">
          <div class="mx-explain-block">
            <div class="mx-explain-label">The matrix</div>
            Each row is the belt a package <strong>should</strong> have gone to.
            Each column is the belt a sorter <strong>actually chose</strong>.
            Off-diagonal cells are errors — the higher the number, the more
            often that pair gets confused. Diagonal cells (&mdash;) are skipped
            because a correct answer never appears here.
          </div>
          <div class="mx-explain-block">
            <div class="mx-explain-label">Color scale</div>
            Colors are based on absolute error count, not relative to the
            table maximum, so a cold cell is always genuinely rare.
            <div class="mx-legend-row">
              <span class="mx-cell mx-hot" style="border-radius:4px;padding:2px 8px;">5+</span> Frequent — needs attention
            </div>
            <div class="mx-legend-row">
              <span class="mx-cell mx-warm" style="border-radius:4px;padding:2px 8px;">2–4</span> Occasional — worth monitoring
            </div>
            <div class="mx-legend-row">
              <span class="mx-cell mx-cool" style="border-radius:4px;padding:2px 8px;">1</span> Isolated — low priority
            </div>
          </div>
          <div class="mx-explain-block">
            <div class="mx-explain-label">What to do with it</div>
            A hot cell at row <em>Top Black</em> / column <em>Middle Black</em>
            means sorters know a package is black-family but can&rsquo;t
            distinguish the two. Take action by:
            <ul style="margin:8px 0 0 16px;padding:0;font-size:12px;line-height:1.8;">
              <li>Using the Belt Stats tab to see which sorters drive those errors</li>
              <li>Drilling that belt family in Quiz Settings (boost those states or raise exception weight)</li>
              <li>Adding a coaching note during the next sort</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Top confusion pairs -->
      <div class="card" style="margin-bottom:18px;">
        <div class="card-hd">Top Confusion Pairs
          <span style="font-size:11px;font-weight:400;color:var(--text-soft);margin-left:8px;">
            ${totalErrors} total errors &middot; showing top ${topPairs.length}
          </span>
        </div>
        ${topPairs.length ? `
          <table>
            <thead>
              <tr>
                <th>#</th><th>Should go to</th><th></th><th>Sorter chose</th>
                <th style="text-align:right;">Errors</th>
                <th style="text-align:right;">Share</th>
              </tr>
            </thead>
            <tbody>${pairRows}</tbody>
          </table>` :
          '<p style="font-size:12px;color:var(--text-soft);">No confusion pairs found.</p>'
        }
      </div>

      <!-- Full matrix -->
      <div class="card">
        <div class="card-hd">Full Confusion Matrix</div>
        <div class="mx-wrap">${tbl}</div>
      </div>`;
  }

  /* ══════════════════════════════════════════════
     RENDERER — OVERLAYS
  ══════════════════════════════════════════════ */

  async function renderOverlays() {
    const overlays = await Storage.getOverlays().catch(() => []);
    document.querySelector('#sv-ov tbody').innerHTML =
      overlays.map(o => `
        <tr>
          <td><strong>${o.zip}</strong></td>
          <td>${_beltName(o.override_belt)}</td>
          <td>${o.reason || '—'}</td>
          <td>${o.actor || '—'}</td>
          <td style="font-size:11px;color:var(--text-soft);">
            ${(o.timestamp || '').slice(0, 16).replace('T', ' ')}
          </td>
        </tr>
      `).join('') ||
      '<tr><td colspan="5" style="color:var(--text-soft);padding:16px;">No overlays defined</td></tr>';
  }

  /* ══════════════════════════════════════════════
     ADMIN RENDERERS
  ══════════════════════════════════════════════ */

  async function renderSupervisors() {
    const supervisors = await Storage.getSupervisors().catch(() => []);
    const tbody = document.getElementById('ad-sup-list');
    if (!tbody) { console.error('[Analytics] #ad-sup-list not found'); return; }
    tbody.innerHTML =
      supervisors.map(s => `
        <tr>
          <td><strong>${s.employee_id}</strong></td>
          <td>${s.name || '—'}</td>
          <td>${s.added_by || '—'}</td>
          <td style="font-size:11px;color:var(--text-soft);">${(s.added_at || '').slice(0, 10)}</td>
          <td>
            <button class="btn-danger" style="padding:4px 10px;font-size:11px;"
              onclick="App.removeSupervisor('${s.employee_id}')">Remove</button>
          </td>
        </tr>
      `).join('') ||
      '<tr><td colspan="5" style="color:var(--text-soft);padding:16px;">No approved supervisors yet</td></tr>';
  }

  async function renderSystemHealth() {
    const truthCnt = await Storage.countTruth().catch(() => 0);
    const events   = await Storage.getEvents().catch(() => []);
    const overlays = await Storage.getOverlays().catch(() => []);
    const sups     = await Storage.getSupervisors().catch(() => []);
    const mode     = Storage.getMode();

    document.getElementById('h-truth-cnt').textContent    = truthCnt.toLocaleString();
    document.getElementById('h-events-cnt').textContent   = events.length.toLocaleString();
    document.getElementById('h-overlays-cnt').textContent = overlays.length.toLocaleString();
    document.getElementById('h-sups-cnt').textContent     = sups.length.toLocaleString();

    const dot = document.getElementById('h-storage-dot');
    const txt = document.getElementById('h-storage-txt');
    dot.className = mode === 'shared' ? 'dot g' : 'dot y';
    txt.textContent = mode === 'shared'
      ? 'Shared drive connected: ' + Storage.getFolderName()
      : 'Local only (IndexedDB) — connect shared folder in Data tab to sync across machines';

    const tDot = document.getElementById('h-truth-dot');
    const tTxt = document.getElementById('h-truth-txt');
    tDot.className = truthCnt > 0 ? 'dot g' : 'dot r';
    tTxt.textContent = truthCnt > 0
      ? truthCnt.toLocaleString() + ' ZIPs loaded in local IndexedDB'
      : 'Truth table not loaded — use Data tab to initialize';
  }

  async function renderDataManagement() {
    renderSystemHealth().catch(() => {});
  }

  /* ══════════════════════════════════════════════
     FLAGS — SUPERVISOR VIEW
  ══════════════════════════════════════════════ */

  async function renderSvFlags() {
    const flags   = await Storage.getFlags().catch(() => []);
    const pending = flags.filter(f => f.status === 'pending');
    const tbody   = document.getElementById('sv-flags-list');
    if (!tbody) return;

    tbody.innerHTML = pending.map(f => {
      const sugName = f.suggested_belt != null ? _beltName(f.suggested_belt) : '—';
      return `
      <tr>
        <td><strong>${f.zip}</strong></td>
        <td>${_beltName(f.expected_belt)}</td>
        <td>${sugName}</td>
        <td style="max-width:200px;font-size:12px;">${_esc(f.reason)}</td>
        <td><strong>${f.flagged_by || '—'}</strong></td>
        <td style="font-size:11px;color:var(--text-soft);">
          ${(f.timestamp || '').slice(0, 16).replace('T', ' ')}
        </td>
        <td style="white-space:nowrap;">
          <button class="btn-gold" style="padding:4px 10px;font-size:11px;margin-right:4px;"
            onclick="App.flagCreateOverlay('${f.id}','${f.zip}',${f.suggested_belt ?? f.expected_belt})">
            Create Overlay
          </button>
          <button class="btn-ghost" style="padding:4px 10px;font-size:11px;"
            onclick="App.flagDismiss('${f.id}')">Dismiss</button>
        </td>
      </tr>`;
    }).join('') ||
    '<tr><td colspan="7" style="color:var(--text-soft);padding:16px;">No pending flags</td></tr>';

    const badge = document.getElementById('sv-flags-badge');
    if (badge) badge.textContent = pending.length ? pending.length : '';
  }

  /* ══════════════════════════════════════════════
     FLAGS — ADMIN VIEW
  ══════════════════════════════════════════════ */

  async function renderAdFlags() {
    const flags = await Storage.getFlags().catch(() => []);
    const tbody = document.getElementById('ad-flags-list');
    if (!tbody) return;

    const statusLabel = {
      pending:   '<span class="badge b-warn">Pending</span>',
      approved:  '<span class="badge b-ok">Overlay Created</span>',
      dismissed: '<span class="badge" style="background:#eee;color:#666;">Dismissed</span>',
      escalated: '<span class="badge b-err">Truth Table Update</span>',
    };

    tbody.innerHTML = flags.slice().reverse().map(f => {
      const sugName = f.suggested_belt != null ? _beltName(f.suggested_belt) : '—';
      return `
      <tr>
        <td><strong>${f.zip}</strong></td>
        <td style="font-size:11px;">${_beltName(f.expected_belt)}</td>
        <td style="font-size:11px;">${sugName}</td>
        <td style="max-width:160px;font-size:12px;">${_esc(f.reason)}</td>
        <td>${f.flagged_by || '—'}</td>
        <td>${f.approved_by ? f.approved_by : '—'}</td>
        <td>${statusLabel[f.status] || f.status}</td>
        <td style="white-space:nowrap;">
          ${f.status !== 'escalated' && f.status !== 'dismissed' ? `
            <button class="btn-danger" style="padding:4px 10px;font-size:11px;margin-right:4px;"
              onclick="App.flagEscalate('${f.id}')">Needs Truth Edit</button>
            <button class="btn-ghost" style="padding:4px 10px;font-size:11px;"
              onclick="App.flagAdminDismiss('${f.id}')">Dismiss</button>` : '—'}
        </td>
      </tr>`;
    }).join('') ||
    '<tr><td colspan="8" style="color:var(--text-soft);padding:16px;">No flags yet</td></tr>';
  }

  /* ══════════════════════════════════════════════
     RENDERER — SORT AISLE LEADERBOARD
  ══════════════════════════════════════════════ */

  async function renderAisles() {
    const [events, roster] = await Promise.all([
      Storage.getEvents().catch(() => []),
      Storage.getSorterRoster().catch(() => []),
    ]);
    const wrap = document.getElementById('sv-aisles');
    if (!wrap) return;

    const ranked = aisleStats(events, roster);
    const hasData = ranked.some(a => a.total > 0);
    if (!hasData) {
      wrap.innerHTML = `
        <div class="card">
          <div class="card-hd">Sort Aisle Leaderboard</div>
          <p style="font-size:13px;color:var(--ink-dim);padding:8px 0;">
            No quiz data yet — assign sorters to aisles in the Sorter Roster tab,
            then come back once they've completed attempts.
          </p>
        </div>`;
      return;
    }

    // ── Hero leader callout ──
    const leader   = ranked[0];
    const leaderAcc = leader.accuracy !== null ? leader.accuracy + '%' : '—';

    // ── PHASE 2: Multi-line time-series ──
    const dayKeys = _recentDayKeys(7);
    const series  = aisleDailySeries(events, roster, 7);

    // Trend up/down for leader: compare last 2 days mean vs prior 2 days mean
    const leaderPts = series.find(s => s.aisle === leader.aisle)?.points || [];
    let leaderDelta = null;
    const recent = leaderPts.slice(-3).filter(p => p.accuracy != null);
    const prior  = leaderPts.slice(0, 3).filter(p => p.accuracy != null);
    if (recent.length && prior.length) {
      const r = recent.reduce((s,p) => s + p.accuracy, 0) / recent.length;
      const p = prior.reduce((s,p) => s + p.accuracy, 0) / prior.length;
      leaderDelta = Math.round((r - p) * 10) / 10;
    }
    const leaderDeltaStr = leaderDelta == null ? ''
      : leaderDelta >= 0
        ? `<div class="aisle-hero-leader-sub" style="color:var(--ok);">+${leaderDelta}pp · pulling ahead</div>`
        : `<div class="aisle-hero-leader-sub" style="color:var(--coral);">${leaderDelta}pp · slipping</div>`;

    const heroHTML = `
      <div class="aisle-hero">
        <div class="aisle-hero-text">
          <div class="aisle-hero-eyebrow">Live leaderboard · twilight sort</div>
          <div class="aisle-hero-title">The race for <span class="aisle-hero-title-accent">95%</span></div>
          <div class="aisle-hero-sub">
            4 aisles · ${ranked.reduce((s,a) => s + a.sorterCount, 0)} sorters ·
            ${ranked.reduce((s,a) => s + a.total, 0).toLocaleString()} sort events
          </div>
        </div>
        <div class="aisle-hero-leader">
          <div class="aisle-hero-leader-lbl">★ Leader</div>
          <div class="aisle-hero-leader-val">${leader.aisle} · ${leaderAcc}</div>
          ${leaderDeltaStr}
        </div>
      </div>`;

    const seriesHTML = `
      <div class="aisle-series-card">
        <div class="aisle-series-head">
          <div>
            <div class="aisle-series-title-eyebrow">Accuracy by aisle · last 7 days</div>
            <div class="aisle-series-title">Daily accuracy trend</div>
          </div>
          <div class="aisle-series-legend">
            ${['Sort-1','Sort-2','Sort-3','Sort-4'].map((a, i) => {
              const COLORS = ['#9be88f','#ffb347','#ff8a4d','#ff7b7b'];
              return `<span class="aisle-series-legend-row">
                <span class="aisle-series-legend-dash" style="width:18px;height:2px;background:${COLORS[i]};"></span>${a}
              </span>`;
            }).join('')}
          </div>
        </div>
        ${_aisleSeriesSVG(series, dayKeys)}
      </div>`;

    // ── PHASE 2: Podium grid with weekly digest per aisle ──
    const MEDAL_COLORS = ['#ffd084', '#cbd0d5', '#d99464', '#7a6650'];
    const podiumHTML = ranked.map((a, i) => {
      const acc = a.accuracy !== null ? a.accuracy : '—';
      const accColor = a.accuracy === null ? 'var(--ink-soft)'
        : a.accuracy >= 90 ? 'var(--ok)'
        : a.accuracy >= 85 ? 'var(--amber)'
        : a.accuracy >= 80 ? 'var(--ink)' : 'var(--coral)';
      const accStyle = i === 0
        ? 'background:linear-gradient(140deg,var(--amber),var(--coral));-webkit-background-clip:text;-webkit-text-fill-color:transparent;'
        : `color:${accColor};`;

      const digest = aisleWeeklyDigest(events, roster, a.aisle, 7);
      const digestColor = digest.tone === 'good' ? 'var(--ok)' : digest.tone === 'bad' ? 'var(--coral)' : 'var(--ink-dim)';

      const cardClass = i === 0 ? 'aisle-rank-card aisle-rank-leader' : 'aisle-rank-card';

      return `<div class="${cardClass}">
        <div class="aisle-rank-pos" style="color:${MEDAL_COLORS[i]};">#${i + 1}</div>
        <div class="aisle-rank-name">${a.aisle}</div>
        <div class="aisle-rank-sub" style="margin-bottom:14px;">
          ${a.sorterCount} sorter${a.sorterCount !== 1 ? 's' : ''} ·
          ${a.total.toLocaleString()} attempt${a.total !== 1 ? 's' : ''}
        </div>
        <div class="aisle-rank-acc" style="${accStyle}">${acc}<span style="font-family:var(--f-mono);font-size:16px;color:var(--ink-dim);">${a.accuracy !== null ? '%' : ''}</span></div>
        <div class="aisle-digest">
          <div class="aisle-digest-lbl">This week</div>
          <div class="aisle-digest-line" style="color:${digestColor};">${digest.line}</div>
          ${digest.sub ? `<div class="aisle-digest-sub">${digest.sub}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    // ── PHASE 2: Race to 95% horizontal bars ──
    const TARGET = 95;
    const leaderAccNum = leader.accuracy != null ? leader.accuracy : null;
    const raceRows = ranked.map((a, i) => {
      if (a.accuracy == null) {
        return `<div class="race-row">
          <div class="race-row-name">${a.aisle}</div>
          <div class="race-bar"><div class="race-target"></div></div>
          <div class="race-row-acc">—</div>
          <div class="race-row-gap">no data</div>
        </div>`;
      }
      const pct = Math.min(100, (a.accuracy / TARGET) * 100);
      const gap = leaderAccNum != null ? +(leaderAccNum - a.accuracy).toFixed(1) : null;
      const fillClass = i === 0 ? 'race-bar-fill-leader' : a.accuracy >= 85 ? 'race-bar-fill-mid' : 'race-bar-fill-behind';
      const gapClass = i === 0 ? 'race-row-gap-leader' : 'race-row-gap';
      const gapTxt = i === 0 ? '★ leader' : (gap == null ? '' : `${gap}pp to leader`);
      return `<div class="race-row">
        <div class="race-row-name">${a.aisle}</div>
        <div class="race-bar">
          <div class="race-bar-fill ${fillClass}" style="width:${pct.toFixed(1)}%;"></div>
          <div class="race-target"></div>
        </div>
        <div class="race-row-acc">${a.accuracy}%</div>
        <div class="${gapClass}">${gapTxt}</div>
      </div>`;
    }).join('');

    const raceHTML = `
      <div class="race-track-card">
        <div class="race-track-head">
          <div>
            <div class="aisle-series-title-eyebrow">Race to ${TARGET}% · how far behind the leader</div>
            <div class="aisle-series-title">Distance to the posted target</div>
          </div>
          <div class="race-track-pill">Goal: ${TARGET}% sustained</div>
        </div>
        <div class="race-rows">${raceRows}</div>
      </div>`;

    // ── Per-aisle detail cards (existing) ──
    const detailHTML = ranked.map(a => {
      const acc = a.accuracy !== null ? a.accuracy + '%' : '—';
      const cls = a.accuracy === null ? '' : a.accuracy >= 90 ? 'b-ok' : a.accuracy >= 75 ? 'b-warn' : 'b-err';
      const topMissStr = a.topMissBelt !== null
        ? `${_beltSwatch(a.topMissBelt)}${_beltName(a.topMissBelt)} &nbsp;(${a.topMissCount} misses)`
        : '<span style="color:var(--ink-soft);">None recorded</span>';

      const sortersHTML = a.sorterList.length
        ? `<table>
            <thead><tr><th>Sorter</th><th>Answered</th><th>Correct</th><th>Accuracy</th></tr></thead>
            <tbody>
              ${a.sorterList.map(s => {
                const sc = s.accuracy >= 90 ? 'b-ok' : s.accuracy >= 75 ? 'b-warn' : 'b-err';
                return `<tr class="sorter-row" onclick="Analytics.jumpToSorter('${s.id}')">
                  <td><strong>${s.id}</strong></td>
                  <td>${s.total}</td>
                  <td>${s.correct}</td>
                  <td><span class="badge ${sc}">${s.accuracy}%</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`
        : '<p style="font-size:12px;color:var(--ink-dim);">No sorters with quiz events in this aisle yet.</p>';

      return `<div class="card">
        <div class="card-hd">${a.aisle}
          <span class="badge ${cls}" style="margin-left:10px;font-size:11px;">${acc}</span>
          <span style="font-size:11px;color:var(--ink-soft);font-weight:400;margin-left:8px;">
            ${a.total.toLocaleString()} attempts &nbsp;&middot;&nbsp;
            ${a.total - a.correct} errors &nbsp;&middot;&nbsp;
            ${a.sorterCount} sorter${a.sorterCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div style="margin-bottom:14px;">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink-soft);">Top Miss Belt</span>
          <div style="margin-top:4px;font-size:13px;">${topMissStr}</div>
        </div>
        ${sortersHTML}
      </div>`;
    }).join('');

    wrap.innerHTML = `
      ${heroHTML}
      ${seriesHTML}
      <div class="aisle-rank-grid" style="margin-bottom:16px;">${podiumHTML}</div>
      ${raceHTML}
      <div style="margin-top:18px;">${detailHTML}</div>
    `;
  }

  /* ══════════════════════════════════════════════
     PHASE 4: HEATMAP (time-of-day × day-of-week)
  ══════════════════════════════════════════════ */

  async function renderHeatmap() {
    const wrap = document.getElementById('sv-heatmap');
    if (!wrap) return;
    const events = await Storage.getEvents().catch(() => []);
    const grid = heatmapData(events, 30);

    // Compute max events in any cell for intensity scaling
    let maxTotal = 0;
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) {
      if (grid[d][h].total > maxTotal) maxTotal = grid[d][h].total;
    }
    if (maxTotal === 0) {
      wrap.innerHTML = `
        <div class="card">
          <div class="card-hd">Time-of-Day Heatmap</div>
          <p style="font-size:13px;color:var(--ink-dim);padding:8px 0;">
            No quiz events in the last 30 days yet. Once sorters start using the app,
            you'll see when accuracy dips and when activity spikes.
          </p>
        </div>`;
      return;
    }

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    // Build header row (hours)
    const headerRow = `
      <div></div>
      ${Array.from({ length: 24 }, (_, h) => `<div class="heatmap-col-label">${String(h).padStart(2,'0')}</div>`).join('')}
    `;

    // Build day rows
    const dayRows = days.map((d, dIdx) => {
      const cells = Array.from({ length: 24 }, (_, h) => {
        const cell = grid[dIdx][h];
        if (cell.total === 0) {
          return `<div class="heatmap-cell heatmap-cell-empty" title="${d} ${h}:00 — no events"></div>`;
        }
        const accuracy = Math.round((cell.total - cell.errors) / cell.total * 100);
        const intensity = Math.min(1, cell.total / maxTotal);
        // Color: green at high accuracy, red at low. Alpha by volume.
        const hue = accuracy >= 90 ? 130 : accuracy >= 80 ? 90 : accuracy >= 70 ? 50 : 10;
        const lightness = 30 + intensity * 30;
        const bg = `hsl(${hue}, 70%, ${lightness}%)`;
        return `<div class="heatmap-cell" style="background:${bg};"
          title="${d} ${h}:00 — ${cell.total} events, ${accuracy}% accuracy">
          ${cell.total > maxTotal * 0.25 ? accuracy + '%' : ''}
        </div>`;
      }).join('');
      return `<div class="heatmap-row-label">${d}</div>${cells}`;
    }).join('');

    wrap.innerHTML = `
      <div class="heatmap-card">
        <div class="heatmap-head">
          <div>
            <div class="aisle-series-title-eyebrow">Time-of-day patterns · last 30 days</div>
            <div class="aisle-series-title">When the floor is sharpest — and when it dips</div>
          </div>
        </div>
        <div class="heatmap-wrap">
          <div class="heatmap-grid">
            ${headerRow}
            ${dayRows}
          </div>
        </div>
        <div class="heatmap-legend">
          <span>Accuracy:</span>
          <div class="heatmap-legend-scale">
            <div class="heatmap-legend-cell" style="background:hsl(10,70%,40%);" title="< 70%"></div>
            <div class="heatmap-legend-cell" style="background:hsl(50,70%,45%);" title="70–80%"></div>
            <div class="heatmap-legend-cell" style="background:hsl(90,70%,45%);" title="80–90%"></div>
            <div class="heatmap-legend-cell" style="background:hsl(130,70%,45%);" title="≥ 90%"></div>
          </div>
          <span style="margin-left:14px;">Brightness scales with volume · empty cells had no events</span>
        </div>
      </div>`;
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */

  return {
    renderOverview,
    renderBelts,
    renderSorters,
    renderAisles,
    renderMatrix,
    renderKnowledgeMap,
    renderOverlays,
    renderSupervisors,
    renderSystemHealth,
    renderDataManagement,
    renderSvFlags,
    renderAdFlags,
    renderHeatmap,
    // Phase 1 reducers exposed for testing / future use
    aisleDailySeries,
    teamDailySeries,
    teamDailyVolume,
    teamDailyActiveSorters,
    sorterOfWeek,
    aisleWeeklyDigest,
    heatmapData,
    // exposed for inline onclick handlers
    _onBeltSelect,
    _filterSorters,
    _drilldown,
    jumpToSorter,
    _kmToggleState,
    _kmToggleSpecial,
    _kmPreset,
  };

})();
