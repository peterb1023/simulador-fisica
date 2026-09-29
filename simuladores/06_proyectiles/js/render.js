// ============================================================
//  render.js  —  Canvas 2D SIM 06: trayectoria parabólica
//  Dibuja:
//    · Cuadrícula de referencia
//    · Suelo con marcas de distancia
//    · Trayectoria teórica completa (punteada)
//    · Trail del proyectil
//    · Proyectil (círculo con glow)
//    · Vectores vx (azul) y vy (verde/rojo) en tiempo real
//    · Líneas de referencia: altura máx, alcance, punto actual
//    · Etiquetas: t, x, y, vx, vy, |v|, α
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;

  const C = {
    bg:        '#0a1628',
    grid:      'rgba(48,54,61,0.35)',
    gridMaj:   'rgba(88,166,255,0.1)',
    suelo:     'rgba(88,166,255,0.25)',
    sueloFill: 'rgba(88,166,255,0.04)',
    trayTeo:   'rgba(255,255,255,0.12)',
    trail:     '#58a6ff',
    obj:       '#ffffff',
    objGlow:   'rgba(255,255,255,0.3)',
    vx:        '#58a6ff',    // componente horizontal
    vy_pos:    '#3fb950',    // vy hacia arriba
    vy_neg:    '#f85149',    // vy hacia abajo
    v_res:     '#e3b341',    // vector resultante
    hMax:      'rgba(227,179,65,0.25)',
    alcance:   'rgba(248,81,73,0.2)',
    tx1:       '#e6edf3',
    tx2:       '#8b949e',
    tx3:       '#484f58',
    lanzam:    'rgba(88,166,255,0.5)',
  };

  // ── Márgenes del canvas ───────────────────────────────────
  const PAD = { top: 32, right: 24, bottom: 52, left: 52 };

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  }

  // ── Mapeo mundo → canvas ──────────────────────────────────
  // El "mundo" visible se ajusta dinámicamente al alcance y altura del proyectil
  function getScale(st) {
    const W = canvas.width  - PAD.left - PAD.right;
    const H = canvas.height - PAD.top  - PAD.bottom;

    // Rango del mundo con padding del 15%
    const worldW = Math.max(st.xMax * 1.18, 10);
    const worldH = Math.max((st.yMax + st.y0) * 1.25, 10);

    const scaleX = W / worldW;
    const scaleY = H / worldH;
    const scale  = Math.min(scaleX, scaleY);

    return {
      scale,
      toCanvasX: x  => PAD.left + x * scale,
      toCanvasY: y  => canvas.height - PAD.bottom - y * scale,
      worldW, worldH,
      gridStep: niceStep(worldW / 5),
    };
  }

  function niceStep(raw) {
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const r = raw / mag;
    if (r < 1.5) return mag;
    if (r < 3.5) return 2 * mag;
    if (r < 7.5) return 5 * mag;
    return 10 * mag;
  }

  // ════════════════════════════════════════════════════════
  //  DRAW PRINCIPAL
  // ════════════════════════════════════════════════════════
  function draw(st) {
    const W = canvas.width;
    const H = canvas.height;
    const { scale, toCanvasX, toCanvasY, worldW, worldH, gridStep } = getScale(st);

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // ── Cuadrícula ────────────────────────────────────────
    drawGrid(st, toCanvasX, toCanvasY, worldW, worldH, gridStep, scale);

    // ── Zona suelo ────────────────────────────────────────
    const groundY = toCanvasY(0);
    ctx.fillStyle = C.sueloFill;
    ctx.fillRect(PAD.left, groundY, W - PAD.left - PAD.right, H - groundY - PAD.bottom + 20);

    // Línea del suelo
    ctx.strokeStyle = C.suelo;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD.left, groundY);
    ctx.lineTo(W - PAD.right, groundY);
    ctx.stroke();

    // ── Línea de altura máx (horizontal, punteada dorada) ──
    if (st.yMax > 0.5) {
      const ymaxY = toCanvasY(st.yMax);
      ctx.strokeStyle = C.hMax;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, ymaxY);
      ctx.lineTo(W - PAD.right, ymaxY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px Space Mono, monospace';
      ctx.fillStyle = '#e3b341';
      ctx.textAlign = 'left';
      ctx.fillText(`hₘₐₓ = ${Engine.fmt(st.yMax)} m`, PAD.left + 4, ymaxY - 4);
    }

    // ── Trayectoria teórica completa (punteada) ───────────
    const pts = Engine.getTrajectoryPoints(120);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(Math.max(p.y, 0));
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    });
    ctx.strokeStyle = C.trayTeo;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Trail real del proyectil ───────────────────────────
    if (st.trail.length > 1) {
      ctx.beginPath();
      st.trail.forEach((p, i) => {
        const cx = toCanvasX(p.x);
        const cy = toCanvasY(Math.max(p.y, 0));
        i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      });
      ctx.strokeStyle = C.trail;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // ── Alcance: línea vertical roja punteada cuando aterriza ──
    if (st.ended && st.xMax > 0) {
      const alcX = toCanvasX(st.xMax);
      ctx.strokeStyle = 'rgba(248,81,73,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(alcX, groundY);
      ctx.lineTo(alcX, groundY - 18);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 9px Space Mono, monospace';
      ctx.fillStyle = '#f85149';
      ctx.textAlign = 'center';
      ctx.fillText(`R = ${Engine.fmt(st.xMax)} m`, alcX, groundY + 14);
    }

    // ── Proyectil ─────────────────────────────────────────
    const px = toCanvasX(st.x);
    const py = toCanvasY(st.y);
    const pr = 11;

    // Glow
    const grd = ctx.createRadialGradient(px, py, 0, px, py, pr * 3);
    grd.addColorStop(0, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, pr * 3, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = C.obj;
    ctx.fill();

    // ── Vectores de velocidad ─────────────────────────────
    const vScale = scale * 0.055;  // ajusta el tamaño visual de los vectores

    // vx (horizontal, azul) — siempre constante
    const vxLen = st.vx * vScale;
    drawArrow(ctx, px, py, px + vxLen, py, C.vx, 2);

    // vy (vertical, verde/rojo según signo)
    const vyColor = st.vy >= 0 ? C.vy_pos : C.vy_neg;
    const vyLen   = -st.vy * vScale;  // negativo porque Y canvas está invertido
    drawArrow(ctx, px, py, px, py + vyLen, vyColor, 2);

    // Vector resultante (dorado, más tenue)
    const resX = px + vxLen;
    const resY = py + vyLen;
    ctx.strokeStyle = C.v_res;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(resX, py);    // extremo de vx
    ctx.lineTo(resX, resY);  // línea vertical hasta v_res
    ctx.stroke();
    ctx.moveTo(px, resY);    // extremo de vy
    ctx.lineTo(resX, resY);
    ctx.stroke();
    ctx.setLineDash([]);
    drawArrow(ctx, px, py, resX, resY, C.v_res, 1.5);

    // ── Etiquetas de los vectores ─────────────────────────
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = C.vx;
    ctx.fillText(`vx=${Engine.fmt(st.vx)}`, px + vxLen + 5, py + 4);

    ctx.fillStyle = vyColor;
    const vyLabelY = py + vyLen + (st.vy >= 0 ? -6 : 14);
    ctx.textAlign = 'center';
    ctx.fillText(`vy=${Engine.fmt(st.vy)}`, px, vyLabelY);

    // ── HUD: datos actuales (esquina superior) ────────────
    drawHUD(st, scale);

    // ── Ejes numéricos ────────────────────────────────────
    drawAxes(st, toCanvasX, toCanvasY, worldW, gridStep, scale);
  }

  // ── Cuadrícula ────────────────────────────────────────────
  function drawGrid(st, toCanvasX, toCanvasY, worldW, worldH, gridStep, scale) {
    const W = canvas.width;
    const H = canvas.height;

    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= worldW + gridStep; x += gridStep) {
      const cx = toCanvasX(x);
      if (cx < PAD.left || cx > W - PAD.right) continue;
      ctx.beginPath(); ctx.moveTo(cx, PAD.top); ctx.lineTo(cx, H - PAD.bottom); ctx.stroke();
    }
    for (let y = 0; y <= worldH + gridStep; y += gridStep) {
      const cy = toCanvasY(y);
      if (cy < PAD.top || cy > H - PAD.bottom) continue;
      ctx.beginPath(); ctx.moveTo(PAD.left, cy); ctx.lineTo(W - PAD.right, cy); ctx.stroke();
    }
  }

  // ── Ejes con números ──────────────────────────────────────
  function drawAxes(st, toCanvasX, toCanvasY, worldW, gridStep, scale) {
    const W = canvas.width;
    const H = canvas.height;
    const groundY = toCanvasY(0);

    ctx.font = '9px Space Mono, monospace';
    ctx.fillStyle = C.tx3;

    // Eje X: marcas de distancia en el suelo
    ctx.textAlign = 'center';
    for (let x = 0; x <= worldW + gridStep; x += gridStep) {
      const cx = toCanvasX(x);
      if (cx < PAD.left || cx > W - PAD.right) continue;
      ctx.fillStyle = C.tx3;
      ctx.fillRect(cx, groundY, 1, 5);
      ctx.fillStyle = C.tx2;
      ctx.fillText(Engine.fmt(x) + 'm', cx, groundY + 16);
    }
    ctx.fillStyle = C.tx3;
    ctx.textAlign = 'right';
    ctx.fillText('x', W - PAD.right + 18, groundY + 4);

    // Eje Y: marcas de altura
    const hStep = gridStep;
    const worldH = (st.yMax + st.y0) * 1.25;
    ctx.textAlign = 'right';
    for (let y = hStep; y <= worldH + hStep; y += hStep) {
      const cy = toCanvasY(y);
      if (cy < PAD.top || cy > H - PAD.bottom) continue;
      ctx.fillStyle = C.tx3;
      ctx.fillRect(PAD.left - 5, cy, 5, 1);
      ctx.fillStyle = C.tx2;
      ctx.fillText(Engine.fmt(y) + 'm', PAD.left - 8, cy + 3);
    }
    ctx.fillStyle = C.tx3;
    ctx.textAlign = 'center';
    ctx.fillText('y', PAD.left - 14, PAD.top - 8);

    // Línea de lanzamiento (diagonal punteada desde origen)
    const alpha = st.alpha * Math.PI / 180;
    const lineLen = 40;
    const ox = toCanvasX(0);
    const oy = toCanvasY(st.y0);
    ctx.strokeStyle = C.lanzam;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + lineLen * Math.cos(alpha), oy - lineLen * Math.sin(alpha));
    ctx.stroke();
    ctx.setLineDash([]);

    // Arco del ángulo
    ctx.strokeStyle = 'rgba(88,166,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox, oy, 20, -alpha, 0);
    ctx.stroke();
    ctx.fillStyle = C.vx;
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${st.alpha}°`, ox + 24, oy - 4);
  }

  // ── HUD (esquina superior izquierda) ──────────────────────
  function drawHUD(st, scale) {
    const vMag = Math.sqrt(st.vx * st.vx + st.vy * st.vy);
    const lines = [
      { label: 't', val: Engine.fmt(st.t) + ' s',       color: C.tx2 },
      { label: 'x', val: Engine.fmt(st.x) + ' m',       color: C.vx },
      { label: 'y', val: Engine.fmt(st.y) + ' m',       color: C.vy_pos },
      { label: 'vx', val: Engine.fmt(st.vx) + ' m/s',  color: C.vx },
      { label: 'vy', val: Engine.fmt(st.vy) + ' m/s',  color: st.vy >= 0 ? C.vy_pos : C.vy_neg },
      { label: '|v|', val: Engine.fmt(vMag) + ' m/s',  color: C.v_res },
    ];

    const bx = PAD.left + 8;
    let   by = PAD.top + 14;
    ctx.font = '10px Space Mono, monospace';
    lines.forEach(l => {
      ctx.fillStyle = C.tx3;
      ctx.textAlign = 'right';
      ctx.fillText(l.label, bx + 22, by);
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.fillText(l.val, bx + 26, by);
      by += 14;
    });
  }

  // ── Flecha ────────────────────────────────────────────────
  function drawArrow(ctx, x1, y1, x2, y2, color, lw) {
    const dx  = x2 - x1;
    const dy  = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return;

    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Cabeza
    const angle   = Math.atan2(dy, dx);
    const headLen = Math.min(10, len * 0.35);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
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