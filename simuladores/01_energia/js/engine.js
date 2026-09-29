// ============================================================
//  engine.js  —  Motor de física
//  SOLO las fórmulas del profesor:
//    U = m·g·h       (energía potencial)
//    K = ½·m·v²      (energía cinética)
//    E = K + U        (conservación)
//    W_grav = -ΔU    (trabajo de la gravedad)
// ============================================================

const Engine = (() => {

  let checkpoints = [];
  // ── Estado de la simulación ──────────────────────────────
  let state = {
    masa:    60,      // kg
    g:       9.8,     // m/s²
    h0:      5,       // altura inicial (m)
    friction: false,

    // posición del objeto en la pista: ángulo normalizado [-1, 1]
    // -1 = extremo izquierdo (h=h0), 0 = fondo (h=0), 1 = extremo derecho
    t:0, tMax:20, ended:false,
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
    checkpoints=[[-1,0,0]];
    for(let i=1;i<=state.tMax*240;i++) checkpoints.push(integrate(checkpoints[i-1],1/240));
    seekTo(0);
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
  function integrate(initial, dt) {
    // Pista física x=5q, y=h0·q². RK4 con subpasos de hasta 1/240 s.
    // Rozamiento viscoso tangencial: F=-m·gamma·v; calor = integral m·gamma·v² dt.
    const gamma = state.friction ? 0.35 : 0;
    const deriv = ([q, u, heat]) => {
      const hp = 2 * state.h0 * q, metric = 25 + hp * hp;
      return [u, (-state.g * hp - hp * 2 * state.h0 * u * u) / metric - gamma * u,
        state.masa * gamma * metric * u * u];
    };
    const n = Math.ceil(dt * 240), h = dt / n;
    let y = initial.slice();
    for (let i = 0; i < n; i++) {
      const k1 = deriv(y);
      const k2 = deriv(y.map((v,j) => v + h*k1[j]/2));
      const k3 = deriv(y.map((v,j) => v + h*k2[j]/2));
      const k4 = deriv(y.map((v,j) => v + h*k3[j]));
      y = y.map((v,j) => v + h*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);
    }
    return y;
  }
  function stateAt(t) {
    t=SimCommon.time(t,state.tMax);
    const i=Math.min(checkpoints.length-1,Math.floor(t*240));
    const [pos,vel,Eth]=integrate(checkpoints[i],Math.max(0,t-i/240));
    const Ep=state.masa*state.g*trackHeight(pos,state.h0);
    const Ec=0.5*state.masa*(25+(2*state.h0*pos)**2)*vel**2;
    return {t,pos,vel,Eth,Ep,Ec};
  }
  function seekTo(t) { Object.assign(state,stateAt(t));state.ended=state.t>=state.tMax;state.dir=Math.sign(state.vel)||1; }
  function step(dt) { if(!state.paused&&state.started&&!state.ended&&Number.isFinite(dt)&&dt>0) seekTo(state.t+dt); }

  // ── API pública ──────────────────────────────────────────
  return {
    init,
    step, seekTo, stateAt,
    getState:    () => ({ ...state }),
    getVelocity,
    trackHeight,

    setMasa(v)     { state.masa = SimCommon.number(v,Number.EPSILON);    state.Et = state.masa * state.g * state.h0; init(); },
    setGravity(v)  { state.g = SimCommon.number(v,0);       state.Et = state.masa * state.g * state.h0; init(); },
    setAltura(v)   { state.h0 = SimCommon.number(v,0);      state.Et = state.masa * state.g * state.h0; init(); },
    setFriction(v) { state.friction = !!v; init(); },
    pause()        { state.paused = true; },
    resume()       { state.paused = false; },
    isPaused()     { return state.paused; },
    reset()        { init(); },
  };

})();
