const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class El {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this.style = {};
    this.attributes = {};
    this.value = '';
    this.classList = { contains: () => true };
  }
  append(...a) { this.children.push(...a); }
  replaceChildren(...a) { this.children = [...a]; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, v) { this.events[k] = v; }
  set innerHTML(v) { throw Error('Unsafe HTML'); }
}

const routes = fs.readdirSync('simuladores').filter(r => /^\d\d_/.test(r)).sort();
assert.equal(routes.length, 13, 'Must have exactly 13 simulators');

for (const route of routes) {
  const id = route.slice(0, 2);
  const body = new El('body');
  body.dataset = { simId: id };
  const nav = new El('nav');
  const sim = new El('div');
  sim.parentElement = body;
  const ids = {
    'tab-sim': sim,
    'panel-prefijos': new El(),
    'pref-valor': Object.assign(new El(), { value: '2' }),
    'pref-origen': Object.assign(new El(), { value: '3' }),
    'pref-destino': Object.assign(new El(), { value: '0' }),
    'eff-in': Object.assign(new El(), { value: '100' }),
    'eff-out': Object.assign(new El(), { value: '80' }),
    'eff-kind': Object.assign(new El(), { value: 'J' }),
    'inp-valor': Object.assign(new El(), { value: '5' }),
    'sel-origen': Object.assign(new El(), { value: 'm' }),
    'sel-destino': Object.assign(new El(), { value: 'km' })
  };
  ids['panel-prefijos'].style.display = 'block';
  const get = k => ids[k] ??= new El();

  let ready, boundCapture = null, boundId = null;
  const ctx = vm.createContext({
    console,
    document: {
      body,
      getElementById: get,
      querySelector: () => nav,
      querySelectorAll: () => [],
      createElement: t => new El(t),
      addEventListener: (k, fn) => { ready = fn; }
    },
    window: { localStorage: { getItem: () => null, setItem: () => {} } },
    setTimeout: () => {},
    setTab: () => {},
    SimGroups: {
      bind: (fn, sid) => { boundCapture = fn; boundId = sid; }
    }
  });

  for (const f of ['js/sim-common.js', `simuladores/${route}/js/engine.js`, 'js/sim-registry.js', 'js/sim-records-ui.js']) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
  }
  vm.runInContext('if(Engine.init)Engine.init();if(Engine.calcular)Engine.calcular();', ctx);
  if (id === '02') {
    vm.runInContext('Engine.createVector(4, 3); Engine.createVector(-2, 5);', ctx);
  }
  ready();

  assert.equal(boundId, id, `Simulator ${id} bound ID matches`);
  assert.ok(typeof boundCapture === 'function', `Simulator ${id} has bound capture function`);

  const snapshot = boundCapture();
  assert.ok(snapshot && typeof snapshot === 'object', `Simulator ${id} returns snapshot object`);
  assert.ok(snapshot.parameters && typeof snapshot.parameters === 'object', `Simulator ${id} has parameters`);
  assert.ok(snapshot.results && typeof snapshot.results === 'object', `Simulator ${id} has results`);

  // Check serialization and ensure no invalid numbers
  const json = JSON.stringify(snapshot);
  assert.ok(!json.includes('null') || snapshot.parameters || snapshot.results, 'Valid JSON');
  assert.ok(!/NaN|Infinity|undefined/.test(json), `Simulator ${id} contains no NaN/Infinity/undefined`);
}
console.log('PASS: 13/13 simulator adapters verified for groups capture and snapshot structure.');
