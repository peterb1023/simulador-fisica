// ============================================================
//  ui.js  —  Controles y resolución en vivo (SIM 09)
// ============================================================

const UI = (() => {

  // ── Arrancar ─────────────────────────────────────────────
  function boot() {
    setTimeout(() => {
      Renderer.init();
      setModoUI('fuerza');
      Renderer.start();
    }, 100);
  }

  // ── Cambiar modo: fuerza / resorte ───────────────────────
  function setModoUI(modo) {
    Engine.setModo(modo);

    // Highlight de botones de modo
    document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
    const active = document.getElementById('btn-modo-' + modo);
    if (active) active.classList.add('active');

    // Mostrar/ocultar secciones de sliders
    const secFuerza  = document.getElementById('sec-fuerza');
    const secResorte = document.getElementById('sec-resorte');
    if (secFuerza)  secFuerza.style.display  = modo === 'fuerza'  ? '' : 'none';
    if (secResorte) secResorte.style.display = modo === 'resorte' ? '' : 'none';
  }

  // ── Actualizar panel derecho ─────────────────────────────
  function updatePanel(sus) {
    if (!sus) return;

    // Bloque componente
    setText('fl-comp-f',   sus.comp.formula);
    setText('fl-comp-s',   sus.comp.sust);
    setText('fl-comp-r',   sus.comp.res);

    // Bloque trabajo
    setText('fl-work-f',   sus.work.formula);
    setText('fl-work-s',   sus.work.sust);
    setText('fl-work-r',   sus.work.res);

    // Bloque energía
    setText('fl-ener-f',   sus.energia.formula);
    setText('fl-ener-s',   sus.energia.sust);
    setText('fl-ener-r',   sus.energia.res);

    // Signos badge
    const st = Engine.getState();
    const W  = st.calc.W;
    const badge = document.getElementById('signo-badge');
    if (badge) {
      if (st.modo === 'resorte') {
        badge.textContent = 'W_ext = ΔU; ΔK = 0 (cuasiestático)';
        badge.className = 'signo-badge pos';
      } else if (W > 0.01) {
        badge.textContent = 'W > 0 — objeto acelera';
        badge.className = 'signo-badge pos';
      } else if (W < -0.01) {
        badge.textContent = 'W < 0 — objeto desacelera';
        badge.className = 'signo-badge neg';
      } else {
        badge.textContent = 'W = 0 — sin transferencia';
        badge.className = 'signo-badge zer';
      }
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  return { boot, updatePanel, setModoUI };

})();

// ── Funciones globales llamadas desde HTML ──────────────────

function setModo(modo) {
  UI.setModoUI(modo);
}

function setF(v) {
  document.getElementById('v-F').textContent = v + ' N';
  Engine.setF(v);
}
function setPhi(v) {
  document.getElementById('v-phi').textContent = v + '°';
  Engine.setPhi(v);
}
function setS(v) {
  document.getElementById('v-s').textContent = v + ' m';
  Engine.setS(v);
}
function setM(v) {
  document.getElementById('v-m').textContent = v + ' kg';
  Engine.setM(v);
}
function setV0(v) {
  document.getElementById('v-v0').textContent = v + ' m/s';
  Engine.setV0(v);
}
function setK(v) {
  document.getElementById('v-k').textContent = v + ' N/m';
  Engine.setK(v);
}
function setX(v) {
  document.getElementById('v-x').textContent = parseFloat(v).toFixed(1) + ' m';
  Engine.setX(v);
}

function resetSim() {
  Engine.init();
  const btn = document.getElementById('btn-pause');
  if (btn) btn.textContent = '⏸ Pausar';
}

function togglePause() {
  Engine.togglePause();
  const btn = document.getElementById('btn-pause');
  if (!btn) return;
  btn.textContent = Engine.getState().paused ? '▶ Reanudar' : '⏸ Pausar';
}

function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => UI.boot());