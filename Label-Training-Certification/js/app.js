/* ══════════════════════════════════════════════
   app.js — Main Controller

   Roles:
     sorter     — anyone with an employee ID
     supervisor — must appear in approved list
                  (managed by Admin)
     admin      — hardcoded IDs only
══════════════════════════════════════════════ */

const App = (() => {

  let _user     = null;   // employee ID string
  let _userName = null;   // display name (admin only)
  let _role     = 'sorter';
  let _adminFromAnalytics = false;  // true when admin is viewing supervisor analytics

  const AD_TABS = ['supervisors', 'flags', 'health', 'data', 'quiz', 'sort-test', 'passwords', 'truth'];
  const SV_TABS = ['overview', 'belts', 'sorters', 'aisles', 'matrix', 'knowledge', 'heatmap', 'overlays', 'roster', 'flags', 'ladder'];

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */

  async function init() {
    try { await Storage.init(); } catch (e) { console.error('[App] Storage init failed:', e); }
    _updateStorageBadge();
    // Load quiz config and push to engine
    try {
      const cfg = await Storage.getQuizConfig();
      if (cfg) Quiz.loadConfig(cfg);
    } catch (e) { console.error('[App] Quiz config load failed:', e); }
  }

  /* ─────────────────────────────────────────
     AUTH
  ───────────────────────────────────────── */

  function currentUser() { return _user; }
  function currentRole() { return _role; }

  // Internal state-only setter — kept for compatibility
  function setRole(r) { _role = r; }

  // Called from landing page role cards — transitions to credential step
  function selectRole(r) {
    _role = r;
    document.getElementById('login-landing').style.display = 'none';
    document.getElementById('login-creds').style.display   = '';
    const labels = { sorter: 'Sorter', supervisor: 'Supervisor', admin: 'Admin' };
    const lbl = document.getElementById('login-role-label');
    if (lbl) lbl.textContent = labels[r] || r;
    const pwdField = document.getElementById('pwd-field');
    if (pwdField) pwdField.style.display = (r === 'supervisor' || r === 'admin') ? 'block' : 'none';
    setTimeout(() => document.getElementById('inp-id')?.focus(), 50);
  }

  // Return from credential step back to landing
  function backToLanding() {
    document.getElementById('login-landing').style.display = '';
    document.getElementById('login-creds').style.display   = 'none';
    const idInp = document.getElementById('inp-id');
    if (idInp) idInp.value = '';
    const pwdInp = document.getElementById('inp-pwd');
    if (pwdInp) pwdInp.value = '';
  }

  async function login() {
    const raw   = document.getElementById('inp-id').value.trim();
    const pwd   = (document.getElementById('inp-pwd')?.value || '');
    const id    = raw.toUpperCase();
    const numId = raw.replace(/\s/g,'');

    if (!raw) { toast('Enter your Employee ID'); return; }

    const cfg = await Storage.getSystemConfig().catch(() => ({}));

    /* ── Admin ── */
    if (_role === 'admin') {
      if (numId === EASTER_EGG_ID) { _showEasterEgg(); return; }
      if (!ADMIN_IDS[numId]) {
        toast('Access denied — this ID does not have Admin privileges.');
        return;
      }
      const adminPwd = cfg.adminPassword || DEFAULT_ADMIN_PASSWORD;
      if (pwd !== adminPwd) {
        toast('Incorrect password.');
        return;
      }
      _user     = numId;
      _userName = ADMIN_IDS[numId];
      _completeLogin();
      return;
    }

    /* ── Supervisor ── */
    if (_role === 'supervisor') {
      const isAdmin = !!ADMIN_IDS[numId];
      let approved  = isAdmin;
      if (!approved) {
        try { approved = await Storage.isSupervisor(id); } catch (e) { console.error(e); }
      }
      if (!approved) {
        toast('Access denied — ask an Admin to grant Supervisor access.');
        return;
      }
      const svPwd = cfg.supervisorPassword || DEFAULT_SUPERVISOR_PASSWORD;
      if (pwd !== svPwd) {
        toast('Incorrect password.');
        return;
      }
      _user     = isAdmin ? numId : id;
      _userName = isAdmin ? ADMIN_IDS[numId] : null;
      _completeLogin();
      return;
    }

    /* ── Sorter — must be on roster ── */
    try {
      const allowed = await Storage.isSorterAllowed(id);
      if (!allowed) {
        toast('Access denied — ask a Supervisor to add your ID to the sorter roster.');
        return;
      }
    } catch (e) {
      toast('Could not verify access: ' + e.message);
      return;
    }
    _user     = id;
    _userName = null;
    _completeLogin();
  }

  function _completeLogin() {
    const roleLabel = _role === 'admin' ? 'Admin' : _role === 'supervisor' ? 'Supervisor' : 'Sorter';
    document.getElementById('hdr-id').textContent = (_userName || _user) + ' — ' + roleLabel;

    _updateStorageBadge();
    _navigateTo(_role);   // slide to the appropriate view
  }

  function logout() {
    _user     = null;
    _userName = null;
    _role     = 'sorter';
    _navigateTo('login');
    backToLanding();
  }

  function _showEasterEgg() {
    const inp = document.getElementById('inp-id');
    inp.value = '';
    inp.placeholder = EASTER_EGG_MSG;
    inp.style.color = 'var(--err)';
    setTimeout(() => {
      inp.placeholder = 'e.g. JD123';
      inp.style.color = '';
    }, 4000);
  }

  /* ─────────────────────────────────────────
     PAGE NAVIGATION — slide transitions
  ───────────────────────────────────────── */

  const PAGES = ['login', 'sorter', 'supervisor', 'admin'];

  function _navigateTo(target) {
    const header = document.getElementById('app-header');

    if (target === 'login') {
      // Slide everything right, show login
      PAGES.filter(p => p !== 'login').forEach(p => _setPageState(p, 'right'));
      _setPageState('login', 'active');
      header.style.display = 'none';
      return;
    }

    // Hide login, show header, activate target page
    _setPageState('login', 'left');
    header.style.display = 'flex';

    PAGES.filter(p => p !== 'login' && p !== target).forEach(p => _setPageState(p, 'right'));
    _setPageState(target, 'active');

    // Initialise the target view
    if (target === 'sorter') {
      Quiz.startSession();
    } else if (target === 'supervisor') {
      _initSupervisorPage();
      svTab('overview');
    } else if (target === 'admin') {
      _initAdminPage();
      adTab('supervisors');
    }
  }

  function _setPageState(page, state) {
    const el = document.getElementById('page-' + page);
    if (!el) return;
    el.className = 'page page-' + state;
  }

  /* ─────────────────────────────────────────
     ADMIN → SUPERVISOR PASS-THROUGH
     Lets admin view analytics + manage roster
     without logging out and re-entering.
  ───────────────────────────────────────── */

  function viewAnalyticsAsAdmin(startTab) {
    _adminFromAnalytics = true;
    // Set up the supervisor page to show the admin's identity
    const name = _userName || _user;
    const welcome = document.getElementById('sv-welcome');
    if (welcome) welcome.textContent = 'Welcome, ' + name + ' (Admin)';
    document.getElementById('hdr-id').textContent = name + ' — Admin';

    // Inject a "Back to Admin" button into the supervisor welcome bar
    let backBtn = document.getElementById('sv-back-admin');
    if (!backBtn) {
      backBtn = document.createElement('button');
      backBtn.id        = 'sv-back-admin';
      backBtn.className = 'btn-ghost sv-back-btn';
      backBtn.textContent = 'Back to Admin';
      backBtn.onclick   = backFromAnalyticsToAdmin;
      const bar = document.querySelector('.sv-welcome-bar');
      if (bar) bar.appendChild(backBtn);
    }

    // Slide to supervisor page
    _setPageState('admin',      'left');
    _setPageState('supervisor', 'active');
    svTab(startTab || 'overview');
  }

  function backFromAnalyticsToAdmin() {
    _adminFromAnalytics = false;
    const btn = document.getElementById('sv-back-admin');
    if (btn) btn.remove();
    const name = _userName || _user;
    document.getElementById('hdr-id').textContent = name + ' — Admin';
    _setPageState('supervisor', 'right');
    _setPageState('admin',      'active');
    adTab('supervisors');
  }

  /* ─────────────────────────────────────────
     SUPERVISOR TABS
  ───────────────────────────────────────── */

  function svTab(tab) {
    SV_TABS.forEach((t, i) => {
      document.getElementById('sv-' + t).style.display = t === tab ? 'block' : 'none';
      document.querySelectorAll('#page-supervisor .tab')[i].classList.toggle('on', t === tab);
    });
    const renders = {
      overview:  () => Analytics.renderOverview(),
      belts:     () => Analytics.renderBelts(),
      sorters:   () => Analytics.renderSorters(),
      matrix:    () => Analytics.renderMatrix(),
      knowledge: () => Analytics.renderKnowledgeMap(),
      heatmap:   () => Analytics.renderHeatmap(),
      overlays:  () => Analytics.renderOverlays(),
      roster:    () => _renderSorterRoster(),
      aisles:    () => Analytics.renderAisles(),
      flags:     () => Analytics.renderSvFlags(),
      ladder:    () => Adaptive.renderLeaderboard('sv-ladder'),
    };
    if (renders[tab]) renders[tab]().catch(e => toast('Error loading data: ' + e.message));
  }

  /* ─────────────────────────────────────────
     ADMIN TABS
  ───────────────────────────────────────── */

  async function _initSupervisorPage() {
    // Look up the supervisor's name from the roles list; fall back to employee ID
    try {
      const roles = await Storage.getSupervisors();
      const entry = roles.find(s => s.employee_id === String(_user));
      if (entry && entry.name) _userName = entry.name;
    } catch (_) { /* non-fatal */ }
    const display = _userName || _user;
    document.getElementById('sv-welcome').textContent = 'Welcome, ' + display;
    // Also keep the header in sync with any resolved name
    const roleLabel = 'Supervisor';
    document.getElementById('hdr-id').textContent = display + ' — ' + roleLabel;
  }

  function _initAdminPage() {
    const name = _userName || _user;
    document.getElementById('ad-welcome').textContent = 'Welcome, ' + name;
  }

  function adTab(tab) {
    AD_TABS.forEach((t, i) => {
      document.getElementById('ad-' + t).style.display = t === tab ? 'block' : 'none';
      document.querySelectorAll('#page-admin .tab')[i].classList.toggle('on', t === tab);
    });
    const renders = {
      supervisors: () => Analytics.renderSupervisors(),
      flags:       () => Analytics.renderAdFlags(),
      health:      () => Analytics.renderSystemHealth(),
      data:        () => Analytics.renderDataManagement(),
      quiz:        () => _renderQuizSettings(),
      'sort-test': () => _renderSortTestBuilder(),
      passwords:   () => _renderPasswordSettings(),
      truth:       () => _renderTruthEditor(),
    };
    if (renders[tab]) renders[tab]().catch(e => toast('Error loading data: ' + e.message));
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — SUPERVISOR MANAGEMENT
  ───────────────────────────────────────── */

  async function addSupervisor() {
    const id   = document.getElementById('ad-sup-id').value.trim().toUpperCase();
    const name = document.getElementById('ad-sup-name').value.trim();
    if (!id) { toast('Enter an Employee ID'); return; }

    // Prevent adding an admin ID as supervisor (not needed, but clean)
    if (ADMIN_IDS[id]) { toast('This ID already has Admin access — no need to add as Supervisor'); return; }

    try {
      await Storage.addSupervisor({ employee_id: id, name: name || '', added_by: _user });
      await Storage.addAudit({ entity: 'supervisor_roles', action: 'ADD', actor: _user, after: { employee_id: id, name } });
      toast('Supervisor access granted to ' + id);
      document.getElementById('ad-sup-id').value   = '';
      document.getElementById('ad-sup-name').value = '';
      await Analytics.renderSupervisors();
    } catch (e) {
      toast('Could not add supervisor: ' + e.message);
      console.error('[App] addSupervisor error:', e);
    }
  }

  async function removeSupervisor(id) {
    if (!confirm('Remove Supervisor access for ' + id + '?')) return;
    try {
      await Storage.removeSupervisor(id);
      await Storage.addAudit({ entity: 'supervisor_roles', action: 'REMOVE', actor: _user, after: { employee_id: id } });
      toast('Supervisor access removed for ' + id);
      await Analytics.renderSupervisors();
    } catch (e) {
      toast('Could not remove supervisor: ' + e.message);
      console.error('[App] removeSupervisor error:', e);
    }
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — DATA MANAGEMENT
  ───────────────────────────────────────── */

  async function loadTruth() {
    const btn  = document.getElementById('btn-load-truth');
    const prog = document.getElementById('load-prog');
    btn.disabled = true;
    btn.textContent = 'Loading...';
    prog.textContent = '';
    try {
      const entries = Quiz.getTruthArray();
      const loaded  = await Storage.loadTruth(entries, (done, total) => {
        const pct = Math.round(done / total * 100);
        prog.textContent = 'Loading... ' + done.toLocaleString() + ' / ' + total.toLocaleString() + ' (' + pct + '%)';
      });
      prog.textContent = loaded.toLocaleString() + ' ZIPs loaded.';
      toast('Truth table loaded — ' + loaded.toLocaleString() + ' ZIPs');
      Analytics.renderSystemHealth().catch(() => {});
    } catch (e) {
      prog.textContent = 'Load failed: ' + e.message;
      toast('Load failed: ' + e.message);
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Load Truth Table';
    }
  }

  async function clearEvents() {
    if (!confirm('Clear ALL sort events? This cannot be undone.')) return;
    try {
      await Storage.clearEvents();
      toast('Sort events cleared');
      Analytics.renderSystemHealth().catch(() => {});
    } catch (e) { toast('Could not clear events: ' + e.message); }
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — QUIZ SETTINGS
  ───────────────────────────────────────── */

  // All US state codes for the quiz settings grid
  const _ALL_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  ];

  // Tracks which belts and states are currently highlighted in the settings UI
  let _qcfgBoostedStates = new Set();
  let _qcfgBeltFilter    = new Set();   // belt indices to restrict quiz to (empty = all belts)

  async function _renderQuizSettings() {
    const cfg = (await Storage.getQuizConfig()) || {};
    const excW    = cfg.exceptionWeight || 5;
    const airW    = cfg.airWeight       || 3;
    const multidestW  = cfg.multidestWeight !== undefined ? cfg.multidestWeight : 8;
    const incAir  = cfg.includeAir !== false;
    const stWts   = cfg.stateWeights || {};
    const bltFilt = new Set(cfg.beltFilter || []);     // belt indices to focus on
    const named   = cfg.namedPresets  || [];           // saved Sort Test Builder presets

    // Derive boosted states (any state with weight > 1)
    _qcfgBoostedStates = new Set(Object.keys(stWts).filter(s => (stWts[s] || 1) > 1));
    _qcfgBeltFilter    = new Set(bltFilt);
    const boostVal = Math.max(...Object.values(stWts).filter(v => v > 1), 5);

    const panel = document.getElementById('ad-quiz');
    if (!panel) return;

    // Build state grid HTML
    const stateGrid = _ALL_STATES.map(s => {
      const active = _qcfgBoostedStates.has(s) ? ' qst-active' : '';
      return `<button class="qst-btn${active}" onclick="App.toggleQuizState('${s}')" id="qst-${s}">${s}</button>`;
    }).join('');

    // Build belt filter grid HTML (standard belts 0-13, plus AF1=14, AF2=15)
    const beltGrid = BELT_NAMES.map((name, i) => {
      const active = _qcfgBeltFilter.has(i) ? ' qbelt-active' : '';
      return `<button class="qbelt-btn${active}" onclick="App.toggleQuizBelt(${i})" id="qbelt-${i}">${beltCode(i)}</button>`;
    }).join('');

    const adaptOn = cfg.adaptiveEnabled !== false;

    panel.innerHTML = `
      <div class="card">
        <div class="card-hd">Quiz Randomization Settings</div>
        <div class="banner banner-info" style="margin-bottom:16px;">
          Changes take effect for the next quiz session. Settings are saved to the shared folder
          (or locally if no shared folder is connected) and apply to all machines.
        </div>

        <div class="qcfg-row">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
            <label class="lbl" style="margin:0;">Adaptive testing</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;">
              <input type="checkbox" id="qcfg-adaptive" ${adaptOn ? 'checked' : ''}> Enabled
            </label>
          </div>
          <p class="qcfg-desc">
            When enabled, each sorter's quiz auto-targets their personal weak spots
            (computed from their own answer history — no setup needed), re-tests missed
            questions on a spaced schedule, and maintains the Elo rating ladder.
            The weights below act as the baseline that adaptation builds on.
          </p>
        </div>

        <div class="qcfg-row">
          <label class="lbl">Shipper error exception weight</label>
          <div class="qcfg-slider-row">
            <input type="range" id="qcfg-exc" min="1" max="20" value="${excW}"
              oninput="document.getElementById('qcfg-exc-v').textContent=this.value+'x'">
            <span class="qcfg-val" id="qcfg-exc-v">${excW}x</span>
          </div>
          <p class="qcfg-desc">How much more often shipper-error exception questions appear vs normal ZIPs (default 5x)</p>
        </div>

        <div class="qcfg-row">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
            <label class="lbl" style="margin:0;">Air sort questions</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;">
              <input type="checkbox" id="qcfg-air-on" ${incAir ? 'checked' : ''}> Include
            </label>
          </div>
          <div class="qcfg-slider-row">
            <input type="range" id="qcfg-air" min="1" max="20" value="${airW}"
              oninput="document.getElementById('qcfg-air-v').textContent=this.value+'x'">
            <span class="qcfg-val" id="qcfg-air-v">${airW}x</span>
          </div>
          <p class="qcfg-desc">Frequency of NDA / 2-day / international air sort questions (default 3x)</p>
        </div>

        <div class="qcfg-row">
          <label class="lbl">MULTIDEST state pool weight</label>
          <div class="qcfg-slider-row">
            <input type="range" id="qcfg-multidest" min="0" max="20" value="${multidestW}"
              oninput="document.getElementById('qcfg-multidest-v').textContent=this.value+'x'">
            <span class="qcfg-val" id="qcfg-multidest-v">${multidestW}x</span>
          </div>
          <p class="qcfg-desc">How heavily the 13 MULTIDEST states (MS, IA, WI, MN…) are sampled relative to the average state.
            0 = never, 8 = default (~15% of questions), 20 = heavily emphasized.</p>
        </div>

        <div class="qcfg-row">
          <label class="lbl">Belt focus — limit quiz to specific belts</label>
          <p class="qcfg-desc" style="margin-bottom:10px;">
            Highlight belts to restrict questions to only those destinations.
            Leave all un-highlighted to include every belt (normal mode).
          </p>
          <div class="qbelt-grid">${beltGrid}</div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
              onclick="App.qbeltPreset('all')">Select All</button>
            <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
              onclick="App.qbeltPreset('none')">Clear All</button>
          </div>
        </div>

        <div class="qcfg-row">
          <label class="lbl">State boost — focus on specific states</label>
          <p class="qcfg-desc" style="margin-bottom:10px;">
            Click states to highlight. Highlighted states appear more often in the quiz.
          </p>
          <div class="qst-grid">${stateGrid}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;">
            <span class="lbl" style="margin:0;">Boost weight:</span>
            <input type="number" id="qcfg-boost" min="2" max="30" value="${boostVal}"
              style="width:64px;" class="inp">
            <span style="font-size:12px;color:var(--text-soft);">× more likely than un-highlighted states</span>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
              onclick="App.qcfgPreset('northeast')">Northeast (MA ME VT NH NJ RI CT)</button>
            <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
              onclick="App.qcfgPreset('multidest')">MULTIDEST States</button>
            <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
              onclick="App.qcfgPreset('none')">Clear All</button>
          </div>
        </div>

        ${named.length ? `
        <div class="qcfg-row">
          <label class="lbl">Saved test criteria</label>
          <p class="qcfg-desc" style="margin-bottom:10px;">
            Apply a saved Sort Test Builder preset. This sets the belt filter and saves immediately.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${named.map((p, idx) => `
              <button class="btn-ghost" style="font-size:11px;padding:5px 10px;"
                onclick="App._stbApplyPreset(${idx})">${p.name}</button>
            `).join('')}
          </div>
        </div>` : ''}

        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
          <button class="btn-gold" onclick="App.saveQuizConfig()">Save Settings</button>
          <button class="btn-ghost" onclick="App.resetQuizConfig()">Reset to Defaults</button>
        </div>
      </div>
    `;
  }

  function toggleQuizState(state) {
    if (_qcfgBoostedStates.has(state)) {
      _qcfgBoostedStates.delete(state);
    } else {
      _qcfgBoostedStates.add(state);
    }
    const btn = document.getElementById('qst-' + state);
    if (btn) btn.classList.toggle('qst-active', _qcfgBoostedStates.has(state));
  }

  function qcfgPreset(preset) {
    const NE    = ['MA','ME','VT','NH','NJ','RI','CT'];
    const MULTIDEST = (typeof MULTIDEST_STATES !== 'undefined') ? MULTIDEST_STATES.slice() : [];  // config-driven (WS5)
    _qcfgBoostedStates = new Set(
      preset === 'northeast' ? NE :
      preset === 'multidest'     ? MULTIDEST : []
    );
    // Re-render the state buttons
    document.querySelectorAll('.qst-btn').forEach(btn => {
      const s = btn.textContent;
      btn.classList.toggle('qst-active', _qcfgBoostedStates.has(s));
    });
  }

  function toggleQuizBelt(beltIdx) {
    if (_qcfgBeltFilter.has(beltIdx)) {
      _qcfgBeltFilter.delete(beltIdx);
    } else {
      _qcfgBeltFilter.add(beltIdx);
    }
    const btn = document.getElementById('qbelt-' + beltIdx);
    if (btn) btn.classList.toggle('qbelt-active', _qcfgBeltFilter.has(beltIdx));
  }

  function qbeltPreset(preset) {
    if (preset === 'all') {
      _qcfgBeltFilter = new Set(BELT_NAMES.map((_, i) => i));
    } else {
      _qcfgBeltFilter = new Set();
    }
    document.querySelectorAll('.qbelt-btn').forEach(btn => {
      const i = parseInt(btn.id.replace('qbelt-', ''));
      btn.classList.toggle('qbelt-active', _qcfgBeltFilter.has(i));
    });
  }

  async function saveQuizConfig() {
    const excW   = parseInt(document.getElementById('qcfg-exc')?.value  || 5);
    const airW   = parseInt(document.getElementById('qcfg-air')?.value  || 3);
    const multidestW = parseInt(document.getElementById('qcfg-multidest')?.value !== undefined
      ? document.getElementById('qcfg-multidest').value : 8);
    const incAir = document.getElementById('qcfg-air-on')?.checked !== false;
    const boost  = parseInt(document.getElementById('qcfg-boost')?.value || 5);

    const stateWeights = {};
    for (const s of _qcfgBoostedStates) stateWeights[s] = boost;

    const beltFilter = [..._qcfgBeltFilter];

    const cfg = {
      exceptionWeight: excW,
      airWeight:       airW,
      multidestWeight:     isNaN(multidestW) ? 8 : multidestW,
      includeAir:      incAir,
      adaptiveEnabled: document.getElementById('qcfg-adaptive')?.checked !== false,
      stateWeights,
      beltFilter,
    };
    try {
      await Storage.saveQuizConfig(cfg);
      Quiz.loadConfig(cfg);
      toast('Quiz settings saved');
    } catch (e) {
      toast('Could not save quiz settings: ' + e.message);
    }
  }

  async function resetQuizConfig() {
    if (!confirm('Reset quiz settings to defaults?')) return;
    const cfg = {
      exceptionWeight: 5,
      airWeight:       3,
      multidestWeight:     4,
      includeAir:      true,
      adaptiveEnabled: true,
      stateWeights:    {},
      beltFilter:      [],
    };
    _qcfgBeltFilter = new Set();
    await Storage.saveQuizConfig(cfg);
    Quiz.loadConfig(cfg);
    await _renderQuizSettings();
    toast('Quiz settings reset to defaults');
  }

  /* ─────────────────────────────────────────
     NAMED QUIZ PRESET SYSTEM
     Admin can save named filter criteria that
     appear as preset buttons in Quiz Settings.
     Presets include belt filter + state weights
     + a human-readable label.
  ───────────────────────────────────────── */

  async function _renderSortTestBuilder() {
    const panel = document.getElementById('ad-sort-test');
    if (!panel) return;

    const cfg     = (await Storage.getQuizConfig()) || {};
    const presets = cfg.namedPresets || [];

    // Build belt grid for the builder
    const beltGridHTML = BELT_NAMES.map((name, i) => {
      return `<button class="qbelt-btn" id="stb-belt-${i}" onclick="App._stbToggleBelt(${i})">${beltCode(i)}</button>`;
    }).join('');

    const presetRows = presets.length
      ? presets.map((p, idx) => `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td style="font-size:11px;color:var(--text-soft);">${
              p.beltFilter && p.beltFilter.length
                ? p.beltFilter.map(bi => beltCode(bi)).join(', ')
                : 'All belts'
            }</td>
            <td>
              <button class="btn-ghost" style="font-size:11px;padding:4px 10px;margin-right:4px;"
                onclick="App._stbApplyPreset(${idx})">Apply to Quiz</button>
              <button class="btn-danger" style="font-size:11px;padding:4px 10px;"
                onclick="App.deleteNamedQuizPreset(${idx})">Delete</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="3" style="color:var(--text-soft);padding:14px;">No saved test criteria yet.</td></tr>';

    panel.innerHTML = `
      <div class="card">
        <div class="card-hd">Sort Test Builder</div>
        <div class="banner banner-info" style="margin-bottom:16px;">
          Create named quiz filter criteria — e.g. "PD-08 + PD-12 missort drill".
          Saved criteria appear as preset buttons in the Quiz Settings tab and can be
          applied to any quiz session on the spot. Delete criteria when no longer needed.
        </div>

        <div class="qcfg-row">
          <label class="lbl">Criteria name</label>
          <input class="inp" id="stb-name" placeholder="e.g. PD-08 and PD-12 missort drill"
            style="max-width:380px;">
        </div>

        <div class="qcfg-row">
          <label class="lbl">Belts to focus on</label>
          <p class="qcfg-desc" style="margin-bottom:8px;">
            Select one or more belts. Leave all un-highlighted to include every belt.
          </p>
          <div class="qbelt-grid" id="stb-belt-grid">${beltGridHTML}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-ghost" style="font-size:11px;padding:4px 10px;"
              onclick="App._stbSelectAllBelts()">Select All</button>
            <button class="btn-ghost" style="font-size:11px;padding:4px 10px;"
              onclick="App._stbClearBelts()">Clear</button>
          </div>
        </div>

        <div style="margin-top:18px;">
          <button class="btn-gold" onclick="App.saveNamedQuizPreset()">Save Criteria</button>
        </div>
      </div>

      <div class="card" style="margin-top:18px;">
        <div class="card-hd">Saved Test Criteria</div>
        <table>
          <thead><tr><th>Name</th><th>Belt Filter</th><th>Actions</th></tr></thead>
          <tbody>${presetRows}</tbody>
        </table>
      </div>
    `;
  }

  // Module-level set tracking the Sort Test Builder belt selection
  let _stbBelts = new Set();

  function _stbToggleBelt(i) {
    if (_stbBelts.has(i)) { _stbBelts.delete(i); } else { _stbBelts.add(i); }
    const btn = document.getElementById('stb-belt-' + i);
    if (btn) btn.classList.toggle('qbelt-active', _stbBelts.has(i));
  }

  function _stbSelectAllBelts() {
    _stbBelts = new Set(BELT_NAMES.map((_, i) => i));
    document.querySelectorAll('#stb-belt-grid .qbelt-btn').forEach((b, i) => b.classList.add('qbelt-active'));
  }

  function _stbClearBelts() {
    _stbBelts = new Set();
    document.querySelectorAll('#stb-belt-grid .qbelt-btn').forEach(b => b.classList.remove('qbelt-active'));
  }

  async function saveNamedQuizPreset() {
    const name = document.getElementById('stb-name')?.value.trim();
    if (!name) { toast('Enter a name for this criteria'); return; }

    const beltFilter = [..._stbBelts];
    const cfg = (await Storage.getQuizConfig()) || {};
    const presets = cfg.namedPresets || [];

    // Check for duplicate names
    if (presets.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast('A criteria with that name already exists'); return;
    }

    presets.push({ name, beltFilter });
    cfg.namedPresets = presets;
    try {
      await Storage.saveQuizConfig(cfg);
      Quiz.loadConfig(cfg);
      toast('Criteria "' + name + '" saved');
      _stbBelts = new Set();
      await _renderSortTestBuilder();
      // Also refresh quiz settings if it's currently visible
      const qp = document.getElementById('ad-quiz');
      if (qp && qp.style.display !== 'none') await _renderQuizSettings();
    } catch (e) {
      toast('Could not save: ' + e.message);
    }
  }

  async function deleteNamedQuizPreset(idx) {
    const cfg = (await Storage.getQuizConfig()) || {};
    const presets = cfg.namedPresets || [];
    const preset  = presets[idx];
    if (!preset) return;
    if (!confirm('Delete criteria "' + preset.name + '"?')) return;
    presets.splice(idx, 1);
    cfg.namedPresets = presets;
    try {
      await Storage.saveQuizConfig(cfg);
      Quiz.loadConfig(cfg);
      toast('Criteria deleted');
      await _renderSortTestBuilder();
      const qp = document.getElementById('ad-quiz');
      if (qp && qp.style.display !== 'none') await _renderQuizSettings();
    } catch (e) {
      toast('Could not delete: ' + e.message);
    }
  }

  async function _stbApplyPreset(idx) {
    const cfg     = (await Storage.getQuizConfig()) || {};
    const presets = cfg.namedPresets || [];
    const preset  = presets[idx];
    if (!preset) return;
    // Apply belt filter from preset into the live config
    cfg.beltFilter = preset.beltFilter || [];
    await Storage.saveQuizConfig(cfg);
    Quiz.loadConfig(cfg);
    toast('Applied "' + preset.name + '" — settings saved');
    // Re-render quiz settings if visible
    const qp = document.getElementById('ad-quiz');
    if (qp && qp.style.display !== 'none') await _renderQuizSettings();
  }

  /* ─────────────────────────────────────────
     SUPERVISOR ACTIONS — SORTER ROSTER
  ───────────────────────────────────────── */

  async function _renderSorterRoster() {
    const wrap = document.getElementById('sv-roster');
    if (!wrap) return;
    const roster = await Storage.getSorterRoster().catch(() => []);

    wrap.innerHTML = `
      <div class="card">
        <div class="card-hd">Add Sorter to Roster</div>
        <p style="font-size:12px;color:var(--text-soft);margin-bottom:14px;line-height:1.6;">
          Only employees on this roster can log in as Sorter.
          Assign each sorter to their sort aisle for performance tracking.
        </p>
        <div class="ov-form" style="grid-template-columns:1fr 1fr 1fr auto;">
          <div class="fl">
            <label class="lbl">Employee ID</label>
            <input class="inp" id="sv-sor-id" placeholder="e.g. 1234567" autocomplete="off"
              onkeydown="if(event.key==='Enter') App.addSorterToRoster()">
          </div>
          <div class="fl">
            <label class="lbl">Name (optional)</label>
            <input class="inp" id="sv-sor-name" placeholder="e.g. Jane Doe"
              onkeydown="if(event.key==='Enter') App.addSorterToRoster()">
          </div>
          <div class="fl">
            <label class="lbl">Sort Aisle</label>
            <select class="inp" id="sv-sor-aisle">
              <option value="">— Unassigned —</option>
              <option value="Sort-1">Sort-1</option>
              <option value="Sort-2">Sort-2</option>
              <option value="Sort-3">Sort-3</option>
              <option value="Sort-4">Sort-4</option>
            </select>
          </div>
          <button class="btn-gold" style="height:40px;align-self:end;"
            onclick="App.addSorterToRoster()">Add Sorter</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hd">Approved Sorters (${roster.length})</div>
        <table>
          <thead>
            <tr><th>Employee ID</th><th>Name</th><th>Aisle</th><th>Added By</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${roster.map(s => `
              <tr>
                <td><strong>${s.employee_id}</strong></td>
                <td>${s.name || '—'}</td>
                <td>${s.sort_aisle ? `<span class="aisle-badge">${s.sort_aisle}</span>` : '<span style="color:var(--text-soft);font-size:11px;">—</span>'}</td>
                <td>${s.added_by || '—'}</td>
                <td style="font-size:11px;color:var(--text-soft);">${(s.added_at || '').slice(0, 10)}</td>
                <td>
                  <button class="btn-danger" style="padding:4px 10px;font-size:11px;"
                    onclick="App.removeSorterFromRoster('${s.employee_id}')">Remove</button>
                </td>
              </tr>`).join('') ||
            '<tr><td colspan="6" style="color:var(--text-soft);padding:16px;">No sorters on roster yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  async function addSorterToRoster() {
    const id    = (document.getElementById('sv-sor-id')?.value    || '').trim().toUpperCase();
    const name  = (document.getElementById('sv-sor-name')?.value  || '').trim();
    const aisle = (document.getElementById('sv-sor-aisle')?.value || '').trim();
    if (!id) { toast('Enter an Employee ID'); return; }
    try {
      await Storage.addSorterToRoster({ employee_id: id, name: name || '', sort_aisle: aisle || null, added_by: _user });
      await Storage.addAudit({ entity: 'sorter_roster', action: 'ADD', actor: _user,
        after: { employee_id: id, name, sort_aisle: aisle || null } });
      toast('Sorter ' + id + ' added to roster');
      document.getElementById('sv-sor-id').value    = '';
      document.getElementById('sv-sor-name').value  = '';
      document.getElementById('sv-sor-aisle').value = '';
      await _renderSorterRoster();
    } catch (e) {
      toast('Could not add sorter: ' + e.message);
    }
  }

  async function removeSorterFromRoster(id) {
    if (!confirm('Remove ' + id + ' from the sorter roster?')) return;
    try {
      await Storage.removeSorterFromRoster(id);
      await Storage.addAudit({ entity: 'sorter_roster', action: 'REMOVE', actor: _user,
        after: { employee_id: id } });
      toast('Sorter ' + id + ' removed from roster');
      await _renderSorterRoster();
    } catch (e) {
      toast('Could not remove sorter: ' + e.message);
    }
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — PASSWORD MANAGEMENT
  ───────────────────────────────────────── */

  async function _renderPasswordSettings() {
    const panel = document.getElementById('ad-passwords');
    if (!panel) return;
    const cfg = await Storage.getSystemConfig().catch(() => ({}));

    const svPwd   = cfg.supervisorPassword    || DEFAULT_SUPERVISOR_PASSWORD;
    const svBy    = cfg.supervisorPasswordSetBy;
    const svAt    = cfg.supervisorPasswordSetAt;
    const adPwd   = cfg.adminPassword          || DEFAULT_ADMIN_PASSWORD;
    const adBy    = cfg.adminPasswordSetBy;
    const adAt    = cfg.adminPasswordSetAt;

    const setLine = (by, at) => by
      ? `Last set by <strong>${by}</strong> on ${(at || '').slice(0, 10)}`
      : 'Using default — no changes have been saved yet';

    panel.innerHTML = `
      <div class="card">
        <div class="card-hd">Supervisor Password</div>
        <div class="pwd-current">
          <span class="pwd-lbl">Current password:</span>
          <code class="pwd-val">${svPwd}</code>
        </div>
        <p class="pwd-set-info">${setLine(svBy, svAt)}</p>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div class="fl" style="margin-bottom:0;min-width:220px;">
            <label class="lbl">New supervisor password</label>
            <input class="inp" type="text" id="sv-pwd-new" placeholder="New password"
              autocomplete="off"
              onkeydown="if(event.key==='Enter') App.changeSupervisorPassword()">
          </div>
          <button class="btn-gold" style="height:40px;"
            onclick="App.changeSupervisorPassword()">Save</button>
        </div>
      </div>

      <div class="card">
        <div class="card-hd">Admin Password</div>
        <div class="pwd-current">
          <span class="pwd-lbl">Current password:</span>
          <code class="pwd-val">${adPwd}</code>
        </div>
        <p class="pwd-set-info">${setLine(adBy, adAt)}</p>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div class="fl" style="margin-bottom:0;min-width:220px;">
            <label class="lbl">New admin password</label>
            <input class="inp" type="text" id="ad-pwd-new" placeholder="New password"
              autocomplete="off"
              onkeydown="if(event.key==='Enter') App.changeAdminPassword()">
          </div>
          <button class="btn-gold" style="height:40px;"
            onclick="App.changeAdminPassword()">Save</button>
        </div>
      </div>
    `;
  }

  async function changeSupervisorPassword() {
    const pwd = (document.getElementById('sv-pwd-new')?.value || '').trim();
    if (!pwd) { toast('Enter a new password'); return; }
    if (pwd.length < 2) { toast('Password must be at least 2 characters'); return; }
    try {
      const cfg = await Storage.getSystemConfig().catch(() => ({}));
      cfg.supervisorPassword      = pwd;
      cfg.supervisorPasswordSetBy = _user;
      cfg.supervisorPasswordSetAt = new Date().toISOString();
      await Storage.saveSystemConfig(cfg);
      const inp = document.getElementById('sv-pwd-new');
      if (inp) inp.value = '';
      toast('Supervisor password updated');
      await _renderPasswordSettings();
    } catch (e) { toast('Could not save: ' + e.message); }
  }

  async function changeAdminPassword() {
    const pwd = (document.getElementById('ad-pwd-new')?.value || '').trim();
    if (!pwd) { toast('Enter a new password'); return; }
    if (pwd.length < 2) { toast('Password must be at least 2 characters'); return; }
    try {
      const cfg = await Storage.getSystemConfig().catch(() => ({}));
      cfg.adminPassword      = pwd;
      cfg.adminPasswordSetBy = _user;
      cfg.adminPasswordSetAt = new Date().toISOString();
      await Storage.saveSystemConfig(cfg);
      const inp = document.getElementById('ad-pwd-new');
      if (inp) inp.value = '';
      toast('Admin password updated');
      await _renderPasswordSettings();
    } catch (e) { toast('Could not save: ' + e.message); }
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — TRUTH TABLE EDITOR
  ───────────────────────────────────────── */

  let _tsMode    = 'zip';
  let _tsResults = [];

  function _renderTruthEditor() {
    const panel = document.getElementById('ad-truth');
    if (!panel) return;

    panel.innerHTML = `
      <div class="card">
        <div class="card-hd">Search and Update Routing</div>
        <div class="banner banner-warn" style="margin-bottom:14px;">
          Changes update local routing immediately. In shared-folder mode, edits are also
          logged to <code>truth_edits.jsonl</code> for audit and re-application on other machines.
        </div>

        <div class="truth-mode-row">
          <button class="btn-ghost ts-mode-btn ${_tsMode === 'zip' ? 'ts-active' : ''}"
            onclick="App._truthMode('zip')">By ZIP / Range</button>
          <button class="btn-ghost ts-mode-btn ${_tsMode === 'city' ? 'ts-active' : ''}"
            onclick="App._truthMode('city')">By City + SLIC</button>
        </div>

        <div id="ts-zip-panel" style="${_tsMode === 'zip' ? '' : 'display:none;'}margin-top:12px;">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div class="fl">
              <label class="lbl">From ZIP</label>
              <input id="ts-from" class="inp" placeholder="e.g. 01701" maxlength="5"
                onkeydown="if(event.key==='Enter') App.searchTruth()">
            </div>
            <div class="fl">
              <label class="lbl">To ZIP (blank = single)</label>
              <input id="ts-to" class="inp" placeholder="e.g. 01705 (optional)" maxlength="5"
                onkeydown="if(event.key==='Enter') App.searchTruth()">
            </div>
          </div>
        </div>

        <div id="ts-city-panel" style="${_tsMode === 'city' ? '' : 'display:none;'}margin-top:12px;">
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div class="fl">
              <label class="lbl">City Name</label>
              <input id="ts-city" class="inp" placeholder="e.g. Framingham"
                onkeydown="if(event.key==='Enter') App.searchTruth()">
            </div>
            <div class="fl">
              <label class="lbl">SLIC (optional)</label>
              <input id="ts-slic" class="inp" placeholder="e.g. 0170" maxlength="4"
                onkeydown="if(event.key==='Enter') App.searchTruth()">
            </div>
          </div>
        </div>

        <div style="margin-top:12px;">
          <button class="btn-gold" onclick="App.searchTruth()">Search</button>
        </div>

        <div id="ts-results" style="margin-top:18px;"></div>
      </div>

      <div class="card">
        <div class="card-hd">Recent Routing Edits</div>
        <div id="ts-edits-list">
          <p style="font-size:12px;color:var(--text-soft);">Loading...</p>
        </div>
      </div>
    `;

    _loadTruthEdits();
  }

  function _truthMode(mode) {
    _tsMode = mode;
    const zipPanel  = document.getElementById('ts-zip-panel');
    const cityPanel = document.getElementById('ts-city-panel');
    if (zipPanel && cityPanel) {
      zipPanel.style.display  = mode === 'zip'  ? '' : 'none';
      cityPanel.style.display = mode === 'city' ? '' : 'none';
    }
    // Update active button styling
    document.querySelectorAll('.ts-mode-btn').forEach(btn => {
      btn.classList.toggle('ts-active', btn.textContent.toLowerCase().startsWith(mode === 'zip' ? 'by z' : 'by c'));
    });
    _tsResults = [];
    const resultsEl = document.getElementById('ts-results');
    if (resultsEl) resultsEl.innerHTML = '';
  }

  async function searchTruth() {
    const resultsEl = document.getElementById('ts-results');
    if (!resultsEl) return;
    resultsEl.innerHTML = '<p style="font-size:12px;color:var(--text-soft);">Searching...</p>';

    let results = [];
    try {
      if (_tsMode === 'zip') {
        const from = (document.getElementById('ts-from')?.value || '').trim().padStart(5, '0');
        const to   = (document.getElementById('ts-to')?.value  || '').trim();
        if (!from || from === '00000') { toast('Enter a ZIP code'); resultsEl.innerHTML = ''; return; }
        if (!/^\d{5}$/.test(from)) { toast('ZIP must be 5 digits'); resultsEl.innerHTML = ''; return; }
        if (to) {
          const toPadded = to.padStart(5, '0');
          results = await Storage.searchTruth({ zipFrom: from, zipTo: toPadded });
        } else {
          results = await Storage.searchTruth({ zip: from });
        }
      } else {
        const city = (document.getElementById('ts-city')?.value || '').trim();
        const slic = (document.getElementById('ts-slic')?.value || '').trim();
        if (!city && !slic) { toast('Enter a city name or SLIC'); resultsEl.innerHTML = ''; return; }
        results = await Storage.searchTruth({ city: city || null, slic: slic || null });
      }
    } catch (e) {
      toast('Search error: ' + e.message);
      resultsEl.innerHTML = '';
      return;
    }

    _tsResults = results;
    _renderTruthResults(results, resultsEl);
  }

  function _renderTruthResults(results, container) {
    if (!results.length) {
      container.innerHTML = '<p style="font-size:12px;color:var(--text-soft);">No results found.</p>';
      return;
    }

    const beltOptions = BELT_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('');

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
        <span style="font-size:12px;font-weight:700;">${results.length} result${results.length !== 1 ? 's' : ''}</span>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
          <input type="checkbox" id="ts-sel-all" onchange="App._tsSelectAll(this.checked)">
          Select all
        </label>
      </div>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th style="width:36px;">
                <input type="checkbox" id="ts-sel-all-hd" onchange="App._tsSelectAll(this.checked)">
              </th>
              <th>ZIP</th><th>City</th><th>State</th><th>SLIC</th><th>Current Routing</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => {
              const belts = Array.isArray(r.belts) ? r.belts : [r.belts];
              const label = belts.map(b => BELT_NAMES[b] || 'Belt ' + b).join(' / ');
              return `<tr>
                <td><input type="checkbox" class="ts-chk" value="${r.zip}"></td>
                <td><strong>${r.zip}</strong></td>
                <td>${r.city || '—'}</td>
                <td>${r.state || '—'}</td>
                <td>${r.slic || '—'}</td>
                <td style="font-size:12px;">${label}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="ts-apply-bar">
        <label class="lbl" style="margin:0;white-space:nowrap;">Route selected to:</label>
        <select class="inp" id="ts-new-belt" style="max-width:300px;">${beltOptions}</select>
        <button class="btn-danger" onclick="App.applyTruthEdit()">Apply to Selected</button>
      </div>
    `;
  }

  function _tsSelectAll(checked) {
    document.querySelectorAll('.ts-chk').forEach(cb => cb.checked = checked);
    const hd  = document.getElementById('ts-sel-all-hd');
    const top = document.getElementById('ts-sel-all');
    if (hd)  hd.checked  = checked;
    if (top) top.checked = checked;
  }

  async function applyTruthEdit() {
    const selected = [...document.querySelectorAll('.ts-chk:checked')].map(cb => cb.value);
    if (!selected.length) { toast('Select at least one ZIP first'); return; }
    const beltEl    = document.getElementById('ts-new-belt');
    if (!beltEl) return;
    const newBelt   = parseInt(beltEl.value);
    const beltLabel = BELT_NAMES[newBelt] || 'Belt ' + newBelt;
    if (!confirm(`Update ${selected.length} ZIP${selected.length > 1 ? 's' : ''} to route to "${beltLabel}"?`)) return;
    try {
      const updated = await Storage.bulkUpdateTruthBelts(selected, newBelt, _user);
      toast(`Updated ${updated.length} ZIP${updated.length > 1 ? 's' : ''} → ${beltLabel}`);
      // Refresh search results and edit log
      await searchTruth();
      await _loadTruthEdits();
    } catch (e) {
      toast('Update failed: ' + e.message);
      console.error('[App] applyTruthEdit error:', e);
    }
  }

  async function _loadTruthEdits() {
    const el = document.getElementById('ts-edits-list');
    if (!el) return;
    try {
      const edits = await Storage.getTruthEdits();
      if (!edits.length) {
        el.innerHTML = '<p style="font-size:12px;color:var(--text-soft);">No routing edits recorded yet.</p>';
        return;
      }
      el.innerHTML = `<table>
        <thead>
          <tr><th>ZIP</th><th>Old Routing</th><th>New Routing</th><th>By</th><th>Time</th></tr>
        </thead>
        <tbody>
          ${edits.slice().reverse().slice(0, 30).map(e => `
            <tr>
              <td><strong>${e.zip || '—'}</strong></td>
              <td style="font-size:11px;">${BELT_NAMES[e.oldBelt] || '—'}</td>
              <td style="font-size:11px;">${BELT_NAMES[e.newBelt] || '—'}</td>
              <td>${e.actor || '—'}</td>
              <td style="font-size:11px;color:var(--text-soft);">
                ${(e.timestamp || '').slice(0, 16).replace('T', ' ')}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    } catch (err) {
      el.innerHTML = '<p style="font-size:12px;color:var(--text-soft);">Could not load edits.</p>';
    }
  }

  /* ─────────────────────────────────────────
     SORTER ACTIONS — FLAGS
  ───────────────────────────────────────── */

  function openFlagModal(zip, beltIdx) {
    document.getElementById('flag-zip').textContent    = zip;
    document.getElementById('flag-belt').textContent   = BELT_NAMES[beltIdx] || beltIdx;
    document.getElementById('flag-reason').value       = '';
    document.getElementById('flag-suggested-belt').value = '';  // reset to "not sure"
    document.getElementById('flag-modal').classList.add('open');
    document.getElementById('flag-suggested-belt').focus();
  }

  function closeFlagModal() {
    document.getElementById('flag-modal').classList.remove('open');
  }

  async function submitFlag() {
    const reason = document.getElementById('flag-reason').value.trim();
    if (!reason) { toast('Please describe why the answer seems incorrect'); return; }

    // Pull zip + belt from the flag button (set by quiz.js after answering)
    const btn = document.getElementById('btn-flag');
    if (!btn || !btn.dataset.zip) { toast('No question active — flag from the quiz card'); return; }
    const flagZip  = btn.dataset.zip;
    const flagBelt = parseInt(btn.dataset.belt);

    // Optional: which belt does the sorter think it should be?
    const suggestedRaw = document.getElementById('flag-suggested-belt').value;
    const suggestedBelt = suggestedRaw !== '' ? parseInt(suggestedRaw) : null;

    try {
      await Storage.addFlag({
        zip:             flagZip,
        expected_belt:   flagBelt,
        suggested_belt:  suggestedBelt,
        flagged_by:      _user,
        reason,
      });
      await Storage.addAudit({ entity: 'flags', action: 'SUBMIT', actor: _user,
        after: { zip: flagZip, belt: flagBelt, suggested_belt: suggestedBelt, reason } });
      toast('Flag submitted — supervisors will review it');
      closeFlagModal();
    } catch (e) {
      toast('Could not submit flag: ' + e.message);
      console.error('[App] submitFlag error:', e);
    }
  }

  /* ─────────────────────────────────────────
     SUPERVISOR ACTIONS — FLAGS
  ───────────────────────────────────────── */

  // Pre-fill the overlay form and switch to overlays tab
  function flagCreateOverlay(flagId, zip, beltIdx) {
    // Switch to overlays tab and pre-fill
    svTab('overlays');
    document.getElementById('ov-zip').value   = zip;
    document.getElementById('ov-rsn').value   = 'Flag review: ZIP ' + zip;
    // Store flagId so addOverlay can reference it
    document.getElementById('ov-zip').dataset.flagId = flagId;
    toast('Fill in the override belt and reason, then click Add');
  }

  async function flagDismiss(flagId) {
    if (!confirm('Dismiss this flag?')) return;
    try {
      await Storage.updateFlag(flagId, {
        status:       'dismissed',
        dismissed_by: _user,
        dismissed_at: new Date().toISOString(),
      });
      await Storage.addAudit({ entity: 'flags', action: 'DISMISS', actor: _user,
        after: { flag_id: flagId } });
      toast('Flag dismissed');
      await Analytics.renderSvFlags();
    } catch (e) {
      toast('Could not dismiss flag: ' + e.message);
    }
  }

  /* ─────────────────────────────────────────
     ADMIN ACTIONS — FLAGS
  ───────────────────────────────────────── */

  async function flagEscalate(flagId) {
    if (!confirm('Mark this flag as requiring a truth table update?')) return;
    try {
      await Storage.updateFlag(flagId, {
        status:       'escalated',
        admin_action: 'truth_update',
        admin_actor:  _user,
        admin_at:     new Date().toISOString(),
      });
      await Storage.addAudit({ entity: 'flags', action: 'ESCALATE', actor: _user,
        after: { flag_id: flagId, action: 'truth_update' } });
      toast('Flagged for truth table update');
      await Analytics.renderAdFlags();
    } catch (e) {
      toast('Could not escalate flag: ' + e.message);
    }
  }

  async function flagAdminDismiss(flagId) {
    if (!confirm('Dismiss this flag as admin?')) return;
    try {
      await Storage.updateFlag(flagId, {
        status:       'dismissed',
        admin_action: 'dismissed',
        admin_actor:  _user,
        admin_at:     new Date().toISOString(),
      });
      await Storage.addAudit({ entity: 'flags', action: 'ADMIN_DISMISS', actor: _user,
        after: { flag_id: flagId } });
      toast('Flag dismissed');
      await Analytics.renderAdFlags();
    } catch (e) {
      toast('Could not dismiss flag: ' + e.message);
    }
  }

  /* ─────────────────────────────────────────
     SUPERVISOR ACTIONS — OVERLAYS
  ───────────────────────────────────────── */

  async function addOverlay() {
    const zipEl  = document.getElementById('ov-zip');
    const zip    = zipEl.value.trim();
    const belt   = parseInt(document.getElementById('ov-belt').value);
    const rsn    = document.getElementById('ov-rsn').value.trim();
    const flagId = zipEl.dataset.flagId || null;
    if (!/^\d{5}$/.test(zip)) { toast('Enter a valid 5-digit ZIP'); return; }
    if (!rsn) { toast('Enter a reason for this overlay'); return; }
    try {
      await Storage.addOverlay({ zip, override_belt: belt, reason: rsn, actor: _user });
      await Storage.addAudit({ entity: 'overlay_routing', action: 'ADD',
        after: { zip, override_belt: belt, reason: rsn, from_flag: flagId }, actor: _user });

      // If this overlay came from a flag, mark the flag as approved
      if (flagId) {
        await Storage.updateFlag(flagId, {
          status:      'approved',
          approved_by: _user,
          approved_at: new Date().toISOString(),
        }).catch(e => console.error('[App] flag update failed:', e));
      }

      toast('Overlay added for ZIP ' + zip);
      zipEl.value = '';
      zipEl.dataset.flagId = '';
      document.getElementById('ov-rsn').value = '';
      Analytics.renderOverlays().catch(() => {});
      if (flagId) Analytics.renderSvFlags().catch(() => {});
    } catch (e) { toast('Could not add overlay: ' + e.message); }
  }

  /* ─────────────────────────────────────────
     STORAGE CONNECTION
  ───────────────────────────────────────── */

  // Smart badge click — reconnects if a saved folder is pending,
  // opens the picker if no folder has ever been connected.
  async function handleStorageBadgeClick() {
    if (Storage.getPendingFolderName()) {
      await reconnectSharedFolder();
    } else if (!Storage.isShared()) {
      await connectSharedFolder();
    }
    // Already connected: no-op (use Admin > Data to disconnect)
  }

  async function connectSharedFolder() {
    _setBadgeConnecting();
    const result = await Storage.connectSharedFolder();
    if (result.ok) {
      toast('Connected to: ' + Storage.getFolderName());
    } else if (result.error) {
      toast('Could not connect: ' + result.error);
    }
    _updateStorageBadge();
    if (result.ok) _refreshCurrentView();
  }

  // Re-authorise a previously-used folder without the full picker.
  // Must come from a user gesture so requestPermission is allowed.
  async function reconnectSharedFolder() {
    const name = Storage.getPendingFolderName();
    _setBadgeConnecting();
    const result = await Storage.reconnectSharedFolder();
    if (result.ok) {
      toast('Reconnected to: ' + Storage.getFolderName());
    } else if (result.error) {
      toast('Could not reconnect to "' + name + '": ' + result.error);
    }
    _updateStorageBadge();
    if (result.ok) _refreshCurrentView();
  }

  async function disconnectSharedFolder() {
    await Storage.disconnectSharedFolder();
    toast('Disconnected — using local storage');
    _updateStorageBadge();
  }

  // Re-render analytics for whichever dashboard is open
  function _refreshCurrentView() {
    if (_role === 'supervisor') Analytics.renderOverview().catch(() => {});
    if (_role === 'admin')      Analytics.renderSystemHealth().catch(() => {});
  }

  function _setBadgeConnecting() {
    const badge = document.getElementById('storage-badge');
    if (!badge) return;
    badge.className = 'storage-badge pending';
    badge.querySelector('.storage-label').textContent = 'Connecting...';
  }

  function _updateStorageBadge() {
    const badge = document.getElementById('storage-badge');
    if (!badge) return;
    const lbl = badge.querySelector('.storage-label');

    if (Storage.isShared()) {
      badge.className = 'storage-badge connected';
      lbl.textContent = Storage.getFolderName();
      badge.title = 'Shared folder connected — use Admin > Data to disconnect';
    } else if (Storage.getPendingFolderName()) {
      badge.className = 'storage-badge pending';
      lbl.textContent = 'Reconnect: ' + Storage.getPendingFolderName();
      badge.title = 'Click to reconnect to "' + Storage.getPendingFolderName() + '"';
    } else {
      badge.className = 'storage-badge';
      lbl.textContent = 'Local only';
      badge.title = 'Click to connect shared data folder';
    }
  }

  /* ─────────────────────────────────────────
     EXPORTS
  ───────────────────────────────────────── */

  function _download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function exportEventsCSV() {
    try {
      const csv = await Storage.exportEventsCSV();
      if (!csv) { toast('No sort events to export'); return; }
      _download('sort_events_' + new Date().toISOString().slice(0,10) + '.csv', csv, 'text/csv;charset=utf-8');
      toast('Sort events exported');
    } catch (e) { toast('Export failed: ' + e.message); }
  }

  async function exportOverlaysCSV() {
    try {
      const csv = await Storage.exportOverlaysCSV();
      if (!csv) { toast('No overlays to export'); return; }
      _download('overlays_' + new Date().toISOString().slice(0,10) + '.csv', csv, 'text/csv;charset=utf-8');
      toast('Overlays exported');
    } catch (e) { toast('Export failed: ' + e.message); }
  }

  function showResults() {
    document.getElementById('sorter-results').style.display = 'block';
    document.getElementById('sorter-quiz').style.display   = 'none';
    const lad = document.getElementById('sorter-ladder');
    if (lad) lad.style.display = 'none';
  }

  function showQuiz() {
    document.getElementById('sorter-results').style.display = 'none';
    document.getElementById('sorter-quiz').style.display    = 'block';
    const lad = document.getElementById('sorter-ladder');
    if (lad) lad.style.display = 'none';
  }

  // Sorter-facing leaderboard (from the results card)
  async function showLadder() {
    document.getElementById('sorter-results').style.display = 'none';
    document.getElementById('sorter-quiz').style.display    = 'none';
    const lad = document.getElementById('sorter-ladder');
    if (lad) {
      lad.style.display = 'block';
      try { await Adaptive.renderLeaderboard('sorter-ladder-body'); }
      catch (e) { toast('Could not load the ladder: ' + e.message); }
    }
  }

  function hideLadder() {
    showResults();
  }

  return {
    init,
    currentUser, currentRole,
    setRole, selectRole, backToLanding, login, logout,
    svTab, adTab,
    addSupervisor, removeSupervisor,
    addSorterToRoster, removeSorterFromRoster,
    loadTruth, clearEvents,
    addOverlay,
    toggleQuizState, qcfgPreset, saveQuizConfig, resetQuizConfig,
    toggleQuizBelt, qbeltPreset,
    viewAnalyticsAsAdmin, backFromAnalyticsToAdmin,
    openFlagModal, closeFlagModal, submitFlag,
    flagCreateOverlay, flagDismiss,
    flagEscalate, flagAdminDismiss,
    changeSupervisorPassword, changeAdminPassword,
    _truthMode, searchTruth, _tsSelectAll, applyTruthEdit,
    handleStorageBadgeClick, connectSharedFolder, reconnectSharedFolder, disconnectSharedFolder,
    exportEventsCSV, exportOverlaysCSV,
    showResults, showQuiz, showLadder, hideLadder,
    saveNamedQuizPreset, deleteNamedQuizPreset,
    _stbToggleBelt, _stbSelectAllBelts, _stbClearBelts, _stbApplyPreset,
  };

})();

/* ── Toast (global) ── */
let _toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('on'), 3500);
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(e => console.error('[App] init error:', e));
  _watchInitDot();
});

function _watchInitDot() {
  const el = document.getElementById('landing-init');
  if (!el) return;
  const check = () => {
    if (Quiz.getTruthCount() > 0) {
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 450);
    } else {
      setTimeout(check, 600);
    }
  };
  check();
}
