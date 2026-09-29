// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 04)
// ============================================================

const UI = (() => {

  // ── Arrancar ─────────────────────────────────────────────
  function boot() {
    setTimeout(() => {
      Renderer.init();
      Engine.init();
      bindControls();
      bindTimeline();
      syncAll();
      Renderer.start();
    }, 80);
  }

  // ── Bind de sliders y checkbox ────────────────────────────
  function bindControls() {
    bind('sl-x0', v => { Engine.setX0(+v);   syncVal('val-x0', v, 'm');    resetTimeline(); });
    bind('sl-v0', v => { Engine.setV0(+v);   syncVal('val-v0', v, 'm/s');  resetTimeline(); });
    bind('sl-a',  v => { Engine.setA(+v);    syncVal('val-a',  v, 'm/s²'); resetTimeline(); });
    bindTMax();
  }

  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => fn(e.target.value));
  }

  function bindTMax() {
    const el = document.getElementById('sl-t');
    if (!el) return;
    const apply = () => {
      const t = Math.max(1, Math.floor(+el.value) || 8);
      el.value = t;
      Engine.setTMax(t);
      const tl = document.getElementById('timeline');
      if (tl) tl.max = t;
      const tlMax = document.getElementById('tl-max');
      if (tlMax) tlMax.textContent = t + ' s';
      resetTimeline();
    };
    el.addEventListener('change', apply);
    el.addEventListener('input',  apply);
  }

  // ── Bind del scrubber de línea de tiempo ─────────────────
  function bindTimeline() {
    const tl = document.getElementById('timeline');
    if (!tl) return;

    // Marcar cuando el usuario arrastra (evita que el loop sobreescriba)
    tl.addEventListener('pointerdown', () => { tl._dragging = true; });
    window.addEventListener('pointerup', () => { tl._dragging = false; });

    tl.addEventListener('input', e => {
      // Pausar si estaba corriendo
      if (!Engine.getState().paused) {
        Engine.togglePause();
        syncPlayBtn();
      }
      Engine.seekTo(+e.target.value);
    });
  }

  // ── Sincronizar todos los displays ────────────────────────
  function syncAll() {
    const st = Engine.getState();
    setSlider('sl-x0', st.x0);  syncVal('val-x0', st.x0, 'm');
    setSlider('sl-v0', st.v0);  syncVal('val-v0', st.v0, 'm/s');
    setSlider('sl-a',  st.a);   syncVal('val-a',  st.a,  'm/s²');
    setSlider('sl-t',  st.tMax);

    const tl = document.getElementById('timeline');
    if (tl) { tl.max = st.tMax; tl.value = 0; }
    const tlMax = document.getElementById('tl-max');
    if (tlMax) tlMax.textContent = st.tMax + ' s';
  }

  function resetTimeline() {
    const tl = document.getElementById('timeline');
    if (tl) { tl.max = Engine.getState().tMax; tl.value = 0; }
  }

  // ── Toggle caída libre ────────────────────────────────────
  function toggleCaida(checkbox) {
    Engine.setModoCaida(checkbox.checked);
    const slA  = document.getElementById('sl-a');
    const rowA = document.getElementById('row-a');
    if (slA)  slA.disabled = checkbox.checked;
    if (rowA) rowA.style.opacity = checkbox.checked ? '0.35' : '1';
    resetTimeline();
  }

  // ── Actualizar resolución en vivo ─────────────────────────
  function updatePanel(sust) {
    setHTML('sust-vel',  buildStep(sust.vel));
    setHTML('sust-pos',  buildStep(sust.pos));
    setHTML('sust-vel2', buildStep(sust.vel2));
  }

  function buildStep(s) {
    return `
      <div class="step-formula">${s.formula}</div>
      <div class="step-sust">${s.sust}</div>
      <div class="step-res">${s.res}</div>`;
  }

  // ── Helpers ──────────────────────────────────────────────
  function syncVal(id, val, unit) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<b>${Engine.fmt(+val)}</b> <span>${unit}</span>`;
  }
  function setSlider(id, val) {
    const el = document.getElementById(id); if (el) el.value = val;
  }
  function setHTML(id, html) {
    const el = document.getElementById(id); if (el) el.innerHTML = html;
  }

  return { boot, updatePanel, toggleCaida };

})();

// ── Globales desde HTML ───────────────────────────────────────

function syncPlayBtn() {
  const st  = Engine.getState();
  const btn = document.getElementById('btn-tl-play');
  if (btn) btn.textContent = st.paused ? '▶' : '⏸';
}

function togglePause() {
  const st = Engine.getState();
  if (st.ended) {
    // Sim terminada: reiniciar y reproducir
    Engine.init();
    const tl = document.getElementById('timeline');
    if (tl) tl.value = 0;
  } else {
    Engine.togglePause();
  }
  syncPlayBtn();
}

function resetSim() {
  Engine.init();
  const tl = document.getElementById('timeline');
  if (tl) tl.value = 0;
  syncPlayBtn();
}

function toggleCaida(cb) {
  UI.toggleCaida(cb);
}

function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => UI.boot());
