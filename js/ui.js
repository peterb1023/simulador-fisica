// ============================================================
//  ui.js  —  Conecta controles → motor → pantalla
// ============================================================

const UI = (() => {

  // Energía máxima para escalar barras (se recalcula al init)
  let maxE = 1;

  // ── Arrancar todo ────────────────────────────────────────
  function boot() {
    // Pequeño delay para que el CSS/layout termine de calcularse
    setTimeout(() => {
      Renderer.init();
      Engine.init();
      maxE = Engine.getState().Et || 1;
      Renderer.start();
    }, 100);
  }

  // ── Actualizar barras y fórmulas en vivo ─────────────────
  function updateEnergy(s, vel, h) {
    // Actualizar máximo si sube
    if (s.Et > maxE) maxE = s.Et;
    const M = maxE || 1;

    setBar('bar-ep', s.Ep, M);
    setBar('bar-ec', s.Ec, M);
    setBar('bar-th', s.Eth, M);
    setBar('bar-et', s.Et, M);

    setText('v-ep', fmt(s.Ep) + ' J');
    setText('v-ec', fmt(s.Ec) + ' J');
    setText('v-th', fmt(s.Eth) + ' J');
    setText('v-et', fmt(s.Et) + ' J');

    // Badges en el canvas
    setText('speed-badge',  'v = ' + vel.toFixed(2) + ' m/s');
    setText('height-badge', 'h = ' + h.toFixed(1)   + ' m');

    // ── Resolución en vivo ───────────────────────────────
    // U = m · g · h
    setText('fl-ep-s', `U = ${s.masa} · ${s.g} · ${h.toFixed(2)}`);
    setText('fl-ep-r', `U = ${fmt(s.Ep)} J`);

    // K = ½ · m · v²
    setText('fl-ec-s', `K = 0.5 · ${s.masa} · ${vel.toFixed(2)}²`);
    setText('fl-ec-r', `K = ${fmt(s.Ec)} J`);

    // E = K + U
    setText('fl-et-s', `E = ${fmt(s.Ec)} + ${fmt(s.Ep)}`);
    setText('fl-et-r', `E = ${fmt(s.Ec + s.Ep)} J`);
  }

  // ── Helpers ──────────────────────────────────────────────
  function setBar(id, val, max) {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.min(100, (val / max) * 100).toFixed(1) + '%';
  }
  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }
  function fmt(n) { return Math.round(n * 10) / 10; }

  return { boot, updateEnergy };

})();

// ── Funciones globales llamadas desde el HTML ────────────────

function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function pickGravity(g, btn) {
  document.querySelectorAll('.g-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  Engine.setGravity(g);
  resetMaxE();
}

function setMasa(v) {
  document.getElementById('v-masa').textContent = v;
  Engine.setMasa(v);
  resetMaxE();
}

function setAltura(v) {
  document.getElementById('v-h').textContent = parseFloat(v).toFixed(1);
  Engine.setAltura(parseFloat(v));
  resetMaxE();
}

function setFriction(on) {
  document.getElementById('friction-txt').textContent = on ? 'Con fricción' : 'Sin fricción';
  Engine.setFriction(on);
}

function resetSim() {
  Engine.reset();
  resetMaxE();
  if (Engine.isPaused()) {
    Engine.resume();
    document.getElementById('btn-pause').textContent = '⏸ Pausar';
  }
}

function togglePause() {
  const btn = document.getElementById('btn-pause');
  if (Engine.isPaused()) {
    Engine.resume();
    btn.textContent = '⏸ Pausar';
  } else {
    Engine.pause();
    btn.textContent = '▶ Reanudar';
  }
}

function resetMaxE() {
  const s = Engine.getState();
  // Forzar recálculo de escala de barras en el próximo frame
  // maxE vive dentro del closure de UI — se actualiza desde updateEnergy
  // al cambiar parámetros, el Et nuevo ya viene correcto desde Engine
}

// ── Arrancar cuando el DOM esté listo ────────────────────────
document.addEventListener('DOMContentLoaded', () => UI.boot());
