const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// DOM mock with full support for safe createElement/textContent/replaceChildren/append
class MockElement {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this._t = '';
    this.value = '';
    this.className = '';
    this.attributes = {};
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
  addEventListener(name, fn) {
    this.events[name] = fn;
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  set innerHTML(v) {
    throw Error('Unsafe innerHTML sink detected');
  }
}

// Helper to recursively find element matching predicate
function findEl(el, pred) {
  if (pred(el)) return el;
  for (const c of el.children) {
    if (c instanceof MockElement) {
      const f = findEl(c, pred);
      if (f) return f;
    }
  }
  return null;
}

(async () => {
  const attack = '<img src=x onerror=alert(1)>';
  let currentUser = { id: 1, name: 'Demo Uno' };
  let groupsData = [{ id: 10, nombre: 'Grupo de Física' }];

  function createContext(simId, snapshot) {
    const nav = new MockElement('nav');
    nav.className = 'sim-nav';
    const body = new MockElement('body');
    const doc = {
      body,
      querySelector: sel => sel === '.sim-nav' ? nav : null,
      querySelectorAll: () => [],
      createElement: tag => new MockElement(tag),
      currentScript: { src: 'http://localhost/prefix/js/sim-groups.js' }
    };
    const ctx = vm.createContext({
      URL,
      setTimeout: (fn, ms) => { fn(); return 1; },
      clearTimeout: () => {},
      location: { href: 'http://localhost/simuladores/' + simId + '/' },
      document: doc,
      window: { localStorage: { getItem: () => null } },
      fetch: async (url, opts) => {
        const u = String(url);
        if (u.includes('action=session')) {
          return { ok: true, json: async () => ({ csrf: 'csrf_test_token', user: currentUser }) };
        }
        if (u.includes('action=groups')) {
          return { ok: true, json: async () => ({ groups: groupsData }) };
        }
        if (u.includes('action=save')) {
          return { ok: true, json: async () => ({ ok: true, id: 99 }) };
        }
        return { ok: true, json: async () => ({ ok: true }) };
      }
    });
    const hook = vm.runInContext(fs.readFileSync('js/sim-groups.js', 'utf8') + ';SimGroups', ctx);
    hook.bind(() => snapshot, simId);
    return { nav, body, hook, ctx };
  }

  // 1. Sesión autenticada aparece en toolbar
  currentUser = { id: 1, name: 'Demo Uno' };
  const sim02Snap = {
    parameters: { 'Vector 1 (u)': '(4, 3)', 'Vector 2 (u)': '(-2, 5)' },
    results: { 'Rx (u)': 2, 'Ry (u)': 8, '|R| (u)': 8.24621125, 'θ (°)': 75.9637565, 'A·B (u²)': 7, '(A×B)z (u²)': 26 }
  };
  const env1 = createContext('02', sim02Snap);
  const saveBtn1 = findEl(env1.nav, e => e.textContent === 'Guardar en grupo');
  assert.ok(saveBtn1, 'Boton Guardar en grupo presente en toolbar');
  await saveBtn1.events.click();

  const userNameEl = findEl(env1.nav, e => e.className === 'nav-user-name');
  assert.ok(userNameEl, 'Elemento de usuario presente en toolbar');
  assert.equal(userNameEl.textContent, 'Demo Uno', '1. Sesión autenticada muestra el nombre de usuario');

  // 2. Sin sesión aparece Iniciar sesión
  currentUser = null;
  const env2 = createContext('02', sim02Snap);
  const saveBtn2 = findEl(env2.nav, e => e.textContent === 'Guardar en grupo');
  await saveBtn2.events.click();
  const loginLink = findEl(env2.nav, e => e.className && e.className.includes('nav-btn-login'));
  assert.ok(loginLink, 'Enlace Iniciar sesión presente');
  assert.equal(loginLink.hidden, false, '2. Sin sesión aparece Iniciar sesión');

  // 3 & 4 & 5. Modal NO contiene JSON crudo, muestra Parameters/Resultados, y SIM02 renderiza correctamente
  currentUser = { id: 1, name: 'Demo Uno' };
  const env3 = createContext('02', sim02Snap);
  const saveBtn3 = findEl(env3.nav, e => e.textContent === 'Guardar en grupo');
  await saveBtn3.events.click();
  const dialog3 = env3.body.children[0];
  const preview3 = findEl(dialog3, e => e.className === 'group-dialog-preview');
  assert.ok(preview3, 'Preview container presente en modal');

  // Asegurar que NO es JSON crudo
  assert.ok(!preview3.textContent.includes('{"parameters":'), '3. Modal NO contiene JSON crudo serializado');
  assert.ok(!preview3.textContent.includes('{"results":'), '3. Modal NO contiene llaves JSON');

  // 4. Muestra encabezados legibles PARÁMETROS y RESULTADOS
  assert.ok(preview3.textContent.includes('PARÁMETROS'), '4. Modal muestra sección PARÁMETROS');
  assert.ok(preview3.textContent.includes('RESULTADOS'), '4. Modal muestra sección RESULTADOS');
  assert.ok(preview3.textContent.includes('Vectores · SIM 02'), '4. Modal muestra nombre humano del simulador');

  // 5. SIM02 campos específicos formateados
  assert.ok(preview3.textContent.includes('Vector 1 (u)'), '5. SIM02 parámetro Vector 1');
  assert.ok(preview3.textContent.includes('(4, 3)'), '5. SIM02 valor de vector');
  assert.ok(preview3.textContent.includes('8.246'), '5. SIM02 número redondeado a 3 decimales (8.246)');
  assert.ok(preview3.textContent.includes('75.964'), '5. SIM02 ángulo redondeado a 3 decimales (75.964)');
  assert.ok(preview3.textContent.includes('26'), '5. SIM02 entero intacto (26)');

  // 6. Otro adapter distinto (SIM05 MRU y MRUA) renderiza correctamente
  const sim05Snap = {
    parameters: { 'MRU x₀ (m)': 0, 'MRU v (m/s)': 5, 'MRUA a (m/s²)': 2, 'Caída libre': false, 'Duración (s)': 10 },
    results: { 't (s)': 10, 'MRU x (m)': 50, 'MRUA x (m)': 100, 'MRUA v (m/s)': 20 }
  };
  const env4 = createContext('05', sim05Snap);
  const saveBtn4 = findEl(env4.nav, e => e.textContent === 'Guardar en grupo');
  await saveBtn4.events.click();
  const dialog4 = env4.body.children[0];
  const preview4 = findEl(dialog4, e => e.className === 'group-dialog-preview');
  assert.ok(preview4.textContent.includes('MRU y MRUA · SIM 05'), '6. Nombre humano SIM05');
  assert.ok(preview4.textContent.includes('MRU v (m/s)'), '6. Parámetro de MRU');
  assert.ok(preview4.textContent.includes('No'), '6. Booleano false formateado como No');
  assert.ok(preview4.textContent.includes('50'), '6. Resultado MRU x');

  // 7. XSS sigue siendo texto inerte
  const xssSnap = {
    parameters: { [attack]: attack },
    results: { 'payload': attack }
  };
  const env5 = createContext('08', xssSnap);
  const saveBtn5 = findEl(env5.nav, e => e.textContent === 'Guardar en grupo');
  await saveBtn5.events.click();
  const dialog5 = env5.body.children[0];
  const preview5 = findEl(dialog5, e => e.className === 'group-dialog-preview');
  assert.ok(preview5.textContent.includes(attack), '7. Ataque XSS presente sólo como texto inerte');

  // 8. Botón Guardar mantiene doble-click protection
  const submitBtn = findEl(dialog3, e => e.className === 'btn-dialog-submit');
  assert.ok(submitBtn, 'Botón submit presente');
  let clickCount = 0;
  // Simular envío
  const clickPromise1 = submitBtn.events.click();
  assert.equal(submitBtn.disabled, true, '8. Botón submit deshabilitado inmediatamente al enviar');
  assert.equal(submitBtn.textContent, 'Guardando…', '8. Texto Guardando… durante el envío');
  // Segundo click mientras envía no debe despachar otro POST
  await submitBtn.events.click();
  await clickPromise1;

  // 9. Éxito / Error feedback preservados
  assert.equal(submitBtn.textContent, '✓ Guardado', '9. Estado de éxito ✓ Guardado');
  const statusEl = findEl(dialog3, e => e.tag === 'p' && e.attributes && e.attributes.role === 'status');
  assert.ok(statusEl.textContent.includes('✓ Simulación guardada en «Grupo de Física»'), '9. Mensaje de éxito con nombre de grupo');
  assert.equal(statusEl.className, 'status-success', '9. Clase status-success');

  // 10. Los 13 adapters siguen disponibles
  for (let i = 1; i <= 13; i++) {
    const id = String(i).padStart(2, '0');
    assert.ok(env1.hook.SIMULATOR_NAMES[id], '10. Adaptador y nombre presente para SIM ' + id);
    const title = env1.hook.getSimTitle(id);
    assert.ok(title.includes('SIM ' + id), '10. Título generado para SIM ' + id);
  }

  console.log('PASS: sim-toolbar-modal: session, login, modal without raw JSON, KV preview, SIM02/SIM05 adapters, XSS safety, double-click protection, save feedback and 13/13 simulators.');
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
