// ============================================================
//  render.js  —  Dibuja la simulación en el canvas
// ============================================================

const Renderer = (() => {

  let canvas, ctx, W, H;
  let animId = null;
  let lastTime = 0;

  // ── Colores (igual que CSS vars) ────────────────────────
  const C = {
    bg:      '#0a1628',
    grid:    'rgba(48,54,61,0.5)',
    track:   '#30363d',
    trackFill: 'rgba(22,27,34,0.9)',
    ep:      '#388bfd',
    ec:      '#3fb950',
    th:      '#f85149',
    et:      '#e3b341',
    obj:     '#e3b341',
    objRim:  '#f0c060',
    shadow:  'rgba(227,179,65,0.3)',
    ref:     'rgba(88,166,255,0.25)',
    text:    '#8b949e',
    arrow:   '#58a6ff',
  };

  // ── Setup ────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('simCanvas');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas],resize);
  }

  function resize() {
    [canvas].forEach(SimCanvas.resize);
    W=canvas.logicalWidth;H=canvas.logicalHeight;
  }

  // ── Coordenadas de pista ─────────────────────────────────
  // Mapea pos ∈ [-1,1] → pixel (x, y) en la pista parabólica
  function trackPoint(pos, h0) {
    const padX  = W * 0.1;
    const baseY = H * 0.82;   // suelo visual
    const trackW = W - padX * 2;
    const scaleY = H * 0.62;  // altura máxima visual

    const x = padX + (pos + 1) * 0.5 * trackW;
    const hNorm = (pos * pos * h0) / (h0 || 1);
    const y = baseY - hNorm * (scaleY / (h0 || 1));
    return { x, y };
  }

  // ── Dibujar pista ────────────────────────────────────────
  function drawTrack(h0) {
    const steps = 120;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = -1 + (2 * i / steps);
      const pt = trackPoint(p, h0);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    // Cerrar hacia abajo para relleno
    const ptR = trackPoint(1, h0);
    const ptL = trackPoint(-1, h0);
    ctx.lineTo(ptR.x, H);
    ctx.lineTo(ptL.x, H);
    ctx.closePath();

    ctx.fillStyle = C.trackFill;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = -1 + (2 * i / steps);
      const pt = trackPoint(p, h0);
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = C.track;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Línea del carril interior
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = -1 + (2 * i / steps);
      const pt = trackPoint(p, h0);
      i === 0 ? ctx.moveTo(pt.x - 0, pt.y + 4) : ctx.lineTo(pt.x, pt.y + 4);
    }
    ctx.strokeStyle = 'rgba(88,166,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── Línea de referencia (h=0) ────────────────────────────
  function drawRefLine(h0) {
    const ptL = trackPoint(-1, h0);
    const ptR = trackPoint(1,  h0);
    const baseY = trackPoint(0, h0).y; // fondo = h=0

    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(ptL.x - 20, baseY);
    ctx.lineTo(ptR.x + 20, baseY);
    ctx.strokeStyle = C.ref;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = C.text;
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText('h = 0', ptL.x - 14, baseY - 5);
  }

  // ── Flecha de altura ─────────────────────────────────────
  function drawHeightArrow(objPt, basePt) {
    if (Math.abs(objPt.y - basePt.y) < 4) return;
    const x = objPt.x + 22;
    ctx.beginPath();
    ctx.moveTo(x, basePt.y);
    ctx.lineTo(x, objPt.y);
    ctx.strokeStyle = C.arrow;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Cabeza flecha
    ctx.beginPath();
    ctx.moveTo(x - 4, objPt.y + 7);
    ctx.lineTo(x, objPt.y);
    ctx.lineTo(x + 4, objPt.y + 7);
    ctx.strokeStyle = C.arrow;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── Objeto (esfera con sombra) ───────────────────────────
  function drawObject(pt, r, vel) {
    // Sombra de glow
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r + 6, 0, Math.PI * 2);
    const grd = ctx.createRadialGradient(pt.x, pt.y, r * 0.3, pt.x, pt.y, r + 6);
    grd.addColorStop(0, 'rgba(227,179,65,0.35)');
    grd.addColorStop(1, 'rgba(227,179,65,0)');
    ctx.fillStyle = grd;
    ctx.fill();

    // Cuerpo
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = C.obj;
    ctx.fill();

    // Aro
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = C.objRim;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brillo
    ctx.beginPath();
    ctx.arc(pt.x - r * 0.28, pt.y - r * 0.3, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
  }

  // ── Grid sutil de fondo ──────────────────────────────────
  function drawGrid() {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    const step = 60;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // ── Frame principal ──────────────────────────────────────
  function frame(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    Engine.step(dt);
    const s  = Engine.getState();
    const v  = Engine.getVelocity();
    const h  = Engine.trackHeight(s.pos, s.h0);

    // Fondo
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawTrack(s.h0);
    drawRefLine(s.h0);

    // Objeto
    const objPt  = trackPoint(s.pos, s.h0);
    const basePt = trackPoint(s.pos, 0); // h=0 en x del objeto — fondo curvo
    const floorPt = { x: objPt.x, y: trackPoint(0, s.h0).y }; // plano base real

    drawHeightArrow(objPt, floorPt);
    drawObject(objPt, 14, v);

    // Etiqueta de altura sobre objeto
    if (h > 0.05) {
      ctx.fillStyle = C.ep;
      ctx.font = 'bold 11px Space Mono, monospace';
      ctx.fillText(`h=${h.toFixed(1)}m`, objPt.x - 20, objPt.y - 22);
    }

    // Actualizar UI
    UI.updateEnergy(s, v, h);

    animId = requestAnimationFrame(frame);
  }

  // ── Iniciar loop ─────────────────────────────────────────
  function start() {
    if (animId) cancelAnimationFrame(animId);
    lastTime = performance.now();
    animId = requestAnimationFrame(frame);
  }

  return { init, start, resize };

})();
