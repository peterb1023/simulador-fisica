// ============================================================
//  engine.js  —  Motor de física
//  SOLO las fórmulas del profesor:
//    U = m·g·h       (energía potencial)
//    K = ½·m·v²      (energía cinética)
//    E = K + U        (conservación)
//    W_grav = -ΔU    (trabajo de la gravedad)
// ============================================================

const Engine = (() => {

  // ── Estado de la simulación ──────────────────────────────
  let state = {
    masa:    60,      // kg
    g:       9.8,     // m/s²
    h0:      5,       // altura inicial (m)
    friction: false,

    // posición del objeto en la pista: ángulo normalizado [-1, 1]
    // -1 = extremo izquierdo (h=h0), 0 = fondo (h=0), 1 = extremo derecho
    pos:     -1,      // arranca en el extremo izq
    vel:     0,       // velocidad angular en la pista
    dir:     1,       // dirección: +1 derecha, -1 izquierda

    // energías actuales
    Ep:  0,
    Ec:  0,
    Eth: 0,   // térmica (fricción)
    Et:  0,   // total inicial (se conserva si no hay fricción)

    paused:  false,
    started: false,
  };

  // ── Pista tipo parábola: h(pos) = h0 · pos² ─────────────
  // pos ∈ [-1, 1], altura = h0 · pos²
  function trackHeight(pos, h0) {
    return h0 * pos * pos;
  }

  // ── Inicializar / reiniciar ──────────────────────────────
  function init() {
    state.pos    = -1;
    state.vel    = 0;
    state.dir    = 1;
    state.Eth    = 0;
    state.started = true;

    const h = trackHeight(state.pos, state.h0);

    // Energía total inicial = U = m·g·h  (K=0 al soltarse)
    state.Et = state.masa * state.g * state.h0;
    computeEnergies();
  }

  // ── Calcular energías con fórmulas del profesor ──────────
  function computeEnergies() {
    const h = trackHeight(state.pos, state.h0);

    // U = m · g · h
    state.Ep = state.masa * state.g * h;

    // K = E_total - U - E_térmica  (conservación)
    state.Ec = Math.max(0, state.Et - state.Ep - state.Eth);
  }

  // ── Velocidad actual (derivada de K = ½mv²) ─────────────
  // v = sqrt(2·K / m)   — esto enriquece la visualización, no altera fórmulas
  function getVelocity() {
    if (state.masa <= 0) return 0;
    return Math.sqrt(2 * state.Ec / state.masa);
  }

  // ── Paso de simulación ───────────────────────────────────
  function step(dt) {
    if (state.paused || !state.started) return;

    // Aceleración proporcional a la pendiente de la pista
    // (derivada de h = h0·pos² → dh/dpos = 2·h0·pos)
    // a_tangencial ∝ -g · sin(θ) ≈ -g · (2·h0·pos) / pista_escala
    const slope = 2 * state.h0 * state.pos;
    const acc   = -state.g * slope * 0.04; // factor escala para animación fluida

    state.vel += acc * dt;

    // Fricción: disipa energía lentamente
    if (state.friction) {
      const diss  = 0.012 * state.masa * state.g * Math.abs(state.vel) * dt;
      state.Eth   = Math.min(state.Eth + diss, state.Et * 0.98);
      // amortiguación de velocidad
      state.vel  *= (1 - 0.018 * dt * 60);
    }

    state.pos += state.vel * dt;

    // Rebote en los extremos
    const posMax = 1.0;
    if (state.pos >= posMax) {
      state.pos = posMax;
      state.vel = -Math.abs(state.vel) * (state.friction ? 0.97 : 1);
    }
    if (state.pos <= -posMax) {
      state.pos = -posMax;
      state.vel = Math.abs(state.vel) * (state.friction ? 0.97 : 1);
    }

    computeEnergies();
  }

  // ── API pública ──────────────────────────────────────────
  return {
    init,
    step,
    getState:    () => ({ ...state }),
    getVelocity,
    trackHeight,

    setMasa(v)     { state.masa = v;    state.Et = state.masa * state.g * state.h0; init(); },
    setGravity(v)  { state.g = v;       state.Et = state.masa * state.g * state.h0; init(); },
    setAltura(v)   { state.h0 = v;      state.Et = state.masa * state.g * state.h0; init(); },
    setFriction(v) { state.friction = v; state.Eth = 0; computeEnergies(); },
    pause()        { state.paused = true; },
    resume()       { state.paused = false; },
    isPaused()     { return state.paused; },
    reset()        { init(); },
  };

})();
