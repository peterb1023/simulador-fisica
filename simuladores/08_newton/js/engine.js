// ============================================================
//  engine.js  —  Motor de Leyes de Newton (SIM 08)
//  Fórmulas del profesor:
//    ΣF⃗ = 0              — Primera ley (equilibrio)
//    ΣF⃗ = ma⃗            — Segunda ley
//    ΣFx = m·ax          — Componente x
//    ΣFy = m·ay          — Componente y
//    w   = m·g           — Peso
//    fk  = μk·n          — Fricción cinética   [AGREGADA]
//    fs ≤ μs·n           — Fricción estática   [AGREGADA]
//    T   = m(g + ay)     — Tensión en elevador
//    W   = F·s·cosφ      — Trabajo con ángulo
//  Agregadas para la visualización:
//    n   = m·g − Fy      — Normal (cuando F tiene componente vertical)
//    ax  = ΣFx / m       — Despejada de la 2ª ley
// ============================================================

const Engine = (() => {

  const G = 9.8;

  // ── Modos de escenario ────────────────────────────────────
  // 'plano'    : bloque sobre superficie plana con F aplicada
  // 'elevador' : bloque colgando de cuerda, sube/baja
  const MODOS = ['plano', 'elevador'];

  let state = {
    // Parámetros
    m:    5,      // masa (kg)
    F:    30,     // fuerza aplicada (N)
    phi:  0,      // ángulo de F respecto a la horizontal (°)
    muk:  0,      // coeficiente de fricción cinética [AGREGADA]
    modo: 'plano',

    // Fuerzas calculadas
    w:    0,      // peso (N)
    n:    0,      // fuerza normal (N)
    Fx:   0,      // componente x de F
    Fy:   0,      // componente y de F
    fric: 0,      // fuerza de fricción (N)  [AGREGADA]
    sumFx: 0,     // ΣFx
    sumFy: 0,     // ΣFy
    ax:   0,      // aceleración x (m/s²)
    ay:   0,      // aceleración y (m/s²) — en elevador
    T:    0,      // tensión (solo modo elevador)

    // Estado cinemático (para animar el bloque)
    t: 0, tMax: 10, ended: false,
    x:    0,      // posición horizontal (m)
    vx:   0,      // velocidad horizontal (m/s)

    paused:   false,
    fricActiva: false,   // true si hay deslizamiento
  };

  // ── Calcular todas las fuerzas ────────────────────────────
  function calcular() {
    const phi_rad = state.phi * Math.PI / 180;

    // Peso: w = m·g
    state.w  = state.m * G;

    if (state.modo === 'plano') {
      // Componentes de F
      state.Fx = state.F * Math.cos(phi_rad);
      state.Fy = state.F * Math.sin(phi_rad);

      // Normal: ΣFy = 0 en y (superficie) → n = w − Fy
      state.n  = Math.max(0, state.w - state.Fy);

      // Fricción cinética: fk = μk·n  [AGREGADA]
      state.fric = state.muk * state.n;
      state.fricActiva = state.muk > 0 && state.n > 0;

      // ΣFx = Fx − fk = m·ax
      state.sumFx = state.Fx - state.fric;
      state.sumFy = state.n + state.Fy - state.w;   // ≈ 0

      // ax = ΣFx / m
      state.ax = state.sumFx / state.m;
      state.ay = 0;
      state.T  = 0;

    } else {
      // Modo elevador: F es la tensión T que jalamos la cuerda
      // ΣFy = T − w = m·ay  → ay = (T − w) / m
      state.T   = state.F;
      state.sumFy = state.T - state.w;
      state.ay  = state.sumFy / state.m;
      state.ax  = 0;
      state.sumFx = 0;
      state.Fx  = 0;
      state.Fy  = state.F;
      state.n   = 0;
      state.fric = 0;
      state.fricActiva = false;
    }
  }

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    state.t=0;state.ended=false;
    state.x  = 0;
    state.vx = 0;
    calcular();
  }

  // ── Step ─────────────────────────────────────────────────
  function stateAt(t) {
    t=SimCommon.time(t,state.tMax);
    const a=state.modo==='plano'?state.ax:state.ay;
    return {t,x:0.5*a*t*t,vx:a*t};
  }
  function seekTo(t) { Object.assign(state,stateAt(t));state.ended=state.t>=state.tMax; }
  function step(dt) { if(!state.paused&&!state.ended&&Number.isFinite(dt)&&dt>0) seekTo(state.t+dt); }

  // ── Resolución en vivo ────────────────────────────────────
  function getSustitucion() {
    const f = fmt;

    if (state.modo === 'plano') {
      return {
        peso: {
          formula: 'w = m · g',
          sust:    `w = ${f(state.m)} · 9.8`,
          res:     `w = ${f(state.w)} N`,
        },
        normal: {
          formula: 'n = w − Fy = w − F·sen φ',
          sust:    `n = ${f(state.w)} − ${f(state.Fy)}`,
          res:     `n = ${f(state.n)} N`,
        },
        fric: {
          formula: 'fk = μk · n  [AGREGADA]',
          sust:    `fk = ${f(state.muk)} · ${f(state.n)}`,
          res:     `fk = ${f(state.fric)} N`,
          agregada: true,
        },
        segunda: {
          formula: 'ΣFx = m · ax',
          sust:    `${f(state.Fx)} − ${f(state.fric)} = ${f(state.m)} · ax`,
          res:     `ax = ${f(state.ax)} m/s²`,
        },
      };
    } else {
      return {
        peso: {
          formula: 'w = m · g',
          sust:    `w = ${f(state.m)} · 9.8`,
          res:     `w = ${f(state.w)} N`,
        },
        tension: {
          formula: 'T = m(g + ay)',
          sust:    `${f(state.T)} = ${f(state.m)} · (9.8 + ay)`,
          res:     `ay = ${f(state.ay)} m/s²`,
        },
        segunda: {
          formula: 'ΣFy = T − w = m·ay',
          sust:    `${f(state.T)} − ${f(state.w)} = ${f(state.m)} · ${f(state.ay)}`,
          res:     `ΣFy = ${f(state.sumFy)} N`,
        },
        fric: null,
      };
    }
  }

  // ── Setters ───────────────────────────────────────────────
  function setM(v)    { state.m   = +v; init(); }
  function setF(v)    { state.F   = +v; init(); }
  function setPhi(v)  { state.phi = +v; init(); }
  function setMuk(v)  { state.muk = +v; init(); }
  function setModo(v) { state.modo = v; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, seekTo, stateAt, getState, getSustitucion,
    setM, setF, setPhi, setMuk, setModo,
    togglePause, fmt, G,
  };

})();