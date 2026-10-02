// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 07)
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
    bind('sl-R',    v => { Engine.setR(+v);    syncVal('val-R',    v, 'm');    });
    bind('sl-v0',   v => { Engine.setV0(+v);   syncVal('val-v0',   v, 'm/s'); });
    bind('sl-atan', v => { Engine.setAtan(+v); syncVal('val-atan', v, 'm/s²'); });
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) SimInputs.bind(el,fn);
  }

  function syncAll() {
    const st = Engine.getState();
    sv('sl-R',    st.R,    'val-R',    'm');
    sv('sl-v0',   st.v0,   'val-v0',   'm/s');
    sv('sl-atan', st.atan, 'val-atan', 'm/s²');
  }

  function sv(slId, val, valId, unit) {
    const sl = document.getElementById(slId);
    if (sl) sl.value = val;
    SimInputs.sync(slId,val);
    syncVal(valId, val, unit);
  }

  // Llamada en cada frame desde Renderer
  function updatePanel(sust) {
    setHTML('sust-arad-v', buildStep(sust.arad_v));
    setHTML('sust-arad-T', buildStep(sust.arad_T));
    setHTML('sust-vel',    buildStep(sust.vel));
    setHTML('sust-atan',   buildStep(sust.atan));
    updateStats();
  }

  function updateStats() {
    const st = Engine.getState();
    setHTML('stat-T',    Engine.fmt(st.T)     + ' s');
    setHTML('stat-f',    Engine.fmt(st.f)     + ' Hz');
    setHTML('stat-v',    Engine.fmt(st.v)     + ' m/s');
    setHTML('stat-omega',Engine.fmt(st.omega) + ' rad/s');
    setHTML('stat-arad', Engine.fmt(st.arad)  + ' m/s²');
    setHTML('stat-modo', st.atan === 0 ? 'MCU' : 'MCUV');

    // Colorear el modo
    const modoEl = document.getElementById('stat-modo');
    if (modoEl) {
      modoEl.style.color = st.atan === 0 ? 'var(--accent)' : '#3fb950';
    }
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
