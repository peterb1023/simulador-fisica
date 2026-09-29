// ============================================================
//  engine.js  —  Motor de Cinemática Rotacional (SIM 11)
//  Fórmulas del profesor:
//    s      = r · θ           — Arco y ángulo
//    ω      = Δθ / Δt         — Velocidad angular
//    α      = Δω / Δt         — Aceleración angular
//    v      = r · ω           — Rapidez lineal (tangencial)
//    a_tan  = r · α           — Aceleración tangencial
//    a_rad  = ω² · r          — Aceleración centrípeta angular
//  Ecuaciones con α constante (análogas a MRUA):
//    ω  = ω₀ + α·t
//    θ  = θ₀ + ω₀·t + ½·α·t²
//    ω² = ω₀² + 2·α·(θ − θ₀)
//    θ  = θ₀ + ½·(ω₀ + ω)·t
// ============================================================

const Engine = (() => {

  // ── Estado ───────────────────────────────────────────────
  let state = {
    // Parámetros (controlados por sliders)
    R:     1.0,    // radio del disco (m)
    alpha: 2.0,    // aceleración angular (rad/s²)
    w0:    0.0,    // velocidad angular inicial (rad/s)

    // Variables calculadas
    theta: 0,      // ángulo acumulado (rad)
    omega: 0,      // velocidad angular actual (rad/s)
    t:     0,      // tiempo (s)

    // Derivadas para el punto en el borde
    s:     0,      // arco recorrido (m)
    v_tan: 0,      // velocidad tangencial (m/s)
    a_tan: 0,      // aceleración tangencial (m/s²)
    a_rad: 0,      // aceleración centrípeta (m/s²)

    // Ángulo del punto marcador en el borde del disco
    punto_theta: 0,

    paused: false,
  };

  // ── Calcular magnitudes derivadas ────────────────────────
  function calcular() {
    // v = r · ω
    state.v_tan = state.R * state.omega;

    // a_tan = r · α
    state.a_tan = state.R * state.alpha;

    // a_rad = ω² · r
    state.a_rad = state.omega * state.omega * state.R;

    // s = r · θ  (arco desde el inicio)
    state.s = state.R * state.theta;
  }

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    state.theta       = 0;
    state.omega       = state.w0;
    state.t           = 0;
    state.punto_theta = 0;
    calcular();
  }

  // ── Step ─────────────────────────────────────────────────
  // dt en segundos (1/60 en el loop normal)
  function step(dt) {
    if (state.paused) return;

    if(!Number.isFinite(dt)||dt<=0)return;
    state.t += dt;
    state.omega = state.w0 + state.alpha * state.t;
    state.theta = state.w0 * state.t + 0.5 * state.alpha * state.t ** 2;
    state.punto_theta = state.theta;

    calcular();
  }

  // ── Resolución en vivo ────────────────────────────────────
  function getSustitucion() {
    const f = fmt;
    return {
      arco: {
        formula: 's = r · θ',
        sust:    `s = ${f(state.R)} · ${f(state.theta)}`,
        res:     `s = ${f(state.s)} m`,
      },
      omega: {
        formula: 'ω = ω₀ + α · t',
        sust:    `ω = ${f(state.w0)} + ${f(state.alpha)} · ${f(state.t)}`,
        res:     `ω = ${f(state.omega)} rad/s`,
      },
      vtan: {
        formula: 'v = r · ω',
        sust:    `v = ${f(state.R)} · ${f(state.omega)}`,
        res:     `v = ${f(state.v_tan)} m/s`,
      },
      atan: {
        formula: 'a_tan = r · α',
        sust:    `a_tan = ${f(state.R)} · ${f(state.alpha)}`,
        res:     `a_tan = ${f(state.a_tan)} m/s²`,
      },
      arad: {
        formula: 'a_rad = ω² · r',
        sust:    `a_rad = ${f(state.omega)}² · ${f(state.R)}`,
        res:     `a_rad = ${f(state.a_rad)} m/s²`,
      },
      theta: {
        formula: 'θ = ω₀·t + ½·α·t²',
        sust:    `θ = ${f(state.w0)}·${f(state.t)} + ½·${f(state.alpha)}·${f(state.t)}²`,
        res:     `θ = ${f(state.theta)} rad`,
      },
    };
  }

  // ── Setters ───────────────────────────────────────────────
  function setR(v)     { state.R     = +v; calcular(); }
  function setAlpha(v) { state.alpha = +v; init(); }
  function setW0(v)    { state.w0    = +v; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, getState, getSustitucion,
    setR, setAlpha, setW0,
    togglePause, fmt,
  };

})();