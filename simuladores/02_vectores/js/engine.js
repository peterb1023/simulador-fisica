// ============================================================
//  engine.js  —  Motor de vectores (SIM 02)
//  Fórmulas del profesor:
//    Vx = r·cosθ      Vy = r·senθ
//    r  = √(Vx²+Vy²)  θ = tan⁻¹(Vy/Vx)
//    Rx = ΣVx          Ry = ΣVy
//    R  = √(Rx²+Ry²)   θR = tan⁻¹(Ry/Rx)
//    Ley del coseno: R = √(A²+B²+2AB·cosθ)  [2 vectores]
//    Ley del seno:   A/senα = B/senβ = R/senθ
// ============================================================

const Engine = (() => {

  // Paleta de colores (sincronizada con sim.css)
  const COLORS = [
    '#388bfd', // azul
    '#3fb950', // verde
    '#f85149', // rojo
    '#e3b341', // amarillo
    '#bc8cff', // violeta
    '#f0883e', // naranja
    '#58a6ff', // accent
    '#79c0ff', // celeste
  ];

  const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Estado interno
  let vectors = [];
  let nextId  = 0;

  // ── Crear vector ────────────────────────────────────────
  function createVector(vx = 3, vy = 3) {
    vx=SimCommon.number(vx);vy=SimCommon.number(vy);
    const idx = vectors.length % COLORS.length;
    const v = {
      id:    nextId++,
      name:  NAMES[vectors.length % NAMES.length],
      color: COLORS[idx],
      vx, vy,
    };
    recompute(v);
    vectors.push(v);
    return v;
  }

  // ── Eliminar vector ──────────────────────────────────────
  function removeVector(id) {
    vectors = vectors.filter(v => v.id !== id);
    // Re-asignar nombres e índices de color
    vectors.forEach((v, i) => {
      v.name  = NAMES[i % NAMES.length];
      v.color = COLORS[i % COLORS.length];
    });
  }

  // ── Recalcular r y θ desde componentes ──────────────────
  function recompute(v) {
    // r = √(Vx² + Vy²)
    v.r = Math.sqrt(v.vx * v.vx + v.vy * v.vy);
    // θ = tan⁻¹(Vy / Vx)  → en grados, rango 0–360
    v.theta = toDeg(Math.atan2(v.vy, v.vx));
    if (v.theta < 0) v.theta += 360;
  }

  // ── Actualizar desde componentes cartesianas ─────────────
  function setCartesian(id, vx, vy) {
    const v = vectors.find(v => v.id === id);
    if (!v) return;
    vx=SimCommon.number(vx);vy=SimCommon.number(vy);
    v.vx = vx; v.vy = vy;
    recompute(v);
  }

  // ── Actualizar desde polares ─────────────────────────────
  function setPolar(id, r, thetaDeg) {
    const v = vectors.find(v => v.id === id);
    if (!v) return;
    r=SimCommon.number(r,0);thetaDeg=SimCommon.number(thetaDeg);
    const rad = toRad(thetaDeg);
    // Vx = r·cosθ   Vy = r·senθ
    v.r     = r;
    v.theta = thetaDeg;
    v.vx    = r * Math.cos(rad);
    v.vy    = r * Math.sin(rad);
  }

  // ── Resultante ───────────────────────────────────────────
  function getResultant() {
    // Rx = ΣVx   Ry = ΣVy
    const Rx = vectors.reduce((s, v) => s + v.vx, 0);
    const Ry = vectors.reduce((s, v) => s + v.vy, 0);
    // R = √(Rx² + Ry²)
    const R  = Math.sqrt(Rx * Rx + Ry * Ry);
    // θR = tan⁻¹(Ry / Rx)
    let thetaR = toDeg(Math.atan2(Ry, Rx));
    if (thetaR < 0) thetaR += 360;

    // Ley del coseno solo para exactamente 2 vectores
    let leyCoseno = null;
    if (vectors.length === 2) {
      const A = vectors[0].r, B = vectors[1].r;
      // Ángulo entre los dos vectores
      const angBetween = toRad(vectors[1].theta - vectors[0].theta);
      const Rcos = Math.sqrt(Math.max(0,A*A + B*B + 2*A*B*Math.cos(angBetween)));
      leyCoseno = { A, B, angle: toDeg(angBetween), R: Rcos };
    }

    return { Rx, Ry, R, thetaR, leyCoseno };
  }

  // ── Helpers ──────────────────────────────────────────────
  function toDeg(rad) { return rad * 180 / Math.PI; }
  function toRad(deg) { return deg * Math.PI / 180; }
  function fmt2(n)    { return Math.round(n * 100) / 100; }

  // ── API pública ──────────────────────────────────────────
  return {
    createVector,
    removeVector,
    setCartesian,
    setPolar,
    getResultant,
    products(a=vectors[0],b=vectors[1]) {
      if(!a||!b) return null;
      return {dot:a.vx*b.vx+a.vy*b.vy,crossZ:a.vx*b.vy-a.vy*b.vx};
    },
    getVectors: () => vectors.map(v => ({ ...v })),
    getVector:  (id) => { const v = vectors.find(v => v.id === id); return v ? { ...v } : null; },
    fmt2,
    toDeg,
    toRad,
    MAX_VECTORS: 999,
    canAdd: () => vectors.length < 999,
  };

})();
