const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Mock DOM elements
class MockEl {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this._t = '';
    this.value = '';
    this.className = '';
    this.attributes = {};
    this.open = false;
    this.hidden = tag === 'dialog' ? false : (tag === 'div' && this.className === 'nav-user-dropdown' ? true : false);
    this.style = {};
    this.dataset = {};
  }
  get textContent() {
    return this._t || this.children.map(c => typeof c === 'string' ? c : c.textContent).join(' ');
  }
  set textContent(v) {
    this._t = String(v);
  }
  append(...nodes) {
    this.children.push(...nodes);
    if (this.tag === 'select' && !this.value && nodes[0]) this.value = nodes[0].value;
  }
  replaceChildren(...nodes) {
    this.children = [...nodes];
    this._t = '';
  }
  setAttribute(k, v) {
    this.attributes[k] = v;
    this[k] = v;
  }
  getAttribute(k) {
    return this.attributes[k] ?? this[k];
  }
  addEventListener(name, fn) {
    this.events[name] = fn;
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  focus() {
    this.focused = true;
  }
  contains(target) {
    if (this === target) return true;
    for (const c of this.children) {
      if (c instanceof MockEl && c.contains(target)) return true;
    }
    return false;
  }
  set innerHTML(v) {
    throw Error('Unsafe innerHTML sink detected');
  }
}

function findEl(el, pred) {
  if (pred(el)) return el;
  for (const c of el.children) {
    if (c instanceof MockEl) {
      const f = findEl(c, pred);
      if (f) return f;
    }
  }
  return null;
}

function findAll(el, pred) {
  const res = [];
  if (pred(el)) res.push(el);
  for (const c of el.children) {
    if (c instanceof MockEl) {
      res.push(...findAll(c, pred));
    }
  }
  return res;
}

(async () => {
  console.log('--- TEST 1: Session dropdown toggle, click-outside, Escape, and reload ---');
  let lastPayload = null;
  const nav = new MockEl('nav');
  nav.className = 'sim-nav';
  const body = new MockEl('body');
  body.dataset = { simId: '06' };
  const docListeners = {};

  const doc = {
    body,
    querySelector: sel => sel === '.sim-nav' ? nav : null,
    querySelectorAll: () => [],
    createElement: tag => new MockEl(tag),
    addEventListener: (k, fn) => { docListeners[k] = fn; },
    currentScript: { src: 'http://localhost/prefix/js/sim-groups.js' }
  };

  const fetchMock = async (url, opts = {}) => {
    if (url.toString().includes('action=session')) {
      return { ok: true, json: async () => ({ csrf: 'csrf_tok', user: { id: 2, name: 'PC 02' } }) };
    }
    if (url.toString().includes('action=groups')) {
      return { ok: true, json: async () => ({ groups: [{ id: 42, nombre: 'Equipo Newton' }] }) };
    }
    if (url.toString().includes('action=save')) {
      lastPayload = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ id: 999 }) };
    }
    return { ok: true, json: async () => ({}) };
  };

  let currentState = {
    parameters: { v0: 999, alpha: 45 },
    results: { xMax: 9999 }
  };

  const mockLocation = { href: 'http://localhost/simuladores/06_proyectiles/' };
  const ctx = vm.createContext({
    console,
    document: doc,
    window: { location: mockLocation },
    location: mockLocation,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    fetch: fetchMock,
    setTimeout: (fn, ms) => fn(),
    clearTimeout: () => {},
    Engine: {
      getState: () => ({ v0: 999, alpha: 45, y0: 0, t: 0, x: 0, y: 0, vx: 0, vy: 0, tMax: 0, xMax: 9999, yMax: 0 })
    }
  });

  // Run sim-groups.js — append ';SimGroups' to get the IIFE return value
  // (const declarations in VM contexts are local, not global)
  ctx.SimGroups = vm.runInContext(
    fs.readFileSync('js/sim-groups.js', 'utf8') + '\n;SimGroups',
    ctx
  );

  // Bind SimGroups with current simulator state provider
  ctx.SimGroups.bind(() => currentState, '06');

  // Trigger DOMContentLoaded for initial session check
  if (docListeners['DOMContentLoaded']) {
    await docListeners['DOMContentLoaded']();
  }

  const userPill = findEl(nav, e => e.className && e.className.includes('nav-user-pill'));
  const userMenu = findEl(nav, e => e.className && e.className.includes('nav-user-dropdown'));
  assert.ok(userPill, 'userPill exists');
  assert.ok(userMenu, 'userMenu exists');

  // Verify reload / initial state: closed
  assert.equal(userMenu.hidden, true, 'Dropdown starts hidden on page load');
  assert.equal(userPill.getAttribute('aria-expanded'), 'false', 'aria-expanded is initially false');

  // Click 1: opens
  await userPill.events.click({ stopPropagation: () => {} });
  assert.equal(userMenu.hidden, false, 'Dropdown opens on first click');
  assert.equal(userPill.getAttribute('aria-expanded'), 'true', 'aria-expanded is true when open');

  // Click 2: closes
  await userPill.events.click({ stopPropagation: () => {} });
  assert.equal(userMenu.hidden, true, 'Dropdown closes on second click');
  assert.equal(userPill.getAttribute('aria-expanded'), 'false', 'aria-expanded is false after close');

  // Reopen and test click outside
  await userPill.events.click({ stopPropagation: () => {} });
  assert.equal(userMenu.hidden, false);
  const outsideEl = new MockEl('div');
  docListeners['click']({ target: outsideEl });
  assert.equal(userMenu.hidden, true, 'Click outside closes dropdown');
  assert.equal(userPill.getAttribute('aria-expanded'), 'false');

  // Reopen and test Escape key
  await userPill.events.click({ stopPropagation: () => {} });
  assert.equal(userMenu.hidden, false);
  docListeners['keydown']({ key: 'Escape' });
  assert.equal(userMenu.hidden, true, 'Escape key closes dropdown');
  assert.equal(userPill.getAttribute('aria-expanded'), 'false');
  assert.equal(userPill.focused, true, 'Escape key returns focus to userPill');

  console.log('PASS: TEST 1 - Session dropdown toggle, click-outside, Escape, and reload verified.');

  console.log('--- TEST 2: Local record precision and human formatting ---');
  // Set up storage with Record A and Record B
  const storageData = new Map();
  const mockStorage = {
    getItem: k => storageData.get(k) || null,
    setItem: (k, v) => storageData.set(k, v)
  };

  const recordA = {
    id: 1,
    savedAt: '2023-11-14T22:13:20.000Z',
    snapshot: {
      parameters: { v0: 10, alpha: 30 },
      results: { xMax: 8.827999999999999 } // float requiring formatting
    }
  };

  const recordB = {
    id: 2,
    savedAt: '2023-11-14T22:13:30.000Z',
    snapshot: {
      parameters: { v0: 25.5, alpha: 45 },
      results: { xMax: 66.35204081632653, tMax: 3.67989 } // floats requiring formatting
    }
  };

  // Key must match SimRegistry internal key: 'fisica-i:records:v1:sim-06'
  // Format must include version:1 per SimRegistry validation
  storageData.set('fisica-i:records:v1:sim-06', JSON.stringify({ version: 1, records: [recordA, recordB] }));

  const simContainer = new MockEl('main');
  const simEl = new MockEl('section');
  simEl.id = 'tab-sim';
  simEl.parentElement = simContainer;
  simContainer.append(simEl);
  body.append(simContainer);

  const ctx2 = vm.createContext({
    console,
    document: {
      body,
      getElementById: id => (id === 'tab-sim' ? simEl : new MockEl(id)),
      querySelector: sel => (sel === '.sim-nav' ? nav : null),
      querySelectorAll: () => [],
      createElement: tag => new MockEl(tag),
      addEventListener: (k, fn) => { docListeners[k] = fn; }
    },
    window: { localStorage: mockStorage },
    URL,
    setTimeout: (fn, ms) => fn(),
    setTab: () => {},
    SimRegistry: vm.runInContext(fs.readFileSync('js/sim-registry.js', 'utf8') + '\n;SimRegistry', vm.createContext({ console })),
    SimGroups: ctx.SimGroups
  });

  // Run sim-records-ui.js in ctx2
  vm.runInContext(fs.readFileSync('js/sim-records-ui.js', 'utf8'), ctx2);

  // Trigger ready
  if (docListeners['DOMContentLoaded']) {
    docListeners['DOMContentLoaded']();
  }

  // Find records table in body
  const table = findEl(body, e => e.tag === 'table');
  assert.ok(table, 'Table rendered');

  const rows = findAll(table, e => e.tag === 'tr').filter(tr => tr.children.some(c => c.tag === 'td'));
  assert.equal(rows.length, 2, '2 records rendered in table');

  // Verify Record A formatting
  // Note: 8.827999999999999 === 8.828 in IEEE 754 (same bit pattern) — tooltip shows "8.828"
  const rowA = rows[0];
  const tdA_xMax = rowA.children.find(td => td.textContent === '8.828');
  assert.ok(tdA_xMax, '8.827999999999999 formatted to 8.828');
  assert.equal(tdA_xMax.getAttribute('title'), 'Valor exacto: 8.828', 'Tooltip shows float as JS represents it');

  // Verify Record B formatting
  // Note: JSON.stringify(66.35204081632653) = "66.35204081632654" (double rounding at last bit)
  const rowB = rows[1];
  const tdB_xMax = rowB.children.find(td => td.textContent === '66.352');
  assert.ok(tdB_xMax, '66.35204081632653 formatted to 66.352');
  assert.equal(tdB_xMax.getAttribute('title'), 'Valor exacto: 66.35204081632654', 'Tooltip shows full double representation');

  console.log('PASS: TEST 2 - Human-readable numeric formatting and precision preservation verified.');

  console.log('--- TEST 3: Saving individual local Record B to group ---');
  // Verify row B has the "Guardar en grupo" button (exists and bound)
  const rowB_saveGroupBtn = rowB.children.flatMap(c => findAll(c, e => e.tag === 'button')).find(b => b.textContent === 'Guardar en grupo');
  assert.ok(rowB_saveGroupBtn, 'Row B has Guardar en grupo button');

  const allDialogs = findAll(body, e => e.tag === 'dialog');
  const dialog = allDialogs[allDialogs.length - 1];
  assert.ok(dialog, 'Group dialog exists');

  lastPayload = null;
  await rowB_saveGroupBtn.events.click();
  await new Promise(r => setImmediate(r));
  assert.equal(dialog.open, true, 'Dialog opened for Record B');

  // Confirm submit on dialog
  const submitBtn = findEl(dialog, e => e.className && e.className.includes('btn-dialog-submit'));
  assert.ok(submitBtn, 'Submit button exists');
  await submitBtn.events.click();

  // Verify payload matches Record B, NOT Record A, and NOT currentState (999)
  assert.ok(lastPayload, 'Payload was sent to server');
  assert.equal(lastPayload.grupo_id, 42, 'Sent to chosen group');
  assert.equal(lastPayload.simulador_id, '06', 'Simulator ID is 06');
  assert.equal(lastPayload.parametros.v0, 25.5, 'Parameters correspond to Record B (v0 = 25.5)');
  assert.equal(lastPayload.parametros.alpha, 45, 'Parameters correspond to Record B (alpha = 45)');
  assert.equal(lastPayload.resultado.xMax, 66.35204081632653, 'Result corresponds to Record B (xMax = 66.35204081632653)');
  assert.notEqual(lastPayload.parametros.v0, 10, 'Record A was NOT sent');
  assert.notEqual(lastPayload.parametros.v0, 999, 'Current simulator state was NOT sent');

  console.log('PASS: TEST 3 - Record B sent exclusively; Record A and current state isolated.');

  console.log('--- TEST 4: Global "Guardar en grupo" continues saving current state ---');
  const globalSaveGroupBtn = findEl(nav, e => e.className && e.className.includes('nav-btn-group'));
  assert.ok(globalSaveGroupBtn, 'Global Guardar en grupo button exists');

  lastPayload = null;
  const dialog0 = allDialogs[0];
  const submitBtn0 = findEl(dialog0, e => e.className && e.className.includes('btn-dialog-submit'));
  await globalSaveGroupBtn.events.click();
  await submitBtn0.events.click();

  assert.ok(lastPayload, 'Payload sent from global button');
  assert.equal(lastPayload.parametros.v0, 999, 'Global button captured current simulator state (v0 = 999)');
  assert.equal(lastPayload.resultado.xMax, 9999, 'Global button captured current simulator result (xMax = 9999)');

  console.log('PASS: TEST 4 - Global Guardar en grupo button preserves current simulator state capture.');
  console.log('\nALL FOCUSED UX & SAVE TESTS PASSED (4/4)!');
})().catch(e => {
  console.error('TEST FAILED:', e);
  process.exitCode = 1;
});
