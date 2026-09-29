// ============================================================
//  engine.js  —  Motor de Cinemática 1D (SIM 04)
//  Fórmulas del profesor:
//    v_med = Δx/Δt
//    a_med = Δvx/Δt
//    vx    = v0x + ax·t
//    x     = x0 + v0x·t + ½·ax·t²
//    vx²   = v0x² + 2·ax·(x−x0)
//    x−x0  = ½·(v0x+vx)·t
//    g     = 9.8 m/s²
// ============================================================

const Engine = (() => {

  const G = 9.8; // m/s²

  // ── Estado interno ───────────────────────────────────────
  let state = {
    // Parámetros (controlados por el usuario)
    x0:    0,     // posición inicial (m)
    v0:    5,     // velocidad inicial (m/s)
    a:     -2,    // aceleración (m/s²)
    tMax:  8,     // tiempo total de simulación (s)
    modoCaida: false,

    // Estado dinámico (actualizado cada frame)
    t:     0,     // tiempo actual
    x:     0,     // posición actual
    v:     0,     // velocidad actual
    paused: false,
    ended:  false,

    // Historial para graficar
    histX: [],    // [{t, x}, ...]
    histV: [],    // [{t, v}, ...]
  };

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    state.t      = 0;
    state.x      = state.x0;
    state.v      = state.v0;
    state.paused = false;
    state.ended  = false;
    state.histX  = [{ t: 0, x: state.x0 }];
    state.histV  = [{ t: 0, v: state.v0  }];
  }

  // ── Step (llamado cada frame con dt en segundos) ──────────
  function step(dt) {
    if (state.paused || state.ended || !Number.isFinite(dt) || dt<=0) return;
    seekTo(state.t + dt);
  }

  // ── Calcular posición en cualquier t (sin mutar estado) ──
  function xAt(t) {
    const a = state.modoCaida ? G : state.a;
    return state.x0 + state.v0 * t + 0.5 * a * t * t;
  }
  function vAt(t) {
    const a = state.modoCaida ? G : state.a;
    return state.v0 + a * t;
  }

  // ── Resolución simbólica en vivo ─────────────────────────
  function getSustitucion() {
    const a  = state.modoCaida ? G : state.a;
    const t  = state.t;
    const x  = state.x;
    const v  = state.v;
    return {
      // vx = v0 + a·t
      vel:  { formula: 'vx = v₀ + a·t',
              sust:    `vx = ${fmt(state.v0)} + (${fmt(a)})·${fmt(t)}`,
              res:     `vx = ${fmt(v)} m/s` },
      // x = x0 + v0·t + ½·a·t²
      pos:  { formula: 'x = x₀ + v₀·t + ½·a·t²',
              sust:    `x = ${fmt(state.x0)} + ${fmt(state.v0)}·${fmt(t)} + ½·(${fmt(a)})·${fmt(t)}²`,
              res:     `x = ${fmt(x)} m` },
      // vx² = v0² + 2·a·(x-x0)
      vel2: { formula: 'vx² = v₀² + 2·a·(x−x₀)',
              sust:    `vx² = ${fmt(state.v0)}² + 2·(${fmt(a)})·(${fmt(x)}−${fmt(state.x0)})`,
              res:     `vx² = ${fmt(v*v)} → vx = ${fmt(Math.abs(v))} m/s` },
    };
  }

  // ── Setters ──────────────────────────────────────────────
  // ── Seek: mover al tiempo t sin animar ──────────────────
  function seekTo(targetT) {
    const t=SimCommon.time(targetT,state.tMax);state.t=t;state.ended=t>=state.tMax;
    state.x=xAt(t);state.v=vAt(t);
    state.histX=SimCommon.samples(t,state.tMax,ti=>({t:ti,x:xAt(ti)}));
    state.histV=SimCommon.samples(t,state.tMax,ti=>({t:ti,v:vAt(ti)}));
  }

  function setX0(v)         { state.x0 = SimCommon.number(v);         init(); }
  function setV0(v)         { state.v0 = SimCommon.number(v);          init(); }
  function setA(v)          { state.a  = SimCommon.number(v);          init(); }
  function setTMax(v)       { state.tMax = SimCommon.number(v,Number.EPSILON);        init(); }
  function setModoCaida(b)  { state.modoCaida = b;   init(); }
  function togglePause()    { state.paused = !state.paused; }
  function getState()       { return { ...state }; }
  function fmt(n)           { return Math.round(n * 100) / 100; }

  // Iniciar con valores por defecto
  init();

  return {
    init, step, seekTo, getState, getSustitucion,
    setX0, setV0, setA, setTMax, setModoCaida,
    togglePause,
    xAt, vAt,
    G,
    fmt,
  };

})();