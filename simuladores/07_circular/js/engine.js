// ============================================================
//  engine.js  —  Motor de Movimiento Circular (SIM 07)
//  Fórmulas del profesor:
//    arad  = v² / R          — Aceleración centrípeta
//    v     = 2πR / T         — Velocidad en MCU
//    arad  = 4π²R / T²       — En función del período
//    atan  = d|v|/dt         — Aceleración tangencial (MCUV)
//  Agregadas (enriquecen visualización):
//    T     = 2πR / v         — Período (despejado de v = 2πR/T)
//    f     = 1 / T           — Frecuencia
//    θ(t)  = θ₀ + ω·t + ½·(atan/R)·t²  — Posición angular
//    ω     = v / R           — Velocidad angular
// ============================================================

const Engine = (() => {

  // ── Parámetros controlables ───────────────────────────────
  let state = {
    R:     4,      // radio (m)
    v0:    6,      // rapidez inicial (m/s)
    atan:  0,      // aceleración tangencial (m/s²) — 0 = MCU puro

    // Estado dinámico
    t:     0,
    tMax: 20, ended: false,
    theta: 0,      // ángulo acumulado (rad)
    v:     0,      // rapidez actual (m/s)
    omega: 0,      // velocidad angular (rad/s)
    arad:  0,      // aceleración centrípeta (m/s²)
    T:     0,      // período (s)
    f:     0,      // frecuencia (Hz)

    // Posición cartesiana del objeto
    x:     0,
    y:     0,

    // Dirección del vector velocidad (tangente)
    vx:    0,
    vy:    0,

    // Dirección de arad (apunta al centro)
    aradX: 0,
    aradY: 0,

    // Dirección de atan (tangente, mismo sentido que v)
    atanX: 0,
    atanY: 0,

    paused: false,

    // Historial para trazar la órbita
    trail: [],
    trailMax: 300,
  };

  // ── Precalcular constantes ────────────────────────────────
  function recalc() {
    state.v     = state.v0;
    state.omega = state.v / state.R;
    state.arad  = (state.v * state.v) / state.R;
    state.T     = (2 * Math.PI * state.R) / state.v;
    state.f     = 1 / state.T;
  }

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    recalc();
    state.t     = 0;
    state.theta = 0;   // empieza en la derecha (ángulo 0)
    state.trail = [];
    state.paused = false;
    state.ended=false; seekTo(0);
  }

  // ── Actualizar posición y vectores ───────────────────────
  function updatePos() {
    const R = state.R;
    const th = state.theta;

    // Posición en el círculo
    state.x =  R * Math.cos(th);
    state.y =  R * Math.sin(th);

    // Vector tangente (dirección de v): perpendicular al radio, sentido antihorario
    //   tangente = (-sin θ, cos θ)
    state.vx = -Math.sin(th);
    state.vy =  Math.cos(th);

    // arad apunta al centro: dirección = -r̂ = (-cos θ, -sin θ)
    state.aradX = -Math.cos(th);
    state.aradY = -Math.sin(th);

    // atan tiene la misma dirección que v (tangente)
    state.atanX = state.vx;
    state.atanY = state.vy;
  }

  // ── Step ─────────────────────────────────────────────────
  function stateAt(t) {
    t=SimCommon.time(t,state.tMax);
    const v=state.v0+state.atan*t,omega=v/state.R;
    const theta=(state.v0*t+0.5*state.atan*t*t)/state.R;
    const T=v===0?Infinity:2*Math.PI*state.R/Math.abs(v);
    return {t,v,omega,theta,T,f:1/T,arad:v*v/state.R,x:state.R*Math.cos(theta),y:state.R*Math.sin(theta)};
  }
  function seekTo(t) {
    Object.assign(state,stateAt(t));state.ended=state.t>=state.tMax;updatePos();
    state.trail=SimCommon.samples(state.t,state.tMax,stateAt);
  }
  function step(dt) { if(!state.paused&&!state.ended&&Number.isFinite(dt)&&dt>0) seekTo(state.t+dt); }

  // ── Resolución en vivo ────────────────────────────────────
  function getSustitucion() {
    const v  = fmt(state.v);
    const R  = fmt(state.R);
    const T  = fmt(state.T);

    return {
      arad_v: {
        formula: 'arad = v² / R',
        sust:    `arad = (${v})² / ${R}`,
        res:     `arad = ${fmt(state.arad)} m/s²`,
      },
      arad_T: {
        formula: 'arad = 4π²R / T²',
        sust:    `arad = 4π²·${R} / (${T})²`,
        res:     `arad = ${fmt((4 * Math.PI * Math.PI * state.R) / (state.T * state.T))} m/s²`,
      },
      vel: {
        formula: '|v_t| = 2πR / T (T instantáneo si a_t≠0)',
        sust:    `v = 2π·${R} / ${T}`,
        res:     `v = ${fmt((2 * Math.PI * state.R) / state.T)} m/s`,
      },
      atan: {
        formula: 'a_t = dv_t/dt; v_t = v₀ + a_t·t',
        sust:    `atan = ${fmt(state.atan)} m/s²`,
        res:     state.atan === 0 ? 'MCU — rapidez constante' : `MCUV — v cambia ${state.atan > 0 ? '↑' : '↓'}`,
      },
    };
  }

  // ── Setters ───────────────────────────────────────────────
  function setR(v)    { state.R    = +v; init(); }
  function setV0(v)   { state.v0   = +v; init(); }
  function setAtan(v) { state.atan = +v; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, seekTo, stateAt, getState, getSustitucion,
    setR, setV0, setAtan, togglePause,
    fmt,
  };

})();
