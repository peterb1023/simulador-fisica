// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 08)
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
    bind('sl-mus',v=>{Engine.setMus(v);syncAll();});
    bind('sl-theta',v=>{Engine.setTheta(v);syncAll();});
    bind('sl-v0',v=>{Engine.setV0(v);syncAll();});
    bind('sl-m',   v => { Engine.setM(+v);   syncVal('val-m',   v, 'kg');   });
    bind('sl-F',   v => { Engine.setF(+v);   syncVal('val-F',   v, 'N');    });
    bind('sl-phi', v => { Engine.setPhi(+v); syncVal('val-phi', v, '°');    });
    bind('sl-muk', v => { Engine.setMuk(+v); syncAll();     });
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => fn(e.target.value));
  }

  function syncAll() {
    const st = Engine.getState();
    sv('sl-mus',st.mus,'val-mus','');sv('sl-theta',st.theta,'val-theta','°');sv('sl-v0',st.v0,'val-v0','m/s');
    sv('sl-m',   st.m,   'val-m',   'kg');
    sv('sl-F',   st.F,   'val-F',   'N');
    sv('sl-phi', st.phi, 'val-phi', '°');
    sv('sl-muk', st.muk, 'val-muk', '');
    updateStats();
  }

  function sv(slId, val, valId, unit) {
    const sl = document.getElementById(slId);
    if (sl) sl.value = val;
    syncVal(valId, val, unit);
  }

  function updateStats() {
    const st = Engine.getState();
    const isPlano = st.modo === 'plano';

    setHTML('stat-w',   Engine.fmt(st.w)    + ' N');
    setHTML('stat-ax',  isPlano
      ? Engine.fmt(st.ax) + ' m/s²'
      : Engine.fmt(st.ay) + ' m/s²');
    setHTML('stat-n',   isPlano ? Engine.fmt(st.n)    + ' N' : '—');
    setHTML('stat-fric',isPlano ? Engine.fmt(st.fric) + ' N' : '—');
    setHTML('stat-sumF',isPlano
      ? Engine.fmt(st.sumFx) + ' N'
      : Engine.fmt(st.sumFy) + ' N');

    // Indicador de equilibrio
    const a   = isPlano ? st.ax : st.ay;
    const eq  = document.getElementById('stat-eq');
    if (eq) {
      if (Math.abs(a) < 0.05) {
        eq.textContent  = '⚖ Equilibrio';
        eq.style.color  = '#3fb950';
      } else {
        eq.textContent  = `ΣF = ma → a = ${Engine.fmt(a)} m/s²`;
        eq.style.color  = '#e6edf3';
      }
    }
  }

  function updatePanel(sust) {
    if (!sust) return;
    setHTML('sust-peso',    buildStep(sust.peso));
    if (sust.normal) setHTML('sust-normal',  buildStep(sust.normal));
    setHTML('sust-fric',sust.fric?buildStep(sust.fric,true):'Sin contacto: no hay fricción.');
    if (sust.tension)setHTML('sust-normal',  buildStep(sust.tension));
    setHTML('sust-segunda', buildStep(sust.segunda));
    updateStats();
  }

  function buildStep(s, agregada) {
    const sustHtml = s.sust.replace(/\n/g, '<br>');
    const badge    = agregada
      ? '<span class="badge-agr-inline">[AGREGADA]</span> '
      : '';
    return `
      <div class="step-formula">${badge}${s.formula}</div>
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
function setModo(modo, btn) {
  Engine.setModo(modo);
  document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Mostrar/ocultar sliders que no aplican en elevador
  const isPlano = modo === 'plano';
  ['row-phi', 'row-muk'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isPlano ? '' : 'none';
  });
  document.getElementById('sust-normal').innerHTML = '—';
  document.getElementById('sust-fric').innerHTML   = '—';
}
function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => UI.boot());