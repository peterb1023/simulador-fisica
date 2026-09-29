// ============================================================
//  ui.js  —  Calculadora de unidades + tabla prefijos (SIM 03)
// ============================================================

const UI = (() => {

  let modoActual = 'unidades'; // 'unidades' | 'prefijos'

  // ── Arrancar ─────────────────────────────────────────────
  function boot() {
    buildCategoryTabs();
    buildPrefijosTabla();
    setCategoria(0);
    bindInputs();
  }

  // ── Tabs de categoría ─────────────────────────────────────
  function buildCategoryTabs() {
    const nav = document.getElementById('cat-nav');
    nav.innerHTML = '';
    Engine.CATEGORIAS.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.className = 'cat-tab' + (i === 0 ? ' active' : '');
      btn.innerHTML = `<span class="ct-icon">${cat.icono}</span><span class="ct-name">${cat.nombre}</span>`;
      btn.onclick = () => setCategoria(i);
      nav.appendChild(btn);
    });
  }

  // ── Seleccionar categoría ────────────────────────────────
  function setCategoria(idx) {
    document.querySelectorAll('.cat-tab').forEach((b, i) => {
      b.classList.toggle('active', i === idx);
    });
    const cat = Engine.CATEGORIAS[idx];
    buildSelectores(cat);
    calcular();
  }

  // ── Construir selectores de unidad ───────────────────────
  function buildSelectores(cat) {
    const buildOpts = (sel) => {
      sel.innerHTML = '';
      cat.unidades.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.simbolo;
        opt.textContent = `${u.simbolo} — ${u.nombre}`;
        sel.appendChild(opt);
      });
    };

    const sO = document.getElementById('sel-origen');
    const sD = document.getElementById('sel-destino');
    buildOpts(sO);
    buildOpts(sD);

    // Destino por defecto: segunda opción
    if (sD.options.length > 1) sD.selectedIndex = 1;
  }

  // ── Calcular y mostrar resultado ─────────────────────────
  function calcular() {
    const valor = parseFloat(document.getElementById('inp-valor').value);
    if (isNaN(valor)) { clearResult(); return; }

    const catIdx = [...document.querySelectorAll('.cat-tab')].findIndex(b => b.classList.contains('active'));
    const cat    = Engine.CATEGORIAS[catIdx];
    const sO     = document.getElementById('sel-origen').value;
    const sD     = document.getElementById('sel-destino').value;

    const res = Engine.convertir(valor, cat.nombre, sO, sD);
    if (!res) { clearResult();document.getElementById('res-de').textContent='Valor inválido o temperatura por debajo del cero absoluto.';return; }

    // Mostrar resultado grande
    document.getElementById('res-valor').textContent = Engine.fmtN(res.resultado);
    document.getElementById('res-unidad').textContent = sD;
    document.getElementById('res-de').textContent =
      `${Engine.fmtN(valor)} ${sO}  →  ${Engine.fmtN(res.resultado)} ${sD}`;

    // Pasos
    const stepsEl = document.getElementById('pasos-container');
    stepsEl.innerHTML = '';
    res.pasos.forEach((paso, i) => {
      const div = document.createElement('div');
      div.className = 'paso-card' + (paso.esFactor ? ' paso-factor' : '');
      div.innerHTML = `
        <div class="paso-num">${i + 1}</div>
        <div class="paso-body">
          <div class="paso-formula">${paso.formula}</div>
          <div class="paso-expr">${paso.expr}</div>
          <div class="paso-res">${paso.resultado}</div>
        </div>`;
      stepsEl.appendChild(div);
    });

    // Tabla de equivalencias rápidas
    buildEquivTable(cat, sO, valor);
  }

  function clearResult() {
    document.getElementById('res-valor').textContent  = '—';
    document.getElementById('res-unidad').textContent = '';
    document.getElementById('res-de').textContent     = '';
    document.getElementById('pasos-container').innerHTML = '';
    document.getElementById('equiv-table').innerHTML  = '';
  }

  // ── Tabla de equivalencias ───────────────────────────────
  function buildEquivTable(cat, simOrigen, valor) {
    const tbl = document.getElementById('equiv-table');
    tbl.innerHTML = '';
    if (isNaN(valor)) return;

    cat.unidades.forEach(u => {
      if (u.simbolo === simOrigen) return;
      const res = Engine.convertir(valor, cat.nombre, simOrigen, u.simbolo);
      if (!res) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="eq-sym">${u.simbolo}</td>
        <td class="eq-name">${u.nombre}</td>
        <td class="eq-val">${Engine.fmtN(res.resultado)}</td>`;
      tr.tabIndex=0;tr.setAttribute('role','button');tr.setAttribute('aria-label','Convertir a '+u.nombre);
      tr.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tr.click();}};
      tr.onclick = () => {
        document.getElementById('sel-destino').value = u.simbolo;
        calcular();
      };
      tbl.appendChild(tr);
    });
  }

  // ── Intercambiar origen/destino ──────────────────────────
  function intercambiar() {
    const sO = document.getElementById('sel-origen');
    const sD = document.getElementById('sel-destino');
    const tmp = sO.value;
    sO.value = sD.value;
    sD.value = tmp;
    calcular();
  }

  // ── Tabla de prefijos SI ─────────────────────────────────
  function buildPrefijosTabla() {
    const tbody = document.getElementById('prefijos-tbody');
    tbody.innerHTML = '';
    Engine.PREFIJOS.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = p.exp === 0 ? 'pref-base' : '';
      tr.innerHTML = `
        <td class="pf-nombre">${p.nombre}</td>
        <td class="pf-sim">${p.simbolo || '—'}</td>
        <td class="pf-exp">10<sup>${p.exp}</sup></td>
        <td class="pf-factor">${fmtFactor(p.exp)}</td>`;
      tbody.appendChild(tr);
    });
  }

  function fmtFactor(exp) {
    if (exp === 0) return '1';
    if (exp > 0 && exp <= 6)  return '1' + '0'.repeat(exp);
    if (exp < 0 && exp >= -4) return '0.' + '0'.repeat(Math.abs(exp) - 1) + '1';
    return `10<sup>${exp}</sup>`;
  }

  // ── Calculadora de prefijos ──────────────────────────────
  function calcularPrefijo() {
    const valor = parseFloat(document.getElementById('pref-valor').value);
    const expO  = parseInt(document.getElementById('pref-origen').value);
    const expD  = parseInt(document.getElementById('pref-destino').value);

    if (isNaN(valor)) {
      document.getElementById('pref-resultado').innerHTML = '—';
      document.getElementById('pref-pasos').innerHTML = '';
      return;
    }

    const pO = Engine.PREFIJOS.find(p => p.exp === expO);
    const pD = Engine.PREFIJOS.find(p => p.exp === expD);
    const res = Engine.convertirPrefijo(valor, expO, expD);
    if(!res){document.getElementById('pref-resultado').textContent='Valor fuera del rango numérico.';return;}

    document.getElementById('pref-resultado').innerHTML =
      `${Engine.fmtN(valor)} ${pO.simbolo || '(base)'}  =  <b>${Engine.fmtN(res.resultado)} ${pD.simbolo || '(base)'}</b>`;

    const stepsEl = document.getElementById('pref-pasos');
    stepsEl.innerHTML = '';
    res.pasos.forEach((paso, i) => {
      const div = document.createElement('div');
      div.className = 'paso-card';
      div.innerHTML = `
        <div class="paso-num">${i + 1}</div>
        <div class="paso-body">
          <div class="paso-formula">${paso.formula}</div>
          <div class="paso-expr">${paso.expr}</div>
          <div class="paso-res">${paso.resultado}</div>
        </div>`;
      stepsEl.appendChild(div);
    });
  }

  // ── Bind de eventos ──────────────────────────────────────
  function bindInputs() {
    document.getElementById('inp-valor').addEventListener('input', calcular);
    document.getElementById('sel-origen').addEventListener('change', calcular);
    document.getElementById('sel-destino').addEventListener('change', calcular);
    document.getElementById('pref-valor').addEventListener('input', calcularPrefijo);
    document.getElementById('pref-origen').addEventListener('change', calcularPrefijo);
    document.getElementById('pref-destino').addEventListener('change', calcularPrefijo);

    // Poblar selects de prefijo
    const builds = (id, defExp) => {
      const sel = document.getElementById(id);
      Engine.PREFIJOS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.exp;
        opt.textContent = `${p.nombre} (${p.simbolo || 'base'}) · 10^${p.exp}`;
        if (p.exp === defExp) opt.selected = true;
        sel.appendChild(opt);
      });
    };
    builds('pref-origen',  3);   // kilo por defecto
    builds('pref-destino', 0);   // base por defecto
    calcularPrefijo();
  }

  // ── Modo: unidades vs prefijos ───────────────────────────
  function setModo(modo, btn) {
    modoActual = modo;
    document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-unidades').style.display  = modo === 'unidades' ? '' : 'none';
    document.getElementById('panel-prefijos').style.display  = modo === 'prefijos'  ? '' : 'none';
    document.getElementById('panel-cat-nav').style.display   = modo === 'unidades' ? '' : 'none';
    const equiv = document.getElementById('panel-equiv');
    if (equiv) equiv.style.display = modo === 'unidades' ? '' : 'none';
  }

  return { boot, setCategoria, calcular, intercambiar, setModo, calcularPrefijo };

})();

// ── Globales desde HTML ───────────────────────────────────────
function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => UI.boot());
