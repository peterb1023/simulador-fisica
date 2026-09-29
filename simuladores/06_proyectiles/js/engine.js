// ============================================================
//  engine.js  —  Motor de Proyectiles (SIM 06)
//  Fórmulas del profesor:
//    v0x = v0·cos(α)
//    v0y = v0·sen(α)
//    x   = (v0·cos α)·t
//    y   = y0 + v0y·t − ½·g·t²
//    vx  = v0x  (constante)
//    vy  = v0·sen(α) − g·t
//    y   = tan(α)·x − [g/(2·v0²·cos²α)]·x²   ← ecuación de trayectoria
// ============================================================

const Engine = (() => {

  const G = 9.8;

  let state = {
    // Parámetros
    v0:    20,     // rapidez inicial (m/s)
    alpha: 45,     // ángulo de lanzamiento (grados)
    y0:    0,      // altura inicial (m)

    // Componentes calculadas
    v0x:   0,
    v0y:   0,

    // Estado dinámico
    t:      0,
    x:      0,
    y:      0,
    vx:     0,
    vy:     0,
    tMax:   0,      // tiempo de vuelo total
    xMax:   0,      // alcance máximo
    yMax:   0,      // altura máxima
    paused: false,
    ended:  false,

    // Historial de trayectoria
    trail: [],     // [{x, y}, ...]
  };

  // ── Precalcular constantes de vuelo ──────────────────────
  function recalc() {
    const a   = state.alpha * Math.PI / 180;
    state.v0x = state.v0 * Math.cos(a);
    state.v0y = state.v0 * Math.sin(a);

    // Tiempo de vuelo: y0 + v0y·t - ½g·t² = 0  → cuadrática
    // ½g·t² - v0y·t - y0 = 0
    const disc = state.v0y * state.v0y + 2 * G * state.y0;
    state.tMax = (state.v0y + Math.sqrt(disc)) / G;

    // Alcance
    state.xMax = state.v0x * state.tMax;

    // Altura máxima: t_top = v0y/g
    const t_top = Math.max(0, state.v0y / G);
    state.yMax  = state.y0 + state.v0y * t_top - 0.5 * G * t_top * t_top;
  }

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    recalc();
    state.t      = 0;
    state.x      = 0;
    state.y      = state.y0;
    state.vx     = state.v0x;
    state.vy     = state.v0y;
    state.paused = false;
    state.ended  = false;
    state.trail  = [{ x: 0, y: state.y0 }];
  }

  // ── Step ─────────────────────────────────────────────────
  function stateAt(t) {
    t=SimCommon.time(t,state.tMax);
    return {t,x:state.v0x*t,y:Math.max(0,state.y0+state.v0y*t-0.5*G*t*t),vx:state.v0x,vy:state.v0y-G*t};
  }
  function seekTo(t) {
    Object.assign(state,stateAt(t));state.ended=state.t>=state.tMax;
    state.trail=SimCommon.samples(state.t,state.tMax,stateAt);
  }
  function step(dt) { if(!state.paused&&!state.ended&&Number.isFinite(dt)&&dt>0) seekTo(state.t+dt); }

  // ── Puntos de la trayectoria teórica (para dibujar la curva completa) ──
  function getTrajectoryPoints(n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * state.tMax;
      pts.push({
        x: state.v0x * t,
        y: state.y0 + state.v0y * t - 0.5 * G * t * t,
      });
    }
    return pts;
  }

  // ── Ecuación de trayectoria y(x) — fórmula del profesor ──
  function yOfX(x) {
    const a = state.alpha * Math.PI / 180;
    const cosA = Math.cos(a);
    if (Math.abs(state.v0 * cosA) < 1e-9) return null;
    return Math.tan(a) * x - (G / (2 * state.v0 * state.v0 * cosA * cosA)) * x * x + state.y0;
  }

  // ── Resolución en vivo ────────────────────────────────────
  function getSustitucion() {
    const a   = state.alpha * Math.PI / 180;
    const t   = fmt(state.t);
    const cosA = fmt(Math.cos(a));
    const sinA = fmt(Math.sin(a));

    return {
      comp: {
        formula: 'v₀x = v₀·cos α  /  v₀y = v₀·sen α',
        sust:    `v₀x = ${fmt(state.v0)}·cos(${state.alpha}°) = ${fmt(state.v0x)} m/s\nv₀y = ${fmt(state.v0)}·sen(${state.alpha}°) = ${fmt(state.v0y)} m/s`,
        res:     `v₀ = (${fmt(state.v0x)}, ${fmt(state.v0y)}) m/s`,
      },
      pos: {
        formula: 'x = v₀x·t  /  y = y₀ + v₀y·t − ½g·t²',
        sust:    `x = ${fmt(state.v0x)}·${t} = ${fmt(state.x)} m\ny = ${fmt(state.y0)} + ${fmt(state.v0y)}·${t} − ½·9.8·${t}²`,
        res:     `(${fmt(state.x)}, ${fmt(state.y)}) m`,
      },
      vel: {
        formula: 'vx = v₀x (cte)  /  vy = v₀y − g·t',
        sust:    `vx = ${fmt(state.vx)} m/s\nvy = ${fmt(state.v0y)} − 9.8·${t}`,
        res:     `vy = ${fmt(state.vy)} m/s`,
      },
    };
  }

  // ── Setters ───────────────────────────────────────────────
  function setV0(v)    { state.v0    = +v; init(); }
  function setAlpha(v) { state.alpha = +v; init(); }
  function setY0(v)    { state.y0    = +v; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, seekTo, stateAt, getState, getSustitucion,
    setV0, setAlpha, setY0, togglePause,
    getTrajectoryPoints, yOfX,
    G, fmt,
  };

})();