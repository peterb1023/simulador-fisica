// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 06)
// ============================================================

const UI = (() => {

  function boot() {
    setTimeout(() => {
      Renderer.init();
      Engine.init();
      bindControls();
      syncAll();
      Renderer.start();
    }, 80);
  }

  function bindControls() {
    bind('sl-v0',    v => { Engine.setV0(+v);    syncVal('val-v0',    v, 'm/s'); });
    bind('sl-alpha', v => { Engine.setAlpha(+v); syncVal('val-alpha', v, '°');   });
    bind('sl-y0',    v => { Engine.setY0(+v);    syncVal('val-y0',    v, 'm');   });
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => fn(e.target.value));
  }

  function syncAll() {
    const st = Engine.getState();
    sv('sl-v0',    st.v0,    'val-v0',    'm/s');
    sv('sl-alpha', st.alpha, 'val-alpha', '°');
    sv('sl-y0',    st.y0,    'val-y0',    'm');
    updateStats();
  }

  function sv(slId, val, valId, unit) {
    const sl = document.getElementById(slId);
    if (sl) sl.value = val;
    syncVal(valId, val, unit);
  }

  // Actualiza las estadísticas de vuelo (alcance, h máx, t vuelo)
  function updateStats() {
    const st = Engine.getState();
    setHTML('stat-tmax',  Engine.fmt(st.tMax)  + ' s');
    setHTML('stat-xmax',  Engine.fmt(st.xMax)  + ' m');
    setHTML('stat-ymax',  Engine.fmt(st.yMax)  + ' m');
    setHTML('stat-v0x',   Engine.fmt(st.v0x)   + ' m/s');
    setHTML('stat-v0y',   Engine.fmt(st.v0y)   + ' m/s');
  }

  // Se llama en cada frame desde Renderer
  function updatePanel(sust) {
    setHTML('sust-comp', buildStep(sust.comp));
    setHTML('sust-pos',  buildStep(sust.pos));
    setHTML('sust-vel',  buildStep(sust.vel));
    updateStats();
  }

  function buildStep(s) {
    // Soporte para saltos de línea en sust
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
function togglePause(btn) {
  Engine.togglePause();
  const st = Engine.getState();
  btn.textContent = st.paused ? '▶ Reanudar' : '⏸ Pausar';
}
function resetSim() {
  Engine.init();
  document.getElementById('btn-pause').textContent = '⏸ Pausar';
}
function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => UI.boot());