/* ══════════════════════════════════════════════
   storage.js — Unified Storage Adapter

   Two modes:
     shared  — reads/writes JSON/JSONL files on a
               shared drive via File System Access
               API (Chrome / Arc / Edge 86+)
     local   — IndexedDB (single machine, always
               available as fallback)

   Permission lifecycle (Chrome/Arc):
     - connectSharedFolder()   → showDirectoryPicker → granted
     - On reload: queryPermission → usually 'prompt' (not auto-granted)
     - _restoreHandle stores handle as _pendingHandle
     - reconnectSharedFolder() → requestPermission (needs user gesture)
     - Storage badge calls reconnect instead of full picker
══════════════════════════════════════════════ */

const Storage = (() => {

  /* ── Internal state ── */
  let _mode          = 'local';
  let _dirHandle     = null;
  let _pendingHandle = null;   // saved handle awaiting requestPermission
  let _folderName    = null;
  let _db            = null;

  const IDB_NAME = 'SortTrainingDB';
  const IDB_VER  = 8;   // v8 adds sorter_roster store

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  async function init() {
    await _openIDB();           // always open IDB first — it's always needed
    await _restoreHandle();     // try to reconnect shared folder from last session
  }

  /* ─────────────────────────────────────────
     PUBLIC API — MODE
  ───────────────────────────────────────── */

  function getMode()            { return _mode; }
  function getFolderName()      { return _folderName; }
  function isShared()           { return _mode === 'shared'; }
  function getPendingFolderName() {
    return _pendingHandle ? _pendingHandle.name : null;
  }

  async function connectSharedFolder() {
    if (!window.showDirectoryPicker) {
      return { ok: false, error: 'File System Access API not available. Use Chrome or Arc (not file:// — open via a web server or use the Local only mode).' };
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      // Activate immediately — no verify step needed for user-initiated picks.
      // Save handle async (fire-and-forget) so the UI responds instantly.
      _saveHandle(handle).catch(e => _log('Could not persist handle:', e));
      _dirHandle     = handle;
      _folderName    = handle.name;
      _pendingHandle = null;
      _mode          = 'shared';
      _log('Connected to shared folder:', handle.name);
      return { ok: true };
    } catch (e) {
      if (e.name === 'AbortError') return { ok: false, error: null }; // user cancelled
      _log('connectSharedFolder error:', e);
      return { ok: false, error: e.message };
    }
  }

  // Reconnect a previously-saved handle without showing the folder picker.
  // Must be called from a user gesture (click).
  async function reconnectSharedFolder() {
    if (!_pendingHandle) return { ok: false, error: 'No saved folder to reconnect to.' };
    try {
      const perm = await _pendingHandle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return { ok: false, error: 'Permission was not granted.' };
      // Activate immediately; persist async.
      _saveHandle(_pendingHandle).catch(e => _log('Could not persist handle:', e));
      _dirHandle     = _pendingHandle;
      _folderName    = _pendingHandle.name;
      _pendingHandle = null;
      _mode          = 'shared';
      _log('Reconnected to shared folder:', _folderName);
      return { ok: true };
    } catch (e) {
      _log('reconnectSharedFolder error:', e);
      return { ok: false, error: e.message };
    }
  }

  async function disconnectSharedFolder() {
    await _clearHandle();
    _dirHandle     = null;
    _pendingHandle = null;
    _folderName    = null;
    _mode          = 'local';
    _log('Disconnected from shared folder');
  }

  /* ─────────────────────────────────────────
     PUBLIC API — SORT EVENTS
  ───────────────────────────────────────── */

  async function getEvents() {
    if (_mode === 'shared') {
      const result = await _safeFileRead('sort_events.jsonl', 'jsonl');
      if (result.ok) return result.data;
      _log('Shared read failed, falling back to IDB:', result.error);
    }
    return _idbGetAll('sort_events');
  }

  async function addEvent(event) {
    const entry = { ...event, timestamp: new Date().toISOString() };
    if (_mode === 'shared') {
      const result = await _safeFileAppendJSONL('sort_events.jsonl', entry);
      if (result.ok) return;
      _log('Shared write failed, falling back to IDB:', result.error);
    }
    return _idbAdd('sort_events', entry);
  }

  async function clearEvents() {
    if (_mode === 'shared') {
      await _safeFileWrite('sort_events.jsonl', '');
    }
    return _idbClear('sort_events');
  }

  /* ─────────────────────────────────────────
     PUBLIC API — OVERLAYS
  ───────────────────────────────────────── */

  async function getOverlays() {
    if (_mode === 'shared') {
      const result = await _safeFileRead('overlays.json', 'json');
      if (result.ok) return result.data || [];
      _log('Shared overlay read failed:', result.error);
    }
    return _idbGetAll('overlay_routing');
  }

  async function addOverlay(overlay) {
    const entry = { ...overlay, timestamp: new Date().toISOString() };
    if (_mode === 'shared') {
      const existing = (await getOverlays()) || [];
      existing.push(entry);
      const result = await _safeFileWrite('overlays.json', JSON.stringify(existing, null, 2));
      if (result.ok) return;
      _log('Shared overlay write failed:', result.error);
    }
    return _idbAdd('overlay_routing', entry);
  }

  /* ─────────────────────────────────────────
     PUBLIC API — SUPERVISOR ROLES
  ───────────────────────────────────────── */

  async function getSupervisors() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('supervisor_roles.json', 'json');
      if (r.ok) return r.data || [];
      _log('Shared supervisor read failed, falling back to IDB:', r.error);
    }
    return _idbGetAll('supervisor_roles');
  }

  async function isSupervisor(employeeId) {
    const list = await getSupervisors();
    return list.some(s => s.employee_id === String(employeeId));
  }

  async function addSupervisor(entry) {
    const record = {
      ...entry,
      employee_id: String(entry.employee_id),
      added_at: new Date().toISOString(),
    };
    if (_mode === 'shared') {
      const existing = await getSupervisors();
      if (existing.some(s => s.employee_id === record.employee_id)) return; // duplicate
      existing.push(record);
      const r = await _safeFileWrite('supervisor_roles.json', JSON.stringify(existing, null, 2));
      if (r.ok) return;
      _log('Shared supervisor write failed, falling back to IDB:', r.error);
    }
    return _idbPut('supervisor_roles', record);
  }

  async function removeSupervisor(employeeId) {
    const id = String(employeeId);
    if (_mode === 'shared') {
      const existing = await getSupervisors();
      const updated  = existing.filter(s => s.employee_id !== id);
      const r = await _safeFileWrite('supervisor_roles.json', JSON.stringify(updated, null, 2));
      if (r.ok) return;
      _log('Shared supervisor remove failed, falling back to IDB:', r.error);
    }
    return _idbDelete('supervisor_roles', id);
  }

  /* ─────────────────────────────────────────
     PUBLIC API — FLAGS
     Status lifecycle:
       pending → approved (supervisor creates overlay)
               → dismissed (supervisor or admin)
               → escalated (admin marks for truth table update)
  ───────────────────────────────────────── */

  function _flagId() {
    return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  async function getFlags() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('flags.jsonl', 'jsonl');
      if (r.ok) return r.data;
      _log('Shared flags read failed, falling back to IDB:', r.error);
    }
    return _idbGetAll('flags');
  }

  async function addFlag(flag) {
    // flag: { zip, expected_belt, flagged_by, reason }
    const record = {
      ...flag,
      id:         _flagId(),
      status:     'pending',
      timestamp:  new Date().toISOString(),
      approved_by:  null,
      approved_at:  null,
      dismissed_by: null,
      dismissed_at: null,
      overlay_id:   null,
      admin_action: null,   // 'truth_update' | 'dismissed'
      admin_actor:  null,
      admin_at:     null,
    };
    if (_mode === 'shared') {
      const r = await _safeFileAppendJSONL('flags.jsonl', record);
      if (r.ok) return record;
      _log('Shared flag write failed, falling back to IDB:', r.error);
    }
    await _idbPut('flags', record);
    return record;
  }

  async function updateFlag(id, changes) {
    // Load all flags, find by id, merge changes, write back
    const all = await getFlags();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Flag not found: ' + id);
    const updated = { ...all[idx], ...changes };
    if (_mode === 'shared') {
      all[idx] = updated;
      // Rewrite the full file (flags.jsonl) — acceptable since flag count stays small
      const text = all.map(f => JSON.stringify(f)).join('\n') + '\n';
      const r = await _safeFileWrite('flags.jsonl', text);
      if (r.ok) return updated;
      _log('Shared flag update failed, falling back to IDB:', r.error);
    }
    await _idbPut('flags', updated);
    return updated;
  }

  /* ─────────────────────────────────────────
     PUBLIC API — QUIZ CONFIG
     Stored in IDB key-value and optionally shared as quiz_config.json
  ───────────────────────────────────────── */

  async function getQuizConfig() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('quiz_config.json', 'json');
      if (r.ok && r.data && !Array.isArray(r.data)) return r.data;
    }
    // IDB: stored in a single 'config' object store (reuse handles store pattern)
    try {
      const db = await _openIDB();
      return new Promise((res) => {
        try {
          const req = db.transaction('handles', 'readonly').objectStore('handles').get('quiz_config');
          req.onsuccess = () => res(req.result || null);
          req.onerror   = () => res(null);
        } catch { res(null); }
      });
    } catch { return null; }
  }

  async function saveQuizConfig(cfg) {
    if (_mode === 'shared') {
      await _safeFileWrite('quiz_config.json', JSON.stringify(cfg, null, 2));
    }
    // Also persist locally
    try {
      const db = await _openIDB();
      await new Promise((res, rej) => {
        const tx  = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(cfg, 'quiz_config');
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });
    } catch (e) { _log('Could not save quiz config to IDB:', e); }
    return cfg;
  }

  /* ─────────────────────────────────────────
     PUBLIC API — ADAPTIVE STATE
     Elo ratings, bucket difficulties, re-test queues.
     Shared as adaptive_state.json + IDB fallback (same pattern as quiz_config).
  ───────────────────────────────────────── */

  async function getAdaptiveState() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('adaptive_state.json', 'json');
      if (r.ok && r.data && !Array.isArray(r.data)) return r.data;
    }
    try {
      const db = await _openIDB();
      return new Promise((res) => {
        try {
          const req = db.transaction('handles', 'readonly').objectStore('handles').get('adaptive_state');
          req.onsuccess = () => res(req.result || null);
          req.onerror   = () => res(null);
        } catch { res(null); }
      });
    } catch { return null; }
  }

  async function saveAdaptiveState(state) {
    if (_mode === 'shared') {
      await _safeFileWrite('adaptive_state.json', JSON.stringify(state, null, 2));
    }
    try {
      const db = await _openIDB();
      await new Promise((res, rej) => {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(state, 'adaptive_state');
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });
    } catch (e) { _log('Could not save adaptive state to IDB:', e); }
    return state;
  }

  /* ─────────────────────────────────────────
     PUBLIC API — AUDIT
  ───────────────────────────────────────── */

  async function addAudit(entry) {
    const record = { ...entry, timestamp: new Date().toISOString() };
    if (_mode === 'shared') {
      await _safeFileAppendJSONL('audit_log.jsonl', record);
    }
    return _idbAdd('audit_log', record);
  }

  /* ─────────────────────────────────────────
     PUBLIC API — TRUTH TABLE (local IDB only)
  ───────────────────────────────────────── */

  async function countTruth() {
    return _idbCount('truth_zip_routing');
  }

  async function loadTruth(entries, onProgress) {
    const BATCH = 5000;   // larger batches = fewer transactions = faster
    await _idbClear('truth_zip_routing');
    const db = await _openIDB();
    let loaded = 0;

    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      await new Promise((res, rej) => {
        const tx = db.transaction('truth_zip_routing', 'readwrite');
        const os = tx.objectStore('truth_zip_routing');
        for (const e of batch) {
          os.put({ zip: e.zip, slic: e.slic, bay: e.bay, belts: e.belts,
                   state: e.state || '', city: e.city || '' });
        }
        tx.oncomplete = res;
        tx.onerror    = () => rej(new Error('IDB batch write failed: ' + (tx.error || '')));
      });
      loaded += batch.length;
      if (onProgress) onProgress(loaded, entries.length);
      // yield to UI between batches
      await new Promise(r => setTimeout(r, 0));
    }

    await addAudit({ entity: 'truth_zip_routing', action: 'BULK_LOAD', reason: 'Load truth table' });
    return loaded;
  }

  /* ─────────────────────────────────────────
     PUBLIC API — EXPORT
  ───────────────────────────────────────── */

  async function exportEventsCSV() {
    const events = await getEvents();
    if (!events || !events.length) return null;
    const header = 'sorter_id,zip,expected_belt,expected_name,actual_belt,actual_name,correct,multi_valid,qtype,svc,exc_id,retest,rated,timestamp';
    const rows = events.map(e => [
      e.sorter_id || '',
      e.zip || '',
      e.expected_belt,
      '"' + (BELT_NAMES[e.expected_belt] || '') + '"',
      e.actual_belt,
      '"' + (BELT_NAMES[e.actual_belt]   || '') + '"',
      e.correct ? 'TRUE' : 'FALSE',
      (e.multi_valid || false) ? 'TRUE' : 'FALSE',
      e.qtype || '',
      e.svc || '',
      e.exc_id || '',
      (e.retest || false) ? 'TRUE' : 'FALSE',
      e.rated === undefined ? '' : (e.rated ? 'TRUE' : 'FALSE'),
      e.timestamp || '',
    ].join(','));
    return [header, ...rows].join('\n');
  }

  async function exportOverlaysCSV() {
    const overlays = await getOverlays();
    if (!overlays || !overlays.length) return null;
    const header = 'zip,override_belt,belt_name,reason,actor,timestamp';
    const rows = overlays.map(o => [
      o.zip || '',
      o.override_belt,
      '"' + (BELT_NAMES[o.override_belt] || '') + '"',
      '"' + ((o.reason || '').replace(/"/g, '""')) + '"',
      o.actor || '',
      o.timestamp || '',
    ].join(','));
    return [header, ...rows].join('\n');
  }

  /* ─────────────────────────────────────────
     SHARED-DRIVE FILE HELPERS
  ───────────────────────────────────────── */

  async function _safeFileRead(filename, format) {
    try {
      const fh   = await _dirHandle.getFileHandle(filename, { create: true });
      const file = await fh.getFile();
      const text = await file.text();
      if (format === 'jsonl') {
        const data = text.trim().split('\n')
          .filter(l => l.trim())
          .map(l => { try { return JSON.parse(l); } catch { return null; } })
          .filter(Boolean);
        return { ok: true, data };
      } else {
        // JSON file — default to [] if empty
        const data = text.trim() ? JSON.parse(text) : [];
        return { ok: true, data };
      }
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function _safeFileWrite(filename, text) {
    try {
      const fh = await _dirHandle.getFileHandle(filename, { create: true });
      const w  = await fh.createWritable();
      await w.write(text);
      await w.close();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function _safeFileAppendJSONL(filename, obj) {
    try {
      const fh   = await _dirHandle.getFileHandle(filename, { create: true });
      const file = await fh.getFile();
      const prev = await file.text();
      const w    = await fh.createWritable();
      await w.write(prev + JSON.stringify(obj) + '\n');
      await w.close();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /* ─────────────────────────────────────────
     HANDLE PERSISTENCE
  ───────────────────────────────────────── */

  async function _saveHandle(handle) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(handle, 'sharedDir');
      tx.oncomplete = res;
      tx.onerror    = () => rej(new Error('Could not save folder handle'));
    });
  }

  async function _clearHandle() {
    try {
      const db = await _openIDB();
      await new Promise((res, rej) => {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').delete('sharedDir');
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });
    } catch { /* ignore */ }
  }

  async function _restoreHandle() {
    try {
      const db = await _openIDB();
      const handle = await new Promise((res, rej) => {
        const req = db.transaction('handles', 'readonly')
                      .objectStore('handles').get('sharedDir');
        req.onsuccess = () => res(req.result);
        req.onerror   = () => rej(req.error);
      });
      if (!handle) return;

      // If permission is already granted (same browser session, tab still active)
      // reconnect silently without any UI prompt.
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        _dirHandle  = handle;
        _folderName = handle.name;
        _mode       = 'shared';
        _log('Restored shared folder:', handle.name);
        return;
      }

      // Permission is 'prompt' — can only re-request with a user gesture.
      // Store as pending so the badge offers one-click reconnect.
      _pendingHandle = handle;
      _log('Saved handle needs re-permission; stored as pending:', handle.name);
    } catch (e) {
      _log('Could not restore handle:', e.message);
      // Stay local — do NOT rethrow
    }
  }

  /* ─────────────────────────────────────────
     INDEXEDDB
  ───────────────────────────────────────── */

  async function _openIDB() {
    if (_db) return _db;
    return new Promise((res, rej) => {
      const req = indexedDB.open(IDB_NAME, IDB_VER);

      req.onupgradeneeded = e => {
        const db = e.target.result;
        const defs = [
          ['truth_zip_routing', { keyPath: 'zip' }],
          ['overlay_routing',   { autoIncrement: true }],
          ['sort_events',       { autoIncrement: true }],
          ['audit_log',         { autoIncrement: true }],
          ['supervisor_roles',  { keyPath: 'employee_id' }],
          ['flags',             { keyPath: 'id' }],
          ['handles',           { }],
          ['sorter_roster',     { keyPath: 'employee_id' }],  // v8
        ];
        for (const [name, opts] of defs) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, opts);
          }
        }
      };

      req.onsuccess = () => {
        _db = req.result;
        _db.onerror = e => _log('IDB error:', e.target.error);
        res(_db);
      };

      req.onerror   = () => rej(new Error('Could not open IndexedDB: ' + req.error));
      req.onblocked = () => {
        _log('IDB upgrade blocked — close other tabs using this app');
        // Make this visible — user must close all other tabs then reload
        if (typeof _showIdbBlockedBanner === 'function') _showIdbBlockedBanner();
      };
    });
  }

  async function _idbAdd(store, record) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const tx  = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).add(record);
        req.onerror   = () => rej(new Error(`IDB add failed (${store}): ` + req.error));
        tx.oncomplete = res;
        tx.onerror    = () => rej(new Error(`IDB transaction failed (${store}): ` + tx.error));
      } catch (e) { rej(e); }
    });
  }

  async function _idbPut(store, record) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const tx  = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).put(record);
        req.onerror   = () => rej(new Error(`IDB put failed (${store}): ` + req.error));
        tx.oncomplete = res;
        tx.onerror    = () => rej(new Error(`IDB transaction failed (${store}): ` + tx.error));
      } catch (e) { rej(e); }
    });
  }

  async function _idbDelete(store, key) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(key);
        tx.oncomplete = res;
        tx.onerror    = () => rej(new Error(`IDB delete failed (${store}): ` + tx.error));
      } catch (e) { rej(e); }
    });
  }

  async function _idbGetAll(store) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const tx  = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror   = () => rej(new Error(`IDB getAll failed (${store}): ` + req.error));
      } catch (e) { rej(e); }
    });
  }

  async function _idbCount(store) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const req = db.transaction(store, 'readonly').objectStore(store).count();
        req.onsuccess = () => res(req.result);
        req.onerror   = () => rej(new Error('IDB count failed: ' + req.error));
      } catch (e) { rej(e); }
    });
  }

  async function _idbClear(store) {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      try {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = res;
        tx.onerror    = () => rej(new Error('IDB clear failed: ' + tx.error));
      } catch (e) { rej(e); }
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — SORTER ROSTER
  ───────────────────────────────────────── */

  async function getSorterRoster() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('sorter_roster.json', 'json');
      if (r.ok) return r.data || [];
      _log('Shared sorter roster read failed, falling back to IDB:', r.error);
    }
    return _idbGetAll('sorter_roster');
  }

  async function isSorterAllowed(employeeId) {
    const roster = await getSorterRoster();
    return roster.some(s => s.employee_id === String(employeeId));
  }

  async function addSorterToRoster(entry) {
    const record = {
      ...entry,
      employee_id: String(entry.employee_id),
      added_at: new Date().toISOString(),
    };
    if (_mode === 'shared') {
      const existing = await getSorterRoster();
      if (existing.some(s => s.employee_id === record.employee_id)) return;
      existing.push(record);
      const r = await _safeFileWrite('sorter_roster.json', JSON.stringify(existing, null, 2));
      if (r.ok) return;
      _log('Shared sorter roster write failed, falling back to IDB:', r.error);
    }
    return _idbPut('sorter_roster', record);
  }

  async function removeSorterFromRoster(employeeId) {
    const id = String(employeeId);
    if (_mode === 'shared') {
      const existing = await getSorterRoster();
      const updated  = existing.filter(s => s.employee_id !== id);
      const r = await _safeFileWrite('sorter_roster.json', JSON.stringify(updated, null, 2));
      if (r.ok) return;
      _log('Shared sorter roster remove failed, falling back to IDB:', r.error);
    }
    return _idbDelete('sorter_roster', id);
  }

  /* ─────────────────────────────────────────
     PUBLIC API — SYSTEM CONFIG (passwords, etc.)
     Stored in IDB handles store + shared system_config.json
  ───────────────────────────────────────── */

  async function getSystemConfig() {
    if (_mode === 'shared') {
      const r = await _safeFileRead('system_config.json', 'json');
      if (r.ok && r.data && !Array.isArray(r.data)) return r.data;
    }
    try {
      const db = await _openIDB();
      return new Promise(res => {
        try {
          const req = db.transaction('handles', 'readonly').objectStore('handles').get('system_config');
          req.onsuccess = () => res(req.result || {});
          req.onerror   = () => res({});
        } catch { res({}); }
      });
    } catch { return {}; }
  }

  async function saveSystemConfig(cfg) {
    if (_mode === 'shared') {
      await _safeFileWrite('system_config.json', JSON.stringify(cfg, null, 2));
    }
    try {
      const db = await _openIDB();
      await new Promise((res, rej) => {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(cfg, 'system_config');
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });
    } catch (e) { _log('Could not save system config to IDB:', e); }
    return cfg;
  }

  /* ─────────────────────────────────────────
     PUBLIC API — TRUTH TABLE SEARCH + EDIT
  ───────────────────────────────────────── */

  // query: { zip?, zipFrom?, zipTo?, city?, slic? }
  async function searchTruth(query) {
    const db = await _openIDB();

    // Single ZIP lookup
    if (query.zip) {
      return new Promise((res, rej) => {
        const req = db.transaction('truth_zip_routing', 'readonly')
          .objectStore('truth_zip_routing').get(query.zip);
        req.onsuccess = () => res(req.result ? [req.result] : []);
        req.onerror   = () => rej(req.error);
      });
    }

    // ZIP range (IDBKeyRange — fast, uses primary key index)
    if (query.zipFrom && query.zipTo) {
      return new Promise((res, rej) => {
        const range = IDBKeyRange.bound(query.zipFrom, query.zipTo);
        const req   = db.transaction('truth_zip_routing', 'readonly')
          .objectStore('truth_zip_routing').getAll(range);
        req.onsuccess = () => res(req.result || []);
        req.onerror   = () => rej(req.error);
      });
    }

    // City and/or SLIC: full scan filtered in JS (~40k records, ~50ms)
    if (query.city || query.slic) {
      const all   = await _idbGetAll('truth_zip_routing');
      const cityQ = query.city ? query.city.toUpperCase() : null;
      const slicQ = query.slic ? query.slic.padStart(4, '0') : null;
      return all.filter(r => {
        const cityOk = !cityQ || (r.city || '').toUpperCase().includes(cityQ);
        const slicOk = !slicQ || r.slic === slicQ;
        return cityOk && slicOk;
      });
    }

    return [];
  }

  // Update one ZIP to a new single belt and log the edit
  async function updateTruthBelt(zip, newBelt, actor) {
    const db = await _openIDB();
    const current = await new Promise((res, rej) => {
      const req = db.transaction('truth_zip_routing', 'readonly')
        .objectStore('truth_zip_routing').get(zip);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
    if (!current) throw new Error('ZIP not found: ' + zip);

    const oldBelt = Array.isArray(current.belts) ? current.belts[0] : current.belts;
    const updated = { ...current, belts: [newBelt] };
    await _idbPut('truth_zip_routing', updated);

    const edit = {
      zip, oldBelt, newBelt,
      actor:     actor || 'admin',
      timestamp: new Date().toISOString(),
    };
    // Persist edit log
    if (_mode === 'shared') {
      await _safeFileAppendJSONL('truth_edits.jsonl', edit);
    }
    await _idbAdd('audit_log', {
      entity: 'truth_zip_routing', action: 'BELT_UPDATE', ...edit,
    });
    return edit;
  }

  // Bulk update — returns array of completed edit records
  async function bulkUpdateTruthBelts(zips, newBelt, actor) {
    const results = [];
    for (const zip of zips) {
      try {
        const r = await updateTruthBelt(zip, newBelt, actor);
        results.push(r);
      } catch (e) { _log('Failed to update ZIP', zip, ':', e.message); }
    }
    return results;
  }

  // Return all BELT_UPDATE audit entries (most recent first)
  async function getTruthEdits() {
    const all = await _idbGetAll('audit_log');
    return all.filter(a => a.action === 'BELT_UPDATE');
  }

  /* ── Internal logging ── */
  function _log(...args) { console.log('[Storage]', ...args); }

  /* ── Public surface ── */
  return {
    init,
    getMode, getFolderName, isShared, getPendingFolderName,
    connectSharedFolder, reconnectSharedFolder, disconnectSharedFolder,
    getEvents, addEvent, clearEvents,
    getOverlays, addOverlay,
    getSupervisors, isSupervisor, addSupervisor, removeSupervisor,
    getSorterRoster, isSorterAllowed, addSorterToRoster, removeSorterFromRoster,
    getSystemConfig, saveSystemConfig,
    getFlags, addFlag, updateFlag,
    getQuizConfig, saveQuizConfig,
    getAdaptiveState, saveAdaptiveState,
    addAudit,
    countTruth, loadTruth,
    searchTruth, updateTruthBelt, bulkUpdateTruthBelts, getTruthEdits,
    exportEventsCSV, exportOverlaysCSV,
  };

})();
