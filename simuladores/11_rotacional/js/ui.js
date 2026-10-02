// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 11)
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
    bind('sl-R',     v => { Engine.setR(+v);     syncVal('val-R',     v, 'm');      });
    bind('sl-alpha', v => { Engine.setAlpha(+v); syncVal('val-alpha', v, 'rad/s²'); });
    bind('sl-w0',    v => { Engine.setW0(+v);    syncVal('val-w0',    v, 'rad/s');  });
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) SimInputs.bind(el,fn);
  }

  function syncAll() {
    const st = Engine.getState();
    sv('sl-R',     st.R,     'val-R',     'm');
    sv('sl-alpha', st.alpha, 'val-alpha', 'rad/s²');
    sv('sl-w0',    st.w0,    'val-w0',    'rad/s');
    updateStats();
  }

  function sv(slId, val, valId, unit) {
    const sl = document.getElementById(slId);
    if (sl) sl.value = val;
    SimInputs.sync(slId,val);
    syncVal(valId, val, unit);
  }

  function updateStats() {
    const st = Engine.getState();
    setHTML('stat-omega', Engine.fmt(st.omega) + ' rad/s');
    setHTML('stat-theta', Engine.fmt(st.theta) + ' rad');
    setHTML('stat-vtan',  Engine.fmt(st.v_tan) + ' m/s');
    setHTML('stat-atan',  Engine.fmt(st.a_tan) + ' m/s²');
    setHTML('stat-arad',  Engine.fmt(st.a_rad) + ' m/s²');
    setHTML('stat-s',     Engine.fmt(st.s)     + ' m');

    // Badge de régimen
    const badge = document.getElementById('stat-regime');
    if (badge) {
      if (Math.abs(st.alpha) < 0.05) {
        badge.textContent = 'MCU — α = 0';
        badge.style.color = '#58a6ff';
      } else {
        badge.textContent = `MCUV — α = ${Engine.fmt(st.alpha)} rad/s²`;
        badge.style.color = '#e3b341';
      }
    }
  }

  function updatePanel(sust) {
    if (!sust) return;
    setHTML('sust-omega', buildStep(sust.omega));
    setHTML('sust-theta', buildStep(sust.theta));
    setHTML('sust-vtan',  buildStep(sust.vtan));
    setHTML('sust-atan',  buildStep(sust.atan));
    setHTML('sust-arad',  buildStep(sust.arad));
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