// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 12)
// ============================================================

const UI = (() => {

  function boot() {
    setTimeout(() => {
      Renderer.init();
      buildCuerpoSelector();
      bindControls();
      syncAll();
      Renderer.start();
    }, 80);
  }

  // ── Selector de cuerpos (botones dinámicos) ───────────────
  function buildCuerpoSelector() {
    const wrap = document.getElementById('cuerpo-btns');
    if (!wrap) return;
    wrap.innerHTML = '';
    Engine.getCuerpos().forEach(c => {
      const btn = document.createElement('button');
      btn.className   = 'cuerpo-btn' + (c.id === Engine.getState().cuerpoId ? ' active' : '');
      btn.dataset.id  = c.id;
      btn.style.setProperty('--cc', c.color);
      btn.innerHTML   = `
        <span class="cuerpo-dot" style="background:${c.color}"></span>
        <span class="cuerpo-name">${c.nombre}</span>
        ${c.agregada ? '<span class="badge-agr-sm">[+]</span>' : ''}
      `;
      btn.addEventListener('click', () => setCuerpo(c.id, btn));
      wrap.appendChild(btn);
    });
  }

  function bindControls() {
    bind('sl-M',     v => { Engine.setM(+v);     syncVal('val-M',     v, 'kg');    updateDimLabel(); });
    bind('sl-dim',   v => { Engine.setDim(+v);   syncVal('val-dim',   v, 'm');     });
    bind('sl-omega', v => { Engine.setOmega(+v); syncVal('val-omega', v, 'rad/s'); });
    bind('sl-d',     v => { Engine.setD(+v);     syncVal('val-d',     v, 'm');     });
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) SimInputs.bind(el,fn);
  }

  function syncAll() {
    const st = Engine.getState();
    sv('sl-M',     st.M,     'val-M',     'kg');
    sv('sl-omega', st.omega, 'val-omega', 'rad/s');
    sv('sl-d',     st.d,     'val-d',     'm');
    sv('sl-dim',   st.dim,   'val-dim',   'm');
    updateDimLabel();
    updateStats();
  }

  function sv(slId, val, valId, unit) {
    const sl = document.getElementById(slId);
    if (sl) sl.value = val;
    SimInputs.sync(slId,val);
    syncVal(valId, val, unit);
  }

  function updateDimLabel() {
    const c   = Engine.getCuerpo();
    const lbl = document.getElementById('lbl-dim');
    if (lbl) lbl.textContent = c.param === 'L' ? 'L' : 'R';
    const desc = document.getElementById('desc-dim');
    if (desc) desc.textContent = c.paramLabel;
  }

  function updateStats() {
    const st = Engine.getState();
    const c  = Engine.getCuerpo();
    document.body.style.setProperty('--body-color',c.color);
    setHTML('stat-I',    Engine.fmt(st.I)    + ' kg·m²');
    setHTML('stat-IP',   Engine.fmt(st.I_P)  + ' kg·m²');
    setHTML('stat-K',    Engine.fmt(st.K)    + ' J');
    setHTML('stat-KP',   Engine.fmt(st.K_P)  + ' J');
    setHTML('stat-formula', c.formula);

    // Color dinámico del stat-formula
    const el = document.getElementById('stat-formula');
    if (el) el.style.color = c.color;
  }

  function updatePanel(sust) {
    if (!sust) return;
    setHTML('sust-inercia',  buildStep(sust.inercia));
    setHTML('sust-ejes',     buildStep(sust.ejes_par));
    setHTML('sust-energia',  buildStep(sust.energia));
    setHTML('sust-energiap', buildStep(sust.energia_p));
    updateStats();
  }

  function buildStep(s) {
    const sustHtml = s.sust.replace(/\n/g, '<br>');
    return `
      <div class="step-formula">${s.formula}</div>
      <div class="step-sust">${sustHtml}</div>
      <div class="step-res">${s.res}</div>`;
  }

  function syncVal(id, val, unit) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<b>${Engine.fmt(+val)}</b> <span>${unit}</span>`;
  }
  function setHTML(id, html) {
    const el = document.getElementById(id); if (el) el.innerHTML = html;
  }

  return { boot, updatePanel };

})();

// ── Globales ─────────────────────────────────────────────────
function setCuerpo(id, btn) {
  Engine.setCuerpo(id);

  // Actualizar botones activos
  document.querySelectorAll('.cuerpo-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    // llamado desde código: busca el botón por data-id
    const b = document.querySelector(`.cuerpo-btn[data-id="${id}"]`);
    if (b) b.classList.add('active');
  }

  // Sincronizar slider de dim al nuevo valor por defecto
  const st = Engine.getState();
  const sl = document.getElementById('sl-dim');
  if (sl) sl.value = st.dim;
  SimInputs.sync('sl-dim',st.dim);

  const lbl = document.getElementById('lbl-dim');
  const c   = Engine.getCuerpo();
  if (lbl) lbl.textContent = c.param;

  const desc = document.getElementById('desc-dim');
  if (desc) desc.textContent = c.paramLabel;

  const valEl = document.getElementById('val-dim');
  if (valEl) valEl.innerHTML = `<b>${Engine.fmt(st.dim)}</b> <span>m</span>`;
}

function togglePause(btn) {
  Engine.togglePause();
  const st = Engine.getState();
  btn.textContent = st.paused ? '▶ Reanudar' : '⏸ Pausar';
}
function resetSim() {
  // Reiniciar ángulo acumulado y reanudar si estaba pausado
  const st = Engine.getState();
  st.theta = 0;
  if (st.paused) Engine.togglePause();
  document.getElementById('btn-pause').textContent = '⏸ Pausar';
  Engine.setOmega(st.omega); // recalcula I/K con parámetros actuales
}
function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => UI.boot());