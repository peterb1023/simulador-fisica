// ============================================================
//  engine.js  —  Motor de Potencia (SIM 10)
//  Fórmulas del profesor:
//    P = W / t
//    P = F · v
//    W = P · t   (despejada)
//    t = W / P   (despejada)
//  Agregadas:
//    1 hp  = 746 W
//    1 kW  = 1000 W
// ============================================================

const Engine = (() => {

  const HP_TO_W = 746;
  const KW_TO_W = 1000;

  // ── Modos de cálculo ─────────────────────────────────────
  // 'P'  → busca Potencia   (conoce W y t)
  // 'W'  → busca Trabajo    (conoce P y t)
  // 't'  → busca Tiempo     (conoce W y P)
  // 'Fv' → busca Potencia   (conoce F y v)

  let state = {
    modo: 'P',

    // Inputs según modo
    W:  5000,    // J
    P:  500,     // W
    t:  10,      // s
    F:  200,     // N
    v:  25,      // m/s

    // Resultado calculado
    resultado: null,
    pasos: [],
  };

  // ── Calcular según modo ───────────────────────────────────
  function calcular() {
    const { modo, W, P, t, F, v } = state;
    state.error='';
    const required={P:[W,t],W:[P,t],t:[W,P],Fv:[F,v]}[modo];
    if(!required||!required.every(x=>Number.isFinite(x)&&x>=0)){
      state.resultado=null;state.pasos=[];state.error='Introduce valores finitos no negativos.';return;
    }
    let resultado = null;
    let pasos     = [];

    if (modo === 'P') {
      // P = W / t
      if (t === 0) { state.resultado = null; state.pasos = []; state.error='El divisor debe ser mayor que cero.'; return; }
      resultado = W / t;
      pasos = [
        { formula: 'P = W / t',
          sust:    `P = ${fmt(W)} J / ${fmt(t)} s`,
          res:     `P = ${fmt(resultado)} W` },
        { formula: 'Conversiones',
          sust:    `${fmt(resultado)} W ÷ 746 = ${fmt(resultado / HP_TO_W)} hp\n${fmt(resultado)} W ÷ 1000 = ${fmt(resultado / KW_TO_W)} kW`,
          res:     `${fmt(resultado / HP_TO_W)} hp  /  ${fmt(resultado / KW_TO_W)} kW` },
      ];

    } else if (modo === 'W') {
      // W = P · t
      resultado = P * t;
      pasos = [
        { formula: 'W = P · t',
          sust:    `W = ${fmt(P)} W · ${fmt(t)} s`,
          res:     `W = ${fmt(resultado)} J` },
        { formula: 'Equivalencia energética',
          sust:    `${fmt(resultado)} J = ${fmt(resultado / 1000)} kJ`,
          res:     `${fmt(resultado / 3600000)} kWh` },
      ];

    } else if (modo === 't') {
      // t = W / P
      if (P === 0) { state.resultado = null; state.pasos = []; state.error='El divisor debe ser mayor que cero.'; return; }
      resultado = W / P;
      pasos = [
        { formula: 't = W / P',
          sust:    `t = ${fmt(W)} J / ${fmt(P)} W`,
          res:     `t = ${fmt(resultado)} s` },
        { formula: 'Conversión de tiempo',
          sust:    `${fmt(resultado)} s ÷ 60 = ${fmt(resultado / 60)} min\n${fmt(resultado)} s ÷ 3600 = ${fmt(resultado / 3600)} h`,
          res:     `${fmt(resultado / 60)} min` },
      ];

    } else if (modo === 'Fv') {
      // P = F · v
      resultado = F * v;
      pasos = [
        { formula: 'P = F · v',
          sust:    `P = ${fmt(F)} N · ${fmt(v)} m/s`,
          res:     `P = ${fmt(resultado)} W` },
        { formula: 'Conversiones',
          sust:    `${fmt(resultado)} W ÷ 746 = ${fmt(resultado / HP_TO_W)} hp\n${fmt(resultado)} W ÷ 1000 = ${fmt(resultado / KW_TO_W)} kW`,
          res:     `${fmt(resultado / HP_TO_W)} hp  /  ${fmt(resultado / KW_TO_W)} kW` },
      ];
    }

    state.resultado = Number.isFinite(resultado)?resultado:null;
    state.pasos     = pasos;
  }

  function efficiency(useful,input) {
    if(!Number.isFinite(+useful)||!Number.isFinite(+input)||+input<=0||+useful<0||+useful>+input)return null;
    return +useful/+input;
  }
  // ── Setters ───────────────────────────────────────────────
  function setModo(m) { state.modo = m; calcular(); }
  function setW(v)    { state.W = +v;   calcular(); }
  function setP(v)    { state.P = +v;   calcular(); }
  function setT(v)    { state.t = +v;   calcular(); }
  function setF(v)    { state.F = +v;   calcular(); }
  function setV(v)    { state.v = +v;   calcular(); }
  function getState() { return state; }
  function fmt(n)     {
    if (Math.abs(n) >= 10000) return Math.round(n).toLocaleString('es');
    if (Math.abs(n) >= 100)   return Math.round(n * 10) / 10;
    return Math.round(n * 100) / 100;
  }

  // Calcular al arrancar
  calcular();

  return { efficiency, setModo, setW, setP, setT, setF, setV, getState, calcular, fmt };

})();