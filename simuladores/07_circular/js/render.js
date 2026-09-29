// ============================================================
//  render.js  —  Canvas 2D SIM 07: Movimiento Circular
//  Dibuja:
//    · Fondo y cuadrícula
//    · Órbita circular (guía punteada)
//    · Trail del objeto con fade
//    · Radio actual (línea desde el centro)
//    · Objeto (círculo con glow)
//    · Flecha arad (centrípeta, roja — apunta al centro)
//    · Flecha atan (tangencial, verde — tangente al círculo)
//    · Etiquetas de cada vector
//    · HUD: v, ω, T, f, arad, θ
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;

  const C = {
    bg:       '#0a1628',
    grid:     'rgba(48,54,61,0.35)',
    orbit:    'rgba(88,166,255,0.15)',
    radio:    'rgba(88,166,255,0.2)',
    trail:    '#58a6ff',
    obj:      '#ffffff',
    objGlow:  'rgba(255,255,255,0.3)',
    arad:     '#f85149',   // centrípeta — rojo
    atan:     '#3fb950',   // tangencial — verde
    centro:   'rgba(88,166,255,0.5)',
    tx1:      '#e6edf3',
    tx2:      '#8b949e',
    tx3:      '#484f58',
  };

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas],resize);
  }

  function resize() {
    [canvas].forEach(SimCanvas.resize);
  }

  // ── Centro del canvas y escala ────────────────────────────
  function getMeta(st) {
    const cx = canvas.logicalWidth  / 2;
    const cy = canvas.logicalHeight / 2;
    // Escala: el radio R debe ocupar ~35% del lado más corto
    const side = Math.min(canvas.logicalWidth, canvas.logicalHeight);
    const scale = (side * 0.35) / st.R;
    return { cx, cy, scale };
  }

  // ── Cuadrícula ────────────────────────────────────────────
  function drawGrid() {
    const W = canvas.logicalWidth;
    const H = canvas.logicalHeight;
    const step = 40;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // ── Flecha ────────────────────────────────────────────────
  function drawArrow(x1, y1, x2, y2, color, lw) {
    const dx  = x2 - x1;
    const dy  = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 4) return;
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const angle   = Math.atan2(dy, dx);
    const headLen = Math.min(12, len * 0.3);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  // ════════════════════════════════════════════════════════
  //  DRAW PRINCIPAL
  // ════════════════════════════════════════════════════════
  function draw(st) {
    const W = canvas.logicalWidth;
    const H = canvas.logicalHeight;
    const { cx, cy, scale } = getMeta(st);

    // Fondo
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    drawGrid();

    // Ejes de referencia (delgados)
    ctx.strokeStyle = 'rgba(88,166,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // ── Órbita (guía punteada) ────────────────────────────
    const Rpx = st.R * scale;
    ctx.strokeStyle = C.orbit;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, Rpx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Radio actual ──────────────────────────────────────
    const ox = cx + st.x * scale;
    const oy = cy - st.y * scale;   // canvas Y invertido
    ctx.strokeStyle = C.radio;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Trail con fade ────────────────────────────────────
    const trail = st.trail;
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.strokeStyle = `rgba(88,166,255,${alpha * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + trail[i - 1].x * scale, cy - trail[i - 1].y * scale);
        ctx.lineTo(cx + trail[i].x     * scale, cy - trail[i].y     * scale);
        ctx.stroke();
      }
    }

    // ── Centro ────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.centro;
    ctx.fill();

    // ── Vectores ──────────────────────────────────────────
    // Escala visual de los vectores (ajustada para que sean legibles)
    const aradLen  = Math.min(st.arad  * scale * 0.35, Rpx * 0.7);
    const atanLen  = Math.abs(st.atan) > 0.01
      ? Math.min(Math.abs(st.atan) * scale * 0.8, Rpx * 0.5)
      : 0;

    // arad — apunta del objeto hacia el centro
    const aradX2 = ox + st.aradX * aradLen;
    const aradY2 = oy - st.aradY * aradLen;   // Y invertido
    drawArrow(ox, oy, aradX2, aradY2, C.arad, 2.5);

    // atan — dirección tangente al círculo
    if (atanLen > 4) {
      const sign    = st.atan >= 0 ? 1 : -1;
      const atanX2 = ox + st.atanX * atanLen * sign;
      const atanY2 = oy - st.atanY * atanLen * sign;
      drawArrow(ox, oy, atanX2, atanY2, C.atan, 2.5);

      // Etiqueta atan
      ctx.fillStyle = C.atan;
      ctx.font = 'bold 10px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`aₜ=${Engine.fmt(st.atan)} m/s²`, atanX2, atanY2 - 10);
    }

    // Etiqueta arad
    ctx.fillStyle = C.arad;
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.textAlign = 'center';
    const midAradX = ox + st.aradX * (aradLen * 0.5 + 16);
    const midAradY = oy - st.aradY * (aradLen * 0.5 + 16);
    ctx.fillText(`aᵣ=${Engine.fmt(st.arad)} m/s²`, midAradX, midAradY);

    // ── Objeto ────────────────────────────────────────────
    const pr = 11;
    const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, pr * 3);
    grd.addColorStop(0, 'rgba(255,255,255,0.3)');
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(ox, oy, pr * 3, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ox, oy, pr, 0, Math.PI * 2);
    ctx.fillStyle = C.obj;
    ctx.fill();

    // ── Etiqueta de radio en el centro ────────────────────
    ctx.fillStyle = 'rgba(88,166,255,0.6)';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${Engine.fmt(st.R)} m`, cx + (ox - cx) * 0.5, cy - (oy - cy) * 0.5 - 7);

    // ── HUD ───────────────────────────────────────────────
    drawHUD(st);
  }

  // ── HUD esquina superior izquierda ────────────────────────
  function drawHUD(st) {
    const thetaDeg = ((st.theta % (2 * Math.PI)) * 180 / Math.PI).toFixed(1);
    const lines = [
      { label: 'v',    val: Engine.fmt(st.v)     + ' m/s',   color: '#e6edf3' },
      { label: 'ω',    val: Engine.fmt(st.omega)  + ' rad/s', color: '#58a6ff' },
      { label: 'T',    val: Engine.fmt(st.T)      + ' s',     color: '#e3b341' },
      { label: 'f',    val: Engine.fmt(st.f)      + ' Hz',    color: '#e3b341' },
      { label: 'arad', val: Engine.fmt(st.arad)   + ' m/s²',  color: '#f85149' },
      { label: 'atan', val: Engine.fmt(st.atan)   + ' m/s²',  color: '#3fb950' },
      { label: 'θ',    val: thetaDeg              + '°',      color: '#8b949e' },
    ];

    const bx = 14;
    let   by = 22;
    ctx.font = '10px Space Mono, monospace';
    lines.forEach(l => {
      ctx.fillStyle = '#484f58';
      ctx.textAlign = 'right';
      ctx.fillText(l.label, bx + 30, by);
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.fillText(l.val, bx + 34, by);
      by += 15;
    });
  }

  // ── Frame loop ────────────────────────────────────────────
  function frame() {
    Engine.step(clock.tick());
    const st = Engine.getState();
    draw(st);
    UI.updatePanel(Engine.getSustitucion());
    animId = requestAnimationFrame(frame);
  }

  function start() {
    clock.reset();
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }
  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  return { init, start, stop, resize };

})();
