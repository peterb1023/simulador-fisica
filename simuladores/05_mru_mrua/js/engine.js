// ============================================================
//  ENGINE — Motor físico MRU / MRUA
// ============================================================
const Engine = (() => {
  const G = 9.8;
  let state = {
    mru:  { x0:0, v:8,  x:0, histX:[], histV:[] },
    mrua: { x0:0, v0:8, a:-2, x:0, v:0, histX:[], histV:[] },
    t:0, tMax:8, paused:false, ended:false, modoCaida:false,
  };
  const mruXAt  = t => state.mru.x0 + state.mru.v * t;
  const mruaXAt = t => { const a = state.modoCaida ? G : state.mrua.a; return state.mrua.x0 + state.mrua.v0*t + 0.5*a*t*t; };
  const mruaVAt = t => { const a = state.modoCaida ? G : state.mrua.a; return state.mrua.v0 + a*t; };

  function init() {
    state.t=0; state.paused=false; state.ended=false;
    state.mru.x=state.mru.x0;
    state.mru.histX=[{t:0,x:state.mru.x0}]; state.mru.histV=[{t:0,v:state.mru.v}];
    state.mrua.x=state.mrua.x0; state.mrua.v=state.mrua.v0;
    state.mrua.histX=[{t:0,x:state.mrua.x0}]; state.mrua.histV=[{t:0,v:state.mrua.v0}];
  }
  function step(dt) {
    if (state.paused || state.ended || !Number.isFinite(dt) || dt<=0) return;
    seekTo(state.t + dt);
  }
  function seekTo(targetT) {
    const t=SimCommon.time(targetT,state.tMax);state.t=t;state.ended=t>=state.tMax;
    state.mru.x=mruXAt(t);state.mrua.x=mruaXAt(t);state.mrua.v=mruaVAt(t);
    state.mru.histX=SimCommon.samples(t,state.tMax,ti=>({t:ti,x:mruXAt(ti)}));
    state.mru.histV=SimCommon.samples(t,state.tMax,ti=>({t:ti,v:state.mru.v}));
    state.mrua.histX=SimCommon.samples(t,state.tMax,ti=>({t:ti,x:mruaXAt(ti)}));
    state.mrua.histV=SimCommon.samples(t,state.tMax,ti=>({t:ti,v:mruaVAt(ti)}));
  }
  function getSustitucion() {
    const t=state.t, a=state.modoCaida?G:state.mrua.a;
    return {
      mru_pos:  {formula:'x = x₀ + v·t',    sust:`x = ${fmt(state.mru.x0)} + ${fmt(state.mru.v)}·${fmt(t)}`, res:`x = ${fmt(state.mru.x)} m`},
      mru_vel:  {formula:'v = constante',     sust:`v = ${fmt(state.mru.v)} m/s  (a = 0)`,                    res:`v = ${fmt(state.mru.v)} m/s`},
      mrua_vel: {formula:'vx = v₀ + a·t',    sust:`vx = ${fmt(state.mrua.v0)} + (${fmt(a)})·${fmt(t)}`,     res:`vx = ${fmt(state.mrua.v)} m/s`},
      mrua_pos: {formula:'x = x₀+v₀t+½at²', sust:`x = ${fmt(state.mrua.x0)} + ${fmt(state.mrua.v0)}·${fmt(t)} + ½·(${fmt(a)})·${fmt(t)}²`, res:`x = ${fmt(state.mrua.x)} m`},
    };
  }
  const fmt = n => Math.round(n*100)/100;
  function getState() {
    return {...state, mru:{...state.mru,histX:[...state.mru.histX],histV:[...state.mru.histV]},
                     mrua:{...state.mrua,histX:[...state.mrua.histX],histV:[...state.mrua.histV]}};
  }
  init();
  return { init,step,seekTo,getState,getSustitucion,
    setMruX0:v=>{state.mru.x0=SimCommon.number(v);init()}, setMruV:v=>{state.mru.v=SimCommon.number(v);init()},
    setMruaX0:v=>{state.mrua.x0=SimCommon.number(v);init()}, setMruaV0:v=>{state.mrua.v0=SimCommon.number(v);init()},
    setMruaA:v=>{state.mrua.a=SimCommon.number(v);init()}, setTMax:v=>{state.tMax=SimCommon.number(v,Number.EPSILON);init()},
    setModoCaida:b=>{state.modoCaida=b;init()}, togglePause:()=>{state.paused=!state.paused},
    G, fmt };
})();
