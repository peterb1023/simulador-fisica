// ============================================================
//  engine.js  —  Motor de Trabajo (SIM 09)
//  Fórmulas del profesor:
//    W = F·s               — fuerza paralela
//    W = F·s·cosφ          — con ángulo
//    W = F⃗·s⃗              — producto punto
//    W_tot = ΔK = K₂ − K₁ — teorema trabajo-energía
//    [AGREGADA] W = ½kx₂² − ½kx₁²  — resorte (Hooke)
// ============================================================

const Engine = (() => {

  // ── Estado ─────────────────────────────────────────────
  let state = {
    // Parámetros del usuario
    F:    40,    // Fuerza (N)
    phi:  30,    // Ángulo entre F y s (grados)
    s:    10,    // Desplazamiento (m)
    m:    5,     // Masa (kg) para teorema trabajo-energía
    v0:   3,     // Velocidad inicial (m/s)
    k:    50,    // Constante resorte (N/m) [AGREGADA]
    x:    1.0,   // Elongación resorte (m) [AGREGADA]

    // Modo actual: 'fuerza' | 'resorte'
    modo: 'fuerza',

    // Animación
    t:      0,
    sActual: 0,   // desplazamiento actual en la animación (0 → s)
    paused: false,
    ended:  false,
    speed:  1,    // multiplicador de velocidad

    // Historial para gráfica F(s)
    histFs: [],   // [{s, Fs}] componente de F en dirección de s
  };

  // ── Cálculos derivados ───────────────────────────────
  function calcular() {
    const phiRad = state.phi * Math.PI / 180;
    const cosPhi = Math.cos(phiRad);

    if (state.modo === 'fuerza') {
      const Fcomp = state.F * cosPhi;           // componente en dirección s
      const W     = state.F * state.s * cosPhi; // W = F·s·cosφ
      const K1    = 0.5 * state.m * state.v0 * state.v0;
      const Wtot  = W;
      const K2    = K1 + Wtot;
      const v2    = K2 >= 0 ? Math.sqrt(2 * K2 / state.m) : 0;

      return { Fcomp, W, K1, K2: Math.max(0, K2), v2, phiRad, cosPhi };

    } else {
      // Resorte: x1 = 0, x2 = state.x
      const W  = 0.5 * state.k * state.x * state.x;
      const K1 = 0, K2 = 0, v2 = 0; // Estiramiento cuasiestático: ΔK=0, Wext=ΔU.

      return { Fcomp: state.k * state.x, W, K1, K2, v2, phiRad: 0, cosPhi: 1 };
    }
  }

  // ── Init / Reset ─────────────────────────────────────
  function init() {
    state.t       = 0;
    state.sActual = 0;
    state.paused  = false;
    state.ended   = false;
    state.histFs  = [{ s: 0, Fs: 0 }];
  }

  // ── Step ─────────────────────────────────────────────
  function step(dt) {
    if (state.paused || state.ended) return;

    const maxS = state.modo === 'fuerza' ? state.s : state.x;
    const rate = (maxS / 4) * state.speed; // recorre el desplazamiento en ~4s

    state.sActual += dt * rate;
    if (state.sActual >= maxS) {
      state.sActual = maxS;
      state.ended   = true;
    }

    // Historial para gráfica F(s)
    let Fs;
    if (state.modo === 'fuerza') {
      Fs = state.F * Math.cos(state.phi * Math.PI / 180);
    } else {
      Fs = state.k * state.sActual; // F = kx
    }
    state.histFs.push({ s: state.sActual, Fs });
  }

  // ── Resolución simbólica ─────────────────────────────
  function getSustitucion() {
    const c = calcular();
    const phiDeg = fmt(state.phi);
    const cosFmt = fmt(c.cosPhi);

    if (state.modo === 'fuerza') {
      return {
        comp: {
          formula: 'F_s = F·cosφ',
          sust:    `F_s = ${fmt(state.F)}·cos(${phiDeg}°) = ${fmt(state.F)}·${cosFmt}`,
          res:     `F_s = ${fmt(c.Fcomp)} N`,
        },
        work: {
          formula: 'W = F·s·cosφ',
          sust:    `W = ${fmt(state.F)}·${fmt(state.s)}·${cosFmt}`,
          res:     `W = ${fmt(c.W)} J`,
        },
        energia: {
          formula: 'W_tot = K₂ − K₁',
          sust:    `${fmt(c.W)} = ½·${fmt(state.m)}·v² − ½·${fmt(state.m)}·${fmt(state.v0)}²`,
          res:     `v₂ = ${fmt(c.v2)} m/s`,
        },
      };
    } else {
      return {
        comp: {
          formula: 'F_ext = k·x; F_resorte = −k·x',
          sust:    `F = ${fmt(state.k)}·${fmt(state.x)}`,
          res:     `F = ${fmt(state.k * state.x)} N`,
        },
        work: {
          formula: 'W_ext = ΔU = ½·k·x²',
          sust:    `W = ½·${fmt(state.k)}·${fmt(state.x)}²`,
          res:     `W = ${fmt(c.W)} J  [AGREGADA]`,
        },
        energia: {
          formula: 'W_resorte = −ΔU; W_ext + W_resorte = 0',
          sust: `ΔU = ${fmt(c.W)} J; ΔK = 0 (cuasiestático)`,
          res: `W_resorte = ${fmt(-c.W)} J`,
        },
      };
    }
  }

  // ── Setters ──────────────────────────────────────────
  function setF(v)    { state.F   = +v; init(); }
  function setPhi(v)  { state.phi = +v; init(); }
  function setS(v)    { state.s   = +v; init(); }
  function setM(v)    { state.m   = +v; init(); }
  function setV0(v)   { state.v0  = +v; init(); }
  function setK(v)    { state.k   = +v; init(); }
  function setX(v)    { state.x   = +v; init(); }
  function setModo(m) { state.modo = m; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return { ...state, calc: calcular() }; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, getState, getSustitucion,
    setF, setPhi, setS, setM, setV0, setK, setX, setModo,
    togglePause, calcular, fmt,
  };

})();