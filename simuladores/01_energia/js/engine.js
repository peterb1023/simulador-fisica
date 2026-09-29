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
    vel:     0,       // d(pos)/dt; x = 5·pos metros
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

    // Una sola velocidad: ds/dt = sqrt(5² + (dh/dpos)²)·dpos/dt.
    const metric = 25 + (2 * state.h0 * state.pos) ** 2;
    state.Ec = 0.5 * state.masa * metric * state.vel ** 2;
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

    if (!Number.isFinite(dt) || dt <= 0) return;
    // Pista física x=5q, y=h0·q². RK4 con subpasos de hasta 1/240 s.
    // Rozamiento viscoso tangencial: F=-m·gamma·v; calor = integral m·gamma·v² dt.
    const gamma = state.friction ? 0.35 : 0;
    const deriv = ([q, u, heat]) => {
      const hp = 2 * state.h0 * q, metric = 25 + hp * hp;
      return [u, (-state.g * hp - hp * 2 * state.h0 * u * u) / metric - gamma * u,
        state.masa * gamma * metric * u * u];
    };
    const n = Math.ceil(dt * 240), h = dt / n;
    let y = [state.pos, state.vel, state.Eth];
    for (let i = 0; i < n; i++) {
      const k1 = deriv(y);
      const k2 = deriv(y.map((v,j) => v + h*k1[j]/2));
      const k3 = deriv(y.map((v,j) => v + h*k2[j]/2));
      const k4 = deriv(y.map((v,j) => v + h*k3[j]));
      y = y.map((v,j) => v + h*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);
    }
    [state.pos, state.vel, state.Eth] = y;
    state.dir = Math.sign(state.vel) || state.dir;

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
    setFriction(v) { state.friction = !!v; init(); },
    pause()        { state.paused = true; },
    resume()       { state.paused = false; },
    isPaused()     { return state.paused; },
    reset()        { init(); },
  };

})();
