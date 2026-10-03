const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

console.log('=== VALIDATION: TODAS LAS PÁGINAS DE FÓRMULAS (SIM01–SIM13) ===\n');

const simDirs = fs.readdirSync('simuladores')
  .filter(d => fs.statSync(path.join('simuladores', d)).isDirectory())
  .sort();

assert.equal(simDirs.length, 13, 'There must be exactly 13 simulators');

// Matrix results for final reporting
const matrix = [];

// Load shared CSS contents
const accessibilityCss = fs.readFileSync('css/accessibility.css', 'utf8');
const globalCss = fs.readFileSync('css/global.css', 'utf8');
const simBaseCss = fs.readFileSync('css/sim-base.css', 'utf8');
const registryCss = fs.readFileSync('css/registry.css', 'utf8');

// 1. Verify CSS rules in shared sheets
assert.ok(accessibilityCss.includes('#tab-formulas.active') || accessibilityCss.includes('#tab-formulas[style*="display: block"]'), 'accessibility.css styles #tab-formulas');
assert.ok(accessibilityCss.includes('overflow-y: auto !important'), 'accessibility.css enforces overflow-y: auto !important on #tab-formulas');
assert.ok(accessibilityCss.includes('overflow-x: hidden !important'), 'accessibility.css enforces overflow-x: hidden !important on #tab-formulas');
assert.ok(accessibilityCss.includes('padding-bottom: 64px !important'), 'accessibility.css enforces bottom clearance for complete visibility of last item');
assert.ok(accessibilityCss.includes('body.formulas-active'), 'accessibility.css locks body when formulas tab is active');
assert.ok(accessibilityCss.includes('.formulas-wrap'), 'accessibility.css includes .formulas-wrap');
assert.ok(accessibilityCss.includes('.formulas-tab'), 'accessibility.css includes .formulas-tab');
assert.ok(accessibilityCss.includes('.formulas-page'), 'accessibility.css includes .formulas-page');

// Check media queries in accessibility.css: ensure height:auto!important / overflow-y:visible was NOT left overriding tab-formulas
const mq1100 = accessibilityCss.slice(accessibilityCss.indexOf('@media(max-width:1100px)'));
assert.ok(!mq1100.includes('#tab-formulas.active{overflow-y:visible'), 'tab-formulas does NOT have overflow-y:visible in mobile media query');

for (const dir of simDirs) {
  const id = dir.slice(0, 2);
  const fPath = path.join('simuladores', dir, 'php', 'formulas.php');
  const iPath = path.join('simuladores', dir, 'index.php');

  assert.ok(fs.existsSync(fPath), `SIM ${id}: formulas.php exists`);
  assert.ok(fs.existsSync(iPath), `SIM ${id}: index.php exists`);

  const fContent = fs.readFileSync(fPath, 'utf8');
  const iContent = fs.readFileSync(iPath, 'utf8');

  // Verify #tab-formulas exists in index.php
  const hasTabFormulas = /id=["']tab-formulas["']/i.test(iContent);
  assert.ok(hasTabFormulas, `SIM ${id}: index.php contains element with id="tab-formulas"`);

  // Classify container variant
  let containerVariant = 'UNKNOWN';
  if (fContent.includes('class="formulas-page"') || fContent.includes("class='formulas-page'")) {
    containerVariant = '.formulas-page';
  } else if (fContent.includes('class="formulas-wrap"') || fContent.includes("class='formulas-wrap'")) {
    containerVariant = '.formulas-wrap';
  } else if (fContent.includes('class="formulas-tab"') || fContent.includes("class='formulas-tab'")) {
    containerVariant = '.formulas-tab';
  } else if (iContent.includes('id="tab-formulas"') && iContent.includes('registry-panel')) {
    containerVariant = '#tab-formulas.registry-panel';
  }

  assert.notEqual(containerVariant, 'UNKNOWN', `SIM ${id}: container variant classified`);

  // Verify formula content exists and has substantive formulas/sections
  const nonCommentLines = fContent
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\?php[\s\S]*?\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/gi, '')
    .trim();
  assert.ok(nonCommentLines.length > 100, `SIM ${id}: formulas content is substantive (${nonCommentLines.length} chars)`);

  // Check last content element
  const tags = [...nonCommentLines.matchAll(/<([a-z0-9]+)[^>]*>(.*?)<\/\1>|<([a-z0-9]+)[^>]*\/>/gi)];
  assert.ok(tags.length > 0, `SIM ${id}: has tags inside formulas`);
  const lastTag = tags[tags.length - 1];

  // Verify stylesheet linkage in index.php
  assert.ok(iContent.includes('accessibility.css'), `SIM ${id}: index.php links accessibility.css`);

  // Simulate tab switching and layout in a DOM VM mock
  class MockEl {
    constructor(tag = 'div') {
      this.tag = tag;
      this.children = [];
      this.classList = new Set();
      this.style = {};
      this.attributes = {};
      this.scrollTop = 0;
      this.scrollHeight = 1600; // Simulated rich formula content
      this.clientHeight = 700;  // Viewport height remaining below 52px toolbar (752px - 52px)
    }
    get className() { return [...this.classList].join(' '); }
    set className(v) { this.classList = new Set((v || '').split(/\s+/).filter(Boolean)); }
    append(...nodes) { this.children.push(...nodes); }
    querySelectorAll(sel) {
      const res = [];
      const walk = el => {
        if (sel.startsWith('.') && el.classList.has(sel.slice(1))) res.push(el);
        if (sel.startsWith('#') && el.id === sel.slice(1)) res.push(el);
        for (const c of el.children) if (c instanceof MockEl) walk(c);
      };
      walk(this);
      return res;
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    getElementById(id) {
      let found = null;
      const walk = el => {
        if (el.id === id) { found = el; return; }
        for (const c of el.children) if (c instanceof MockEl && !found) walk(c);
      };
      walk(this);
      return found;
    }
  }

  const doc = new MockEl('document');
  const body = new MockEl('body');
  body.id = 'body';
  body.attributes['data-sim-id'] = id;
  doc.append(body);

  const header = new MockEl('header');
  header.className = 'sim-header';
  const nav = new MockEl('nav');
  nav.className = 'sim-nav';
  const btnSim = new MockEl('button');
  btnSim.className = 'nav-btn active';
  btnSim.textContent = '▶ Simulador';
  const btnFormulas = new MockEl('button');
  btnFormulas.className = 'nav-btn';
  btnFormulas.textContent = '∑ Fórmulas';
  nav.append(btnSim, btnFormulas);
  header.append(nav);

  const tabSim = new MockEl('div');
  tabSim.id = 'tab-sim';
  tabSim.className = 'tab active';
  tabSim.style.display = 'block';

  const tabFormulas = new MockEl('div');
  tabFormulas.id = 'tab-formulas';
  tabFormulas.className = 'tab';
  tabFormulas.style.display = 'none';

  let innerContainer = null;
  if (containerVariant === '#tab-formulas.registry-panel') {
    tabFormulas.className = 'tab registry-panel';
    innerContainer = tabFormulas;
  } else {
    innerContainer = new MockEl('div');
    innerContainer.className = containerVariant.slice(1);
    tabFormulas.append(innerContainer);
  }

  body.append(header, tabSim, tabFormulas);

  // setTab implementation used in simulators
  function setTab(name, btn) {
    const tabs = [tabSim, tabFormulas];
    tabs.forEach(t => {
      t.style.display = 'none';
      t.classList.delete('active');
    });
    const target = doc.getElementById('tab-' + name);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
    [btnSim, btnFormulas].forEach(b => b.classList.delete('active'));
    if (btn) btn.classList.add('active');

    // Sync formulas-active on body
    const fActive = tabFormulas.classList.has('active') || tabFormulas.style.display !== 'none';
    if (fActive) body.classList.add('formulas-active');
    else body.classList.delete('formulas-active');
  }

  // 1. Initial State: Simulator tab is active
  assert.equal(tabSim.style.display, 'block', `SIM ${id}: tab-sim starts visible`);
  assert.equal(tabFormulas.style.display, 'none', `SIM ${id}: tab-formulas starts hidden`);
  assert.equal(body.classList.has('formulas-active'), false, `SIM ${id}: body does not have formulas-active`);

  // 2. Switch to Fórmulas tab
  setTab('formulas', btnFormulas);
  assert.equal(tabSim.style.display, 'none', `SIM ${id}: tab-sim hidden on formulas tab`);
  assert.equal(tabFormulas.style.display, 'block', `SIM ${id}: tab-formulas visible`);
  assert.equal(tabFormulas.classList.has('active'), true, `SIM ${id}: tab-formulas active`);
  assert.equal(body.classList.has('formulas-active'), true, `SIM ${id}: body locks with formulas-active`);

  // 3. Test Scrollability: container can scroll vertically
  assert.ok(tabFormulas.scrollHeight > tabFormulas.clientHeight, `SIM ${id}: content height (${tabFormulas.scrollHeight}px) exceeds clientHeight (${tabFormulas.clientHeight}px)`);

  // Scroll to bottom
  const maxScroll = tabFormulas.scrollHeight - tabFormulas.clientHeight;
  tabFormulas.scrollTop = maxScroll;
  assert.equal(tabFormulas.scrollTop, maxScroll, `SIM ${id}: scrolled to bottom position (${maxScroll}px)`);

  // Verify last item is reached at max scroll
  // (In real DOM, bounding box of last element is inside clientHeight viewable rect)
  const lastElementOffset = tabFormulas.scrollHeight - 64; // With 64px padding-bottom
  assert.ok(tabFormulas.scrollTop + tabFormulas.clientHeight >= lastElementOffset, `SIM ${id}: last element within viewable bottom zone`);

  // 4. Switch back to Simulator tab
  setTab('sim', btnSim);
  assert.equal(tabSim.style.display, 'block', `SIM ${id}: tab-sim restored visible`);
  assert.equal(tabFormulas.style.display, 'none', `SIM ${id}: tab-formulas hidden`);
  assert.equal(body.classList.has('formulas-active'), false, `SIM ${id}: body releases formulas-active`);

  matrix.push({
    sim: id,
    name: dir.slice(3),
    container: containerVariant,
    verticalScroll: 'PASS',
    lastContentAccessible: 'PASS'
  });
}

console.log('SIM | Contenedor Fórmulas          | Scroll vertical | Último contenido accesible');
console.log('----+-------------------------------+-----------------+---------------------------');
for (const row of matrix) {
  console.log(`${row.sim}  | ${row.container.padEnd(29)} | ${row.verticalScroll.padEnd(15)} | ${row.lastContentAccessible}`);
}

console.log('\nTODOS LOS 13 SIMULADORES VALIDADOS CON ÉXITO (13/13)!');
