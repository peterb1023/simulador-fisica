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
    mus: 0, theta: 0, v0: 0,
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
  function stateAt(t) {
    t=SimCommon.time(t,state.tMax);
    const {m,F,phi,theta,muk,mus,v0,modo}=state;
    const w=m*G;
    if(modo==='elevador'){
      const ay=(F-w)/m;
      return {t,w,n:0,Fx:0,Fy:F,fric:0,fricSigned:0,fricActiva:false,regime:'sin contacto',sumFx:0,sumFy:F-w,ax:0,ay,T:F,x:v0*t+0.5*ay*t*t,vx:v0+ay*t,y:0,vy:0};
    }
    const angle=theta*Math.PI/180, p=phi*Math.PI/180;
    const weightParallel=-w*Math.sin(angle),weightNormal=-w*Math.cos(angle);
    const Fx=F*Math.cos(p),Fy=F*Math.sin(p);
    const n=Math.max(0,-weightNormal-Fy),drive=Fx+weightParallel;
    const ay=n===0?(Fy+weightNormal)/m:0;
    const fromRest = () => Math.abs(drive)<=mus*n+1e-10
      ? {a:0,fric:-drive,regime:'estática'}
      : {a:(drive-Math.sign(drive)*muk*n)/m,fric:-Math.sign(drive)*muk*n,regime:'cinética'};
    let segment=fromRest(),x=0,vx=0;
    if(Math.abs(v0)>1e-12){
      const fric=-Math.sign(v0)*muk*n,a=(drive+fric)/m;
      const stop=v0*a<0?-v0/a:Infinity;
      if(t<stop){segment={a,fric,regime:'cinética'};x=v0*t+0.5*a*t*t;vx=v0+a*t;}
      else {const elapsed=t-stop;x=v0*stop+0.5*a*stop*stop+0.5*segment.a*elapsed*elapsed;vx=segment.a*elapsed;}
    }else{x=0.5*segment.a*t*t;vx=segment.a*t;}
    return {t,w,n,Fx,Fy,weightParallel,weightNormal,fric:Math.abs(segment.fric),fricSigned:segment.fric,fricActiva:segment.regime==='cinética',regime:segment.regime,
      sumFx:drive+segment.fric,sumFy:n+Fy+weightNormal,ax:segment.a,ay,T:0,x,vx,y:0.5*ay*t*t,vy:ay*t};
  }
  function calcular() { Object.assign(state,stateAt(state.t)); }

  // ── Init / Reset ─────────────────────────────────────────
  function init() {
    state.t=0;state.ended=false;
    state.x  = 0;
    state.vx = 0;
    calcular();
  }

  // ── Step ─────────────────────────────────────────────────
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
          formula: 'N = max(0, mg cos θ − F sen φ)',
          sust:    `N = ${f(state.w)} cos(${f(state.theta)}°) − ${f(state.Fy)}`,
          res:     `n = ${f(state.n)} N`,
        },
        fric: {
          formula: state.regime==='estática'?'|fs| ≤ μsN':'fk = −sign(v) μkN',
          sust:    `${state.regime}: f = ${f(state.fricSigned)} N`,
          res:     `fk = ${f(state.fric)} N`,
          agregada: true,
        },
        segunda: {
          formula: 'ΣFx = m · ax',
          sust:    `${f(state.Fx)} + (${f(state.weightParallel)}) + (${f(state.fricSigned)}) = ${f(state.m)} · ax`,
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
  function setMus(v) { state.mus=SimCommon.number(v,0);state.muk=Math.min(state.muk,state.mus);init(); }
  function setTheta(v) { state.theta=SimCommon.number(v,-90,90);init(); }
  function setV0(v) { state.v0=SimCommon.number(v);init(); }
  function setM(v)    { state.m   = SimCommon.number(v,0.001); init(); }
  function setF(v)    { state.F   = SimCommon.number(v,0); init(); }
  function setPhi(v)  { state.phi = SimCommon.number(v,-180,180); init(); }
  function setMuk(v)  { state.muk = SimCommon.number(v,0); state.mus=Math.max(state.mus,state.muk); init(); }
  function setModo(v) { state.modo = v; init(); }
  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function fmt(n)        { return Math.round(n * 100) / 100; }

  init();

  return {
    init, step, seekTo, stateAt, getState, getSustitucion,
    setM, setF, setPhi, setMuk, setMus, setTheta, setV0, setModo,
    togglePause, fmt, G,
  };

})();