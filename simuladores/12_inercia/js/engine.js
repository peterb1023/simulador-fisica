// ============================================================
//  engine.js  —  Motor de Momento de Inercia (SIM 12)
//  Fórmulas del profesor:
//    I   = Σmᵢrᵢ²          — Definición discreta
//    I   = ∫r²dm            — Definición integral
//    K   = ½·I·ω²           — Energía cinética rotacional
//    I_P = I_cm + M·d²      — Teorema ejes paralelos
//    I   = ¹⁄₁₂·M·L²       — Varilla por el centro
//    I   = ¹⁄₃·M·L²        — Varilla por un extremo
//  Fórmulas adicionales para otros cuerpos (enriquecen comparador):
//    I   = ½·M·R²           — Disco/cilindro sólido   [AGREGADA]
//    I   = M·R²             — Aro/cilindro hueco      [AGREGADA]
//    I   = ²⁄₅·M·R²        — Esfera sólida           [AGREGADA]
//    I   = ²⁄₃·M·R²        — Esfera hueca            [AGREGADA]
// ============================================================

const Engine = (() => {

  // ── Catálogo de cuerpos ──────────────────────────────────
  // Cada cuerpo define:
  //   id, nombre, formula, latex, param ('L' o 'R'), color
  //   calcI(M, dim) → número
  //   ejeLabel → texto del eje de rotación
  //   agregada → bool (no es del profesor)

  const CUERPOS = [
    {
      id:        'varilla_cm',
      nombre:    'Varilla — centro',
      formula:   'I = ¹⁄₁₂ · M · L²',
      latex:     '1/12 · M · L²',
      param:     'L',
      paramLabel:'L (longitud)',
      color:     '#58a6ff',
      ejeLabel:  'Eje por el centro ⊥ a la varilla',
      agregada:  false,
      calcI:     (M, L) => (1/12) * M * L * L,
    },
    {
      id:        'varilla_ext',
      nombre:    'Varilla — extremo',
      formula:   'I = ¹⁄₃ · M · L²',
      latex:     '1/3 · M · L²',
      param:     'L',
      paramLabel:'L (longitud)',
      color:     '#e3b341',
      ejeLabel:  'Eje por un extremo ⊥ a la varilla',
      agregada:  false,
      calcI:     (M, L) => (1/3) * M * L * L,
    },
    {
      id:        'disco',
      nombre:    'Disco / Cilindro sólido',
      formula:   'I = ½ · M · R²',
      latex:     '1/2 · M · R²',
      param:     'R',
      paramLabel:'R (radio)',
      color:     '#3fb950',
      ejeLabel:  'Eje central (eje de simetría)',
      agregada:  true,
      calcI:     (M, R) => 0.5 * M * R * R,
    },
    {
      id:        'aro',
      nombre:    'Aro / Cilindro hueco',
      formula:   'I = M · R²',
      latex:     'M · R²',
      param:     'R',
      paramLabel:'R (radio)',
      color:     '#f85149',
      ejeLabel:  'Eje central (eje de simetría)',
      agregada:  true,
      calcI:     (M, R) => M * R * R,
    },
    {
      id:        'esfera_sol',
      nombre:    'Esfera sólida',
      formula:   'I = ²⁄₅ · M · R²',
      latex:     '2/5 · M · R²',
      param:     'R',
      paramLabel:'R (radio)',
      color:     '#a371f7',
      ejeLabel:  'Eje por el centro',
      agregada:  true,
      calcI:     (M, R) => (2/5) * M * R * R,
    },
    {
      id:        'esfera_hue',
      nombre:    'Esfera hueca',
      formula:   'I = ²⁄₃ · M · R²',
      latex:     '2/3 · M · R²',
      param:     'R',
      paramLabel:'R (radio)',
      color:     '#79c0ff',
      ejeLabel:  'Eje por el centro',
      agregada:  true,
      calcI:     (M, R) => (2/3) * M * R * R,
    },
  ];

  // ── Estado ───────────────────────────────────────────────
  let state = {
    cuerpoId: 'varilla_cm',   // cuerpo activo
    M:        5.0,            // masa (kg)
    dim:      1.0,            // L o R según el cuerpo
    omega:    3.0,            // vel. angular (rad/s)
    d:        0.0,            // distancia para teorema ejes paralelos

    // Calculados
    I:        0,              // momento de inercia (kg·m²)
    I_P:      0,              // I con ejes paralelos (kg·m²)
    K:        0,              // energía cinética rotacional (J)
    K_P:      0,              // K con I_P
    theta:    0,              // ángulo acumulado para animación (rad)
  };

  function getCuerpo() {
    return CUERPOS.find(c => c.id === state.cuerpoId) || CUERPOS[0];
  }

  // ── Calcular ─────────────────────────────────────────────
  function calcular() {
    const c  = getCuerpo();
    state.I  = c.calcI(state.M, state.dim);

    // Teorema ejes paralelos: I_P = I_cm + M·d²
    // Solo aplica si el cuerpo usa el cm como eje natural
    const Icm = c.id === 'varilla_ext' ? state.M * state.dim ** 2 / 12 : state.I;
    state.I_P = Icm + state.M * state.d * state.d;

    // K = ½·I·ω²
    state.K   = 0.5 * state.I   * state.omega * state.omega;
    state.K_P = 0.5 * state.I_P * state.omega * state.omega;
  }

  // ── Step (solo gira para la animación) ───────────────────
  function step(dt) {
    if (state.paused) return;
    state.theta += state.omega * dt;
    calcular();
  }

  // ── Resolución en vivo ────────────────────────────────────
  function getSustitucion() {
    const f  = fmt;
    const c  = getCuerpo();

    return {
      inercia: {
        formula: c.formula,
        sust:    `I = ${c.latex.replace('M', f(state.M)).replace('L²', f(state.dim)+'²').replace('R²', f(state.dim)+'²')}`,
        res:     `I = ${f(state.I)} kg·m²`,
      },
      ejes_par: {
        formula: 'I_P = I_cm + M · d²',
        sust:    `I_P = ${f(state.I_P - state.M * state.d ** 2)} + ${f(state.M)} · ${f(state.d)}²`,
        res:     `I_P = ${f(state.I_P)} kg·m²`,
      },
      energia: {
        formula: 'K = ½ · I · ω²',
        sust:    `K = ½ · ${f(state.I)} · ${f(state.omega)}²`,
        res:     `K = ${f(state.K)} J`,
      },
      energia_p: {
        formula: 'K_P = ½ · I_P · ω²',
        sust:    `K_P = ½ · ${f(state.I_P)} · ${f(state.omega)}²`,
        res:     `K_P = ${f(state.K_P)} J`,
      },
    };
  }

  // ── Setters ───────────────────────────────────────────────
  function setCuerpo(id) {
    state.cuerpoId = id;
    // Reset dim a un valor razonable según param
    const c = getCuerpo();
    state.dim = c.param === 'L' ? 1.5 : 0.8;
    calcular();
  }
  function setM(v)     { state.M     = +v; calcular(); }
  function setDim(v)   { state.dim   = +v; calcular(); }
  function setOmega(v) { state.omega = +v; calcular(); }
  function setD(v)     { state.d     = +v; calcular(); }

  function togglePause() { state.paused = !state.paused; }
  function getState()    { return state; }
  function getCuerpos()  { return CUERPOS; }
  function fmt(n)        { return Math.round(n * 1000) / 1000; }

  // Init
  state.paused = false;
  calcular();

  return {
    step, getState, getCuerpo, getCuerpos, getSustitucion,
    setCuerpo, setM, setDim, setOmega, setD,
    togglePause, fmt,
  };

})();