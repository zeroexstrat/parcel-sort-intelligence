/* ══════════════════════════════════════════════
   quiz.js — Quiz Engine
══════════════════════════════════════════════ */

const Quiz = (() => {

  let _tmap  = null;
  let _tarr  = null;
  let _stateGroups = {};   // { 'MA': [entries...], 'ME': [...], ... }
  let _airEntries  = [];   // flattened air-sort question templates
  let _highMissEntries = [];  // operator-curated frequently-missed zones (HIGH_MISS_ZONES)

  let _answered = 0;
  let _correct  = 0;
  let _currentZip   = null;
  let _currentBelts = null;
  let _answered_q   = false;
  let _currentMeta  = null;   // { qtype, svc, excId, state, isRetest } for adaptive/Elo
  let _adaptiveOn   = false;

  // Quiz config — loaded from storage by App, applied via loadConfig()
  let _cfg = {
    exceptionWeight: 5,
    airWeight: 3,
    multidestWeight: 4,     // MULTIDEST pool size in "average-state equivalents"
    stateWeights: {},   // { 'MA': 4, 'ME': 4, ... }
    includeAir: true,
    beltFilter: [],     // restrict questions to these belt indices (empty = all)
  };

  /* ─────────────────────────────────────────
     TRUTH TABLE PARSING
  ───────────────────────────────────────── */

  function _parseTruth() {
    if (_tmap) return;
    _tmap = new Map();
    _tarr = [];
    _stateGroups = {};

    for (const line of TRUTH_RAW.split('\n')) {
      if (!line) continue;
      const parts = line.split('|');
      if (parts.length < 4) continue;
      const [z, s, b, bi, state, city] = parts;
      const belts = bi.includes(',') ? bi.split(',').map(Number) : [parseInt(bi)];
      const entry = { zip: z, slic: s, bay: b, belts, state: state || '', city: city || '' };
      _tmap.set(z, entry);
      _tarr.push(entry);

      const st = entry.state;
      if (st) {
        if (!_stateGroups[st]) _stateGroups[st] = [];
        _stateGroups[st].push(entry);
      }
    }

    _buildAirEntries();

    // High-miss zone pool — operator-curated lookalike traps (config.js)
    _highMissEntries = (typeof HIGH_MISS_ZONES !== 'undefined')
      ? _tarr.filter(e => HIGH_MISS_ZONES.some(zn => {
          if (zn.state && e.state !== zn.state) return false;
          if (zn.prefix && !e.zip.startsWith(zn.prefix)) return false;
          if (zn.slicLow !== undefined || zn.slicHigh !== undefined) {
            const slic4 = parseInt(e.zip.slice(0, 4), 10);
            const lo = zn.slicLow !== undefined ? zn.slicLow : slic4;
            const hi = zn.slicHigh !== undefined ? zn.slicHigh : slic4;
            if (slic4 < lo || slic4 > hi) return false;
          }
          return true;
        }))
      : [];
  }

  // Build the list of air-sort templates by matching AIR_SORT_RULES to _tarr
  function _buildAirEntries() {
    _airEntries = [];
    for (const rule of AIR_SORT_RULES) {
      // Collect candidate ZIPs matching this rule
      let candidates = _tarr.filter(e => _airRuleMatchesEntry(rule, e));
      // For any-state rules with no filter, use a small sample
      if (!rule.stateFilter && !rule.prefixFilter && !rule.prefixList &&
          !rule.prefixMin && !rule.prefixMax) {
        // pick up to 200 random entries to represent the "any" case
        const shuffled = [..._tarr].sort(() => Math.random() - 0.5).slice(0, 200);
        candidates = shuffled;
      }
      if (candidates.length) {
        _airEntries.push({ rule, candidates });
      }
    }
  }

  function getTruthArray() { _parseTruth(); return _tarr; }
  function getTruthMap()   { _parseTruth(); return _tmap; }
  function getTruthCount() { _parseTruth(); return _tarr.length; }

  function loadConfig(cfg) {
    if (cfg) _cfg = { ..._cfg, ...cfg };
  }

  /* ─────────────────────────────────────────
     HUMAN READABLE ROUTING CODE
  ───────────────────────────────────────── */

  function _humanReadable(zip, state) {
    // e.g. zip=42101, state=KY  →  "KY 421 0-01"
    //      zip=90210, state=CA  →  "CA 902 1-00"
    if (!zip || zip.length < 5) return (state || '??') + ' ' + (zip || '???');
    return state + ' ' + zip.slice(0, 3) + ' ' + zip[3] + '-0' + zip[4];
  }

  /* ─────────────────────────────────────────
     LABEL CONTENT POOLS
  ───────────────────────────────────────── */

  const _SENDERS = [
    { name: 'AMAZON.COM LLC',      addr: '410 TERRY AVE N',       city: 'SEATTLE WA 98109' },
    { name: 'TARGET CORPORATION',  addr: '1000 NICOLLET MALL',    city: 'MINNEAPOLIS MN 55403' },
    { name: 'WALMART INC',         addr: '702 SW 8TH ST',         city: 'BENTONVILLE AR 72716' },
    { name: 'APPLE INC',           addr: '1 INFINITE LOOP',       city: 'CUPERTINO CA 95014' },
    { name: 'CHEWY INC',           addr: '1855 GRIFFIN RD STE B', city: 'DANIA BEACH FL 33004' },
    { name: 'BEST BUY CO INC',     addr: '7601 PENN AVE S',       city: 'RICHFIELD MN 55423' },
    { name: 'HOME DEPOT USA INC',  addr: '2455 PACES FERRY RD',   city: 'ATLANTA GA 30339' },
    { name: 'WAYFAIR LLC',         addr: '4 COPLEY PL STE 700',   city: 'BOSTON MA 02116' },
  ];

  const _STREETS = [
    'MAIN ST', 'OAK AVE', 'MAPLE DR', 'CEDAR LN', 'ELM ST',
    'PINE RD', 'CHURCH ST', 'WASHINGTON AVE', 'LAKE DR', 'PARK BLVD',
    'HIGHLAND AVE', 'RIVER RD', 'SUNSET DR', 'FOREST LN', 'MILL RD',
    'SPRING ST', 'VALLEY RD', 'HILL ST', 'GROVE AVE', 'RIDGE RD',
  ];

  const _LAST_NAMES = [
    'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA',
    'MILLER', 'DAVIS', 'RODRIGUEZ', 'MARTINEZ', 'WILSON',
    'ANDERSON', 'TAYLOR', 'THOMAS', 'HERNANDEZ', 'MOORE',
    'JACKSON', 'MARTIN', 'LEE', 'PEREZ', 'THOMPSON',
  ];

  function _rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _rndInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

  function _fakeTracking() {
    const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, '0');
    const n2  = () => String(_rndInt(10, 99));
    return '1Z ' + seg() + ' ' + seg() + ' ' + n2() + ' ' + seg() + ' ' + seg();
  }

  /* ─────────────────────────────────────────
     LABEL BUILDERS
  ───────────────────────────────────────── */

  function _labelShell(opts) {
    // opts: { sender, street, lastName, lbs, tracking, routing, cityLine,
    //         serviceBar, badge, desc, countryLine, weightUnit }
    const { sender, street, lastName, lbs, tracking, routing, cityLine,
            serviceBar, badge, desc, countryLine, weightUnit } = opts;
    return `
      <div class="ups-label${badge ? ' label-exc' : ''}">
        ${badge ? `<div class="label-exc-badge">${badge}</div>` : ''}
        <div class="label-top">
          <div class="label-from">
            <div class="label-from-name">${sender.name}</div>
            <div>${sender.addr}</div>
            <div>${sender.city}</div>
          </div>
          <div class="label-wt">${lbs} ${weightUnit || 'LBS'}<br>1 OF 1</div>
        </div>
        <div class="label-shipto">
          <div class="label-shipto-lbl">SHIP<br>TO:</div>
          <div class="label-shipto-addr">
            <div>${lastName} RESIDENCE</div>
            <div>${street}</div>
            <div class="label-city-line">${cityLine}</div>
            ${countryLine ? `<div class="label-country-line">${countryLine}</div>` : ''}
          </div>
        </div>
        <div class="label-routing-row">
          <div class="label-2d"></div>
          <div class="label-routing-code">${routing}</div>
        </div>
        ${serviceBar}
        <div class="label-tracking">TRACKING #: ${tracking}</div>
        <div class="label-barcode-row"><div class="fake-barcode"></div></div>
        <div class="label-foot">URC87.5A &nbsp;&nbsp; DESC: ${badge ? 'SHIPPER ERROR — SEE EXCEPTION LIST' : (desc || 'GROUND SERVICE')}</div>
      </div>
    `;
  }

  // Ground: service name + solid black block (matches real ground labels).
  // Air:    spelled-out service + big service-level numeral on the right —
  //         exactly like real domestic air labels. No "Express"/"Saver" wording
  //         on domestic air; the digit IS the service level (1 / 2 / 3).
  function _serviceBar(serviceName, isAir, level, subNote) {
    const right = level
      ? `<span class="label-service-lvl">${level}</span>`
      : '<div class="label-service-blk"></div>';
    return `
      <div class="label-service-bar${isAir ? ' label-service-air' : ''}">
        <span class="label-service-name">${serviceName}${
          subNote ? `<span class="label-service-sub">${subNote}</span>` : ''
        }</span>
        ${right}
      </div>
    `;
  }

  // Standard ground label
  function _buildLabel(entry) {
    const routing  = _humanReadable(entry.zip, entry.state);
    const cityLine = (entry.city || 'UNKNOWN') + ' ' + entry.state + ' ' + entry.zip;
    return _labelShell({
      sender: _rnd(_SENDERS), street: _rndInt(10,9999) + ' ' + _rnd(_STREETS),
      lastName: _rnd(_LAST_NAMES), lbs: _rndInt(1, 50),
      tracking: _fakeTracking(), routing, cityLine,
      serviceBar: _serviceBar('UPS GROUND', false),
    });
  }

  // Shipper error exception label
  // Shows routing code from routingState but address says zipState
  function _buildExceptionLabel(template) {
    // READABLE (the trap): routing-state prefix from the template range. This is
    // what the sorter sees first and what tempts the wrong belt.
    const prefix = String(_rndInt(template.prefixStart, template.prefixEnd)).padStart(3, '0');
    const d4 = String(_rndInt(0, 9));
    const d5 = String(_rndInt(0, 9));
    const readableZip = prefix + d4 + d5;
    const routing  = template.routingState + ' ' + readableZip.slice(0,3) + ' '
                   + readableZip[3] + '-0' + readableZip[4];

    // ADDRESS: a REAL ZIP from the parenthetical state — never a copy of the
    // readable. Routing is graded by this ZIP (e.g. readable "TN 381 9-61" but
    // address WEST MEMPHIS AR 72301 -> MULTIDEST). Drawn from the truth table,
    // restricted to entries matching the template's belt(s).
    const belts = template.belts || [template.belt];
    const beltSet = new Set(belts);
    let pool = (_stateGroups[template.zipState] || [])
      .filter(e => e.belts.some(b => beltSet.has(b)));
    // Geographic realism: restrict to the border region that actually rides
    // under this readable (e.g. K20 -> West Memphis 7230x, not all of AR)
    if (template.zipPrefixes && template.zipPrefixes.length) {
      const narrowed = pool.filter(e => template.zipPrefixes.some(p => e.zip.startsWith(p)));
      if (narrowed.length) pool = narrowed;
    }
    const entry = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const zip   = entry ? entry.zip : readableZip;
    const city  = (entry && entry.city) ? entry.city : template.city;
    const cityLine = city + ' ' + template.zipState + ' ' + zip;

    return {
      html: _labelShell({
        sender: _rnd(_SENDERS), street: _rndInt(10,9999) + ' ' + _rnd(_STREETS),
        lastName: _rnd(_LAST_NAMES), lbs: _rndInt(1, 50),
        tracking: _fakeTracking(), routing, cityLine,
        serviceBar: _serviceBar('UPS GROUND', false),
        badge: 'Shipper Error — Exception',
      }),
      zip, belts,
    };
  }

  // International shippers — used for INTL air questions so the label reads
  // like the real import labels (foreign sender + UNITED STATES line + KG).
  const _INTL_SENDERS = [
    { name: 'EASYSHIP+D',           addr: '20/F, HUA FU COMMERCIAL BUILDI', city: 'HONG KONG SAR, CHINA' },
    { name: 'SHENZHEN TRADING CO',  addr: '88 FUTIAN DISTRICT BLDG 4',      city: 'SHENZHEN, CHINA' },
    { name: 'YAMATO LOGISTICS KK',  addr: '2-16-1 KONAN MINATO-KU',         city: 'TOKYO 108-0075, JAPAN' },
    { name: 'RHEIN EXPORT GMBH',    addr: 'HAFENSTRASSE 12',                city: 'COLOGNE 50667, GERMANY' },
    { name: 'MAPLE TRADE LTD',      addr: '350 KING ST W UNIT 2',           city: 'TORONTO ON M5V 3X5, CANADA' },
  ];

  // Air sort label — domestic air shows spelled-out service + the big 1/2/3
  // service-level numeral (never "Express"/"Saver"); internationals mimic the
  // real import labels (UPS SAVER 1P / UPS EXPEDITED 2, foreign sender, KG).
  function _buildAirLabel(airGroup) {
    const { rule, candidates } = airGroup;
    const entry    = candidates[Math.floor(Math.random() * candidates.length)];
    const routing  = _humanReadable(entry.zip, entry.state);
    const cityLine = (entry.city || 'UNKNOWN') + ' ' + entry.state + ' ' + entry.zip;

    let html;
    if (rule.intl) {
      const variant = _rnd(INTL_LABEL_VARIANTS);
      html = _labelShell({
        sender: _rnd(_INTL_SENDERS), street: _rndInt(10,9999) + ' ' + _rnd(_STREETS),
        lastName: _rnd(_LAST_NAMES), lbs: _rndInt(1, 9), weightUnit: 'KG',
        tracking: _fakeTracking(), routing, cityLine,
        countryLine: 'UNITED STATES',
        serviceBar: _serviceBar(variant.service, true, variant.level),
        desc: 'INTERNATIONAL IMPORT',
      });
    } else {
      html = _labelShell({
        sender: _rnd(_SENDERS), street: _rndInt(10,9999) + ' ' + _rnd(_STREETS),
        lastName: _rnd(_LAST_NAMES), lbs: _rndInt(1, 20),
        tracking: _fakeTracking(), routing, cityLine,
        serviceBar: _serviceBar(rule.service, true, rule.level,
          rule.satNote ? 'SATURDAY DELIVERY' : null),
        desc: rule.service.replace(/^UPS /, ''),
      });
    }
    return { html, zip: entry.zip, belts: [rule.belt], rule };
  }

  /* ─────────────────────────────────────────
     WEIGHTED QUESTION SELECTION
  ───────────────────────────────────────── */

  function _pickQuestion() {
    const stateWeights = _cfg.stateWeights || {};
    const excWeight    = Math.max(1, _cfg.exceptionWeight || 5);
    const airWeight    = _cfg.includeAir !== false ? Math.max(0, parseInt(_cfg.airWeight) || 3) : 0;

    // Belt filter — when set, restrict truth entries to matching belts only
    const beltFilter = Array.isArray(_cfg.beltFilter) && _cfg.beltFilter.length > 0
      ? new Set(_cfg.beltFilter) : null;
    // multidestWeight is in "average-state equivalents": 8 means MULTIDEST draws like 8 typical states.
    // Because it scales with the current average, its share stays constant regardless of
    // which state weights the supervisor boosts — preventing northeast boosts from being
    // drowned out by the sheer ZIP-count mass of the 13 MULTIDEST states.
    const multidestWeight  = Math.max(0, _cfg.multidestWeight !== undefined ? _cfg.multidestWeight : 8);

    // Regular pool — MULTIDEST states are excluded; they get their own separate bucket below.
    const nonCchilStates = Object.keys(_stateGroups).filter(st => !MULTIDEST_STATES.includes(st));
    let regularTotal = 0;
    const stateCum = [];   // { st, entries, cumEnd }
    for (const st of nonCchilStates) {
      // Apply belt filter: only include entries whose belts overlap the filter
      const allEntries = _stateGroups[st];
      const entries = beltFilter
        ? allEntries.filter(e => e.belts.some(b => beltFilter.has(b)))
        : allEntries;
      if (!entries.length) continue;
      const w = (stateWeights[st] || 1) * entries.length;
      regularTotal += w;
      stateCum.push({ st, entries, cumEnd: regularTotal });
    }

    // MULTIDEST pool — single bucket sized proportionally to the current average per-state
    // contribution so its frequency is independent of how the regular weights are tuned.
    const allCchilEntries = MULTIDEST_STATES.flatMap(st => _stateGroups[st] || []);
    const multidestEntries = beltFilter
      ? allCchilEntries.filter(e => e.belts.some(b => beltFilter.has(b) || MULTIDEST_BELTS.includes(b)))
      : allCchilEntries;
    const avgStateContrib = nonCchilStates.length ? regularTotal / nonCchilStates.length : 1;
    const multidestTotal   = multidestWeight > 0 && multidestEntries.length ? multidestWeight * avgStateContrib : 0;

    // If a belt filter is active, filter exceptions and air to matching belts
    const filteredExceptions = beltFilter
      ? QUIZ_EXCEPTIONS.filter(ex => (ex.belts || [ex.belt]).some(b => beltFilter.has(b)))
      : QUIZ_EXCEPTIONS;
    // Also exclude service codes forbidden by the current sort type (e.g. NDA on Night sort)
    const filteredAirEntries = _airEntries.filter(ag => {
      if (beltFilter && !beltFilter.has(ag.rule.belt)) return false;
      return true;
    });

    // Exception and air buckets are sized in the same "average-state equivalents" unit as
    // MULTIDEST, so their weights are directly comparable regardless of how many ZIP records
    // or rule entries happen to exist.  Without this, a handful of air rules would be
    // dwarfed by ~41 k ground ZIPs and would essentially never be selected.
    const excTotal = filteredExceptions.length > 0 ? excWeight * avgStateContrib : 0;
    const airTotal = airWeight > 0 && filteredAirEntries.length ? airWeight * avgStateContrib : 0;

    // High-miss zone bucket — operator-curated lookalike traps (a zone that reads like
    // one lane of a lookalike pair, not its neighbor). Same avg-state-equivalents unit.
    const hmWeight  = Math.max(0, _cfg.highMissWeight !== undefined ? _cfg.highMissWeight : 4);
    const hmEntries = beltFilter
      ? _highMissEntries.filter(e => e.belts.some(b => beltFilter.has(b)))
      : _highMissEntries;
    const hmTotal   = hmWeight > 0 && hmEntries.length ? hmWeight * avgStateContrib : 0;

    const grand    = regularTotal + multidestTotal + hmTotal + excTotal + airTotal;

    const r = Math.random() * grand;

    if (r < regularTotal) {
      // Weighted pick from non-MULTIDEST states
      for (const sc of stateCum) {
        if (r < sc.cumEnd) {
          const e = sc.entries[Math.floor(Math.random() * sc.entries.length)];
          return { type: 'regular', entry: e };
        }
      }
      return { type: 'regular', entry: _tarr[0] };
    }

    if (r < regularTotal + multidestTotal) {
      // Pick a random entry from all MULTIDEST-state ZIPs; belts are overridden downstream
      const e = multidestEntries[Math.floor(Math.random() * multidestEntries.length)];
      return { type: 'regular', entry: e };
    }

    if (r < regularTotal + multidestTotal + hmTotal) {
      // High-miss zone drill
      const e = hmEntries[Math.floor(Math.random() * hmEntries.length)];
      return { type: 'regular', entry: e };
    }

    if (r < regularTotal + multidestTotal + hmTotal + excTotal) {
      if (!filteredExceptions.length) {
        const e = _tarr[Math.floor(Math.random() * _tarr.length)];
        return { type: 'regular', entry: e };
      }
      // Adaptive: weight templates by this sorter's miss profile + Elo frontier
      const template = _adaptiveOn
        ? Adaptive.pickException(filteredExceptions)
        : filteredExceptions[Math.floor(Math.random() * filteredExceptions.length)];
      return { type: 'exception', template };
    }

    // Air sort
    if (!filteredAirEntries.length) {
      const e = _tarr[Math.floor(Math.random() * _tarr.length)];
      return { type: 'regular', entry: e };
    }
    // Adaptive: weight air rules by miss profile + Elo frontier
    const group = _adaptiveOn
      ? Adaptive.pickAirGroup(filteredAirEntries)
      : filteredAirEntries[Math.floor(Math.random() * filteredAirEntries.length)];
    return { type: 'air', group };
  }

  /* ─────────────────────────────────────────
     RE-TEST QUESTION REBUILD
     Rebuilds a question from a spaced re-test queue item.
  ───────────────────────────────────────── */

  function _buildRetestQuestion(item) {
    if (item.qtype === 'exception' && item.excId) {
      const template = QUIZ_EXCEPTIONS.find(t => t.id === item.excId);
      if (template) return { type: 'exception', template, isRetest: true };
    }
    if (item.qtype === 'air' && item.svc) {
      const group = _airEntries.find(ag => ag.rule.serviceCode === item.svc);
      if (group) return { type: 'air', group, isRetest: true };
    }
    if (item.zip && _tmap.has(item.zip)) {
      return { type: 'regular', entry: _tmap.get(item.zip), isRetest: true };
    }
    return null;
  }

  /* ─────────────────────────────────────────
     DISTRACTOR SELECTION
  ───────────────────────────────────────── */

  function _pickDistractors(validBelts) {
    if (validBelts.length > 1) {
      // Multi-valid (MULTIDEST): show all valid + 1 unrelated wrong belt
      let d, tries = 0;
      do {
        d = Math.floor(Math.random() * (BELT_NAMES.length - 2)); // exclude air from distractors
        tries++;
      } while (validBelts.includes(d) && tries < 60);
      return [d];
    }

    const cb  = validBelts[0];
    const fam = BELT_FAMILIES[cb] || [];
    const out = [];

    for (const bi of fam) {
      if (out.length === 3) break;
      if (bi !== cb && bi < 14) out.push(bi);  // keep distractors in standard range
    }
    let tries = 0;
    while (out.length < 3 && tries < 80) {
      tries++;
      const bi = Math.floor(Math.random() * 14);  // 0-13 for ground questions
      if (bi !== cb && !out.includes(bi)) out.push(bi);
    }
    return out;
  }

  function _pickAirDistractors(correctBelt) {
    // For air questions, show both AF1 and AF2 plus 2 ground distractors
    const other = correctBelt === 14 ? 15 : 14;
    const groundDistractors = [6, 12]; // Top Green, Middle Blue — visually green/similar
    return [other, ...groundDistractors];
  }

  /* ─────────────────────────────────────────
     SESSION
  ───────────────────────────────────────── */

  async function startSession() {
    _answered = 0;
    _correct  = 0;
    _parseTruth();

    // Adaptive layer: build this sorter's gap profile from the event log and
    // fold it into the serving weights — no supervisor input needed.
    _adaptiveOn = false;
    if (typeof Adaptive !== 'undefined' && typeof App !== 'undefined' && App.currentUser()) {
      try {
        const baseCfg  = await Storage.getQuizConfig().catch(() => null);
        const effective = await Adaptive.beginSession(App.currentUser(), baseCfg || _cfg);
        if (Adaptive.isActive()) {
          _adaptiveOn = true;
          loadConfig(effective);
          _rebuildPickPools();
        }
      } catch (e) { console.error('[Quiz] adaptive init failed:', e); }
    }
    _updateEloChip();
    _updateStats();
    nextQuestion();
  }

  function _rebuildPickPools() { /* weights are read live in _pickQuestion */ }

  function _updateEloChip(delta) {
    const el = document.getElementById('s-elo');
    if (!el) return;
    if (_adaptiveOn && typeof Adaptive !== 'undefined' && Adaptive.currentRating() !== null) {
      const r = Adaptive.currentRating();
      const tier = Adaptive.tierFor(r);
      el.innerHTML = r + (delta ? ` <span class="elo-delta ${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '+' : ''}${delta}</span>` : '');
      const lbl = document.getElementById('s-elo-lbl');
      if (lbl) lbl.innerHTML = `<span class="elo-tier-dot" style="background:${tier.color}"></span>${tier.name}`;
    } else {
      el.textContent = '—';
      const lbl = document.getElementById('s-elo-lbl');
      if (lbl) lbl.textContent = 'Rating';
    }
  }

  function nextQuestion() {
    const flagBtn = document.getElementById('btn-flag');
    if (flagBtn) flagBtn.style.display = 'none';

    if (!_tarr || !_tarr.length) {
      document.getElementById('q-label').innerHTML =
        '<div style="padding:24px;color:var(--text-soft);font-size:13px;">' +
        'Truth table not loaded. Ask a Supervisor to load it in the System tab.</div>';
      document.getElementById('q-choices').innerHTML = '';
      return;
    }

    _answered_q = false;

    // Spaced re-test: previously missed questions resurface until answered
    // correctly twice. Re-tests are unrated for Elo.
    let picked = null;
    if (_adaptiveOn) {
      const due = Adaptive.maybeRetest();
      if (due) picked = _buildRetestQuestion(due);
    }
    if (!picked) picked = _pickQuestion();

    let labelHTML, isAir = false;

    if (picked.type === 'exception') {
      const result   = _buildExceptionLabel(picked.template);
      labelHTML      = result.html;
      _currentZip    = result.zip;
      _currentBelts  = result.belts;
      _currentMeta   = { qtype: 'exception', excId: picked.template.id,
                         state: picked.template.zipState, isRetest: !!picked.isRetest };
    } else if (picked.type === 'air') {
      const result   = _buildAirLabel(picked.group);
      labelHTML      = result.html;
      _currentZip    = result.zip;
      _currentBelts  = result.belts;
      isAir          = true;
      _currentMeta   = { qtype: 'air', svc: picked.group.rule.serviceCode,
                         state: null, isRetest: !!picked.isRetest };
    } else {
      const entry = picked.entry;
      // Apply MULTIDEST state override
      const isCchil = MULTIDEST_STATES.includes(entry.state);
      const belts = isCchil ? MULTIDEST_BELTS : entry.belts;
      _currentZip   = entry.zip;
      _currentBelts = belts;
      labelHTML     = _buildLabel(entry);
      _currentMeta  = { qtype: isCchil ? 'multidest' : 'ground',
                        state: entry.state, isRetest: !!picked.isRetest };
    }

    if (picked.isRetest) {
      labelHTML = '<div class="q-review-badge">Review — you missed this one before</div>' + labelHTML;
    }

    document.getElementById('q-label').innerHTML  = labelHTML;
    document.getElementById('q-fb').className     = 'fb';
    document.getElementById('btn-next').className = 'btn-next';

    const distractors = isAir
      ? _pickAirDistractors(_currentBelts[0])
      : _pickDistractors(_currentBelts);

    const choices = [..._currentBelts, ...distractors].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('q-choices');
    grid.innerHTML = '';
    choices.forEach((bi, idx) => {
      const btn       = document.createElement('button');
      btn.className   = 'choice';
      btn.dataset.bi  = bi;
      btn.style.setProperty('--belt-accent', BELT_COLORS[bi]);

      const code     = beltCode(bi);
      const desc     = beltDesc(bi);
      const keyBadge = '<span class="choice-key">' + (idx + 1) + '</span>';

      // Color name on top (bigger), PD/AF code smaller below
      if (desc) {
        btn.innerHTML =
          keyBadge +
          '<span class="c-name">' + desc + '</span>' +
          '<span class="c-code">' + code + '</span>';
      } else {
        // no separator — just show the full name
        btn.innerHTML = keyBadge + '<span class="c-name">' + code + '</span>';
      }

      btn.onclick = () => _answer(bi);
      grid.appendChild(btn);
    });
  }

  /* ─────────────────────────────────────────
     ANSWER
  ───────────────────────────────────────── */

  async function _answer(chosen) {
    if (_answered_q) return;
    _answered_q = true;

    const isMulti = _currentBelts.length > 1;
    const correct = _currentBelts.includes(chosen);

    _answered++;
    if (correct) _correct++;
    _updateStats();

    document.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      const bi = parseInt(b.dataset.bi);
      if (_currentBelts.includes(bi)) b.classList.add('show');
    });

    const fb = document.getElementById('q-fb');

    if (correct && isMulti) {
      document.querySelector('[data-bi="' + chosen + '"]').classList.replace('show', 'hit');
      const names = _currentBelts.map(b => beltCode(b)).join(', ');
      fb.className   = 'fb multi';
      fb.textContent = 'Correct — MULTIDEST load. Accepted: ' + names;
    } else if (correct) {
      document.querySelector('[data-bi="' + chosen + '"]').classList.replace('show', 'hit');
      fb.className   = 'fb ok';
      fb.textContent = 'Correct — ' + BELT_NAMES[chosen];
    } else {
      document.querySelector('[data-bi="' + chosen + '"]').classList.add('miss');
      const exp = _currentBelts.map(b => beltCode(b)).join(' or ');
      fb.className   = 'fb err';
      fb.textContent = 'Incorrect — correct answer: ' + exp;
    }

    // Adaptive layer: Elo update + spaced re-test scheduling
    const meta = _currentMeta || {};
    let adres = null;
    if (_adaptiveOn) {
      try {
        adres = Adaptive.recordAnswer({
          qtype: meta.qtype, svc: meta.svc, excId: meta.excId,
          state: meta.state, zip: _currentZip, belts: _currentBelts,
          correct, isRetest: !!meta.isRetest,
        });
        if (adres && adres.rated) {
          _updateEloChip(adres.delta);
          fb.textContent += '  ·  rating ' + (adres.delta >= 0 ? '+' : '') + adres.delta;
        } else if (meta.isRetest) {
          fb.textContent += '  ·  review (unrated)';
        }
      } catch (e) { console.error('[Quiz] adaptive record failed:', e); }
    }

    document.getElementById('btn-next').className = 'btn-next on';

    const flagBtn = document.getElementById('btn-flag');
    if (flagBtn) {
      flagBtn.style.display = 'inline-block';
      flagBtn.dataset.zip   = _currentZip;
      flagBtn.dataset.belt  = _currentBelts[0];
    }

    try {
      await Storage.addEvent({
        sorter_id:     App.currentUser(),
        zip:           _currentZip,
        expected_belt: _currentBelts[0],
        actual_belt:   chosen,
        correct,
        multi_valid:   isMulti,
        qtype:         meta.qtype || null,
        svc:           meta.svc || null,
        exc_id:        meta.excId || null,
        state:         meta.state || null,
        retest:        !!meta.isRetest,
        rated:         adres ? adres.rated : false,
        exp:           adres ? adres.expected : null,
      });
    } catch (e) {
      console.error('[Quiz] Failed to save sort event:', e);
      toast('Warning: result could not be saved (' + e.message + ')');
    }
  }

  /* ─────────────────────────────────────────
     SESSION RESULTS
  ───────────────────────────────────────── */

  function endSession() {
    const pct   = _answered ? Math.round(_correct / _answered * 100) : 0;
    const grade = pct >= 90 ? 'Proficient' : pct >= 75 ? 'Developing' : 'Needs Coaching';
    const cls   = pct >= 90 ? 'grade-a'   : pct >= 75 ? 'grade-b'   : 'grade-c';

    document.getElementById('res-score').textContent  = pct + '%';
    document.getElementById('res-grade').innerHTML    =
      '<span class="result-grade ' + cls + '">' + grade + '</span>';
    document.getElementById('res-detail').textContent =
      _correct + ' correct out of ' + _answered + ' questions';

    // Adaptive summary: rating, tier, session delta, focus areas
    const adEl = document.getElementById('res-adaptive');
    if (adEl) {
      adEl.innerHTML = '';
      if (_adaptiveOn && typeof Adaptive !== 'undefined' && Adaptive.isActive()) {
        const sum = Adaptive.sessionSummary();
        if (sum) {
          const focusHTML = sum.focus.length
            ? `<div class="res-focus">
                 <div class="res-focus-hd">Your next session will target:</div>
                 ${sum.focus.map(f =>
                   `<span class="res-focus-chip">${f.label} · ${f.missPct}% missed</span>`).join('')}
               </div>`
            : '';
          adEl.innerHTML = `
            <div class="res-elo-row">
              <span class="ladder-tier-chip" style="--tier-c:${sum.tier.color}">${sum.tier.name}</span>
              <span class="res-elo-rating">${sum.rating}</span>
              <span class="elo-delta ${sum.delta >= 0 ? 'up' : 'down'}">${sum.delta >= 0 ? '+' : ''}${sum.delta} this session</span>
            </div>
            ${focusHTML}`;
        }
      }
    }
  }

  function _updateStats() {
    document.getElementById('s-ans').textContent = _answered;
    document.getElementById('s-cor').textContent = _correct;
    const pct = _answered ? Math.round(_correct / _answered * 100) : null;
    document.getElementById('s-pct').textContent  = pct !== null ? pct + '%' : '—';
    document.getElementById('prog').style.width   = (pct || 0) + '%';
  }

  /* ─────────────────────────────────────────
     KEYBOARD SHORTCUTS
  ───────────────────────────────────────── */

  document.addEventListener('keydown', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const quizEl = document.getElementById('sorter-quiz');
    if (!quizEl || quizEl.style.display === 'none') return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const btn = document.getElementById('btn-next');
      if (btn && btn.classList.contains('on')) btn.click();
      return;
    }

    if (!_answered_q) {
      const idx = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
      if (idx !== undefined) {
        const choiceBtns = document.querySelectorAll('.choice');
        if (choiceBtns[idx]) choiceBtns[idx].click();
      }
    }
  });

  return {
    startSession, nextQuestion, endSession,
    getTruthArray, getTruthMap, getTruthCount,
    loadConfig, resolveAirSort,
  };

})();
