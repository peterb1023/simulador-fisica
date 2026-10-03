// ============================================================
//  render.js  —  Canvas 2D SIM 08: Diagrama de Cuerpo Libre
//  Modo PLANO:
//    · Superficie con marcas de posición (se desplazan con st.x)
//    · Bloque centrado + diagrama de fuerzas
//    · Rastro corto del bloque
//    · Indicador x=0, marcas cada 2m, posición actual
//  Modo ELEVADOR:
//    · Bloque animado verticalmente
//    · Flecha W y T
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;
  let elevY  = 0;

  // px por metro en la escena (ajusta la velocidad de desplazamiento visual)
  const PX_PER_M = 28;
  // Intervalo de marcas en el suelo (metros de mundo real)
  const MARK_INTERVAL = 2;

  const C = {
    bg:        '#0a1628',
    grid:      'rgba(48,54,61,0.30)',
    suelo:     '#388bfd',
    sueloFill: 'rgba(56,139,253,0.08)',
    sueloBand: 'rgba(56,139,253,0.04)',
    markMain:  'rgba(56,139,253,0.60)',
    markSub:   'rgba(56,139,253,0.25)',
    origin:    'rgba(88,200,120,0.70)',
    trail:     'rgba(88,166,255,0.18)',
    bloque:    '#1c2d4a',
    bloqueB:   '#58a6ff',
    bloqueSh:  'rgba(88,166,255,0.25)',
    peso:      '#f85149',
    normal:    '#3fb950',
    fApp:      '#e3b341',
    fric:      '#a371f7',
    sumF:      '#ffffff',
    cuerda:    '#8b949e',
    tx1:       '#e6edf3',
    tx2:       '#8b949e',
    tx3:       '#484f58',
  };

  const BW = 56;
  const BH = 56;

  // Historial de posiciones del bloque en canvas (para trail)
  const trail = [];
  const TRAIL_LEN = 40;

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas], resize);
  }

  function resize() {
    [canvas].forEach(SimCanvas.resize);
  }

  // ── Flecha ────────────────────────────────────────────────
  function arrow(x1, y1, x2, y2, color, lw, dashed) {
    const dx  = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = lw || 2.5;
    if (dashed) ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    const ang = Math.atan2(dy, dx);
    const h   = Math.min(13, len * 0.3);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ── Label junto a una flecha ──────────────────────────────
  function label(text, x, y, color, align) {
    ctx.save();
    ctx.font      = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Cuadrícula de fondo (sutil) ───────────────────────────
  function drawGrid() {
    const W = canvas.logicalWidth, H = canvas.logicalHeight, step = 40;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  // ══════════════════════════════════════════════════════════
  //  MODO PLANO — con entorno desplazable
  // ══════════════════════════════════════════════════════════
  function drawPlano(st) {
    const W = canvas.logicalWidth;
    const H = canvas.logicalHeight;
    const th  = st.theta * Math.PI / 180;

    // Vectores unitarios del plano
    const tx =  Math.cos(th);   // paralelo al plano (dirección +x física)
    const ty = -Math.sin(th);
    const nx = -Math.sin(th);   // normal al plano (hacia arriba del plano)
    const ny = -Math.cos(th);

    // Punto de anclaje del plano en pantalla (posición del bloque proyectada)
    const cx = W / 2;
    const cy = H * 0.58;

    // ── El bloque siempre centrado en el canvas ────────────
    // El entorno (suelo, marcas) se desplaza según -st.x
    const offset = -st.x * PX_PER_M;  // píxeles de desplazamiento del entorno

    // Elevación sobre el plano (cuando la F levanta al bloque)
    const lift = 28 + Math.min(st.y * 10, H * 0.2);
    const bx   = cx + nx * lift;
    const by   = cy + ny * lift;

    // ── Plano con marcas de posición ──────────────────────
    ctx.save();
    // Transformar al sistema del plano: origen en el punto de contacto actual
    ctx.translate(bx - nx * lift, by - ny * lift);  // punto sobre el plano bajo el bloque
    ctx.rotate(-th);  // alinear con el plano

    // Franja de suelo
    ctx.fillStyle = C.sueloBand;
    ctx.fillRect(-W, 0, W * 2, 18);

    // Línea del plano
    ctx.strokeStyle = C.suelo;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(-W, 0);
    ctx.lineTo(W, 0);
    ctx.stroke();

    // Sombra del bloque sobre el plano
    ctx.shadowColor = C.bloqueSh;
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = 'rgba(56,139,253,0.12)';
    ctx.fillRect(-BW * 0.7, 0, BW * 1.4, 8);
    ctx.shadowBlur = 0;

    // Marcas de posición sobre el plano (se desplazan con offset)
    // En el sistema del plano: el bloque está en x=0 de pantalla, el mundo se mueve con 'offset'
    const markStart = -st.x; // posición en mundo real del lado izquierdo visible
    const firstMark = Math.ceil(markStart / MARK_INTERVAL) * MARK_INTERVAL - MARK_INTERVAL;
    const lastMark  = firstMark + (W / PX_PER_M) + MARK_INTERVAL * 2;

    ctx.font = '8px Space Mono, monospace';

    for (let m = firstMark; m <= lastMark; m += MARK_INTERVAL) {
      // posición en pantalla: offset del mundo + posición de la marca
      const screenX = (m + st.x) * PX_PER_M;

      // Marca principal (cada 2m)
      ctx.strokeStyle = m === 0 ? C.origin : C.markMain;
      ctx.lineWidth   = m === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(screenX, -10);
      ctx.lineTo(screenX, 0);
      ctx.stroke();

      // Etiqueta de posición
      ctx.fillStyle = m === 0 ? C.origin : C.markSub;
      ctx.textAlign = 'center';
      ctx.fillText(m === 0 ? 'x=0' : `${m}m`, screenX, -14);

      // Submarca entre marcas principales (cada 1m)
      const half = screenX + MARK_INTERVAL * PX_PER_M / 2;
      ctx.strokeStyle = C.markSub;
      ctx.lineWidth   = 0.7;
      ctx.beginPath();
      ctx.moveTo(half, -5);
      ctx.lineTo(half, 0);
      ctx.stroke();
    }

    // Textura de superficie (líneas diagonales desplazables)
    ctx.strokeStyle = 'rgba(56,139,253,0.12)';
    ctx.lineWidth   = 1;
    const diagSpacing = 20;
    const diagOffset  = ((st.x * PX_PER_M) % diagSpacing + diagSpacing) % diagSpacing;
    for (let dx = -W + diagOffset; dx < W + diagSpacing; dx += diagSpacing) {
      ctx.beginPath();
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx - 12, 18);
      ctx.stroke();
    }

    ctx.restore();

    // ── Rastro del bloque ─────────────────────────────────
    if (Math.abs(st.vx) > 0.05) {
      trail.push({ bx, by });
      if (trail.length > TRAIL_LEN) trail.shift();
    } else {
      trail.length = 0;
    }
    for (let i = 0; i < trail.length; i++) {
      const alpha = (i / TRAIL_LEN) * 0.5;
      const tp = trail[i];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = C.trail;
      ctx.translate(tp.bx, tp.by);
      ctx.rotate(-th);
      ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
      ctx.restore();
    }

    // ── Bloque ────────────────────────────────────────────
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-th);
    // Sombra
    ctx.shadowColor = C.bloqueSh;
    ctx.shadowBlur  = 16;
    // Relleno
    ctx.fillStyle   = C.bloque;
    ctx.beginPath();
    ctx.roundRect(-BW / 2, -BH / 2, BW, BH, 5);
    ctx.fill();
    // Borde
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = C.bloqueB;
    ctx.lineWidth   = 2;
    ctx.stroke();
    // Etiqueta de masa
    ctx.font      = 'bold 12px Syne, sans-serif';
    ctx.fillStyle = C.tx1;
    ctx.textAlign = 'center';
    ctx.fillText(`${Engine.fmt(st.m)} kg`, 0, 5);
    ctx.restore();

    // ── Indicador de velocidad (flecha sobre el bloque) ───
    if (Math.abs(st.vx) > 0.1) {
      const vDir  = Math.sign(st.vx);
      const vLen  = Math.min(Math.abs(st.vx) * 4, 50);
      const vx1   = bx;
      const vy1   = by - BH / 2 - 14;
      const vx2   = bx + tx * vLen * vDir;
      const vy2   = vy1 + ty * vLen * vDir;
      arrow(vx1, vy1, vx2, vy2, '#58a6ff', 2);
      label(`v=${Engine.fmt(st.vx)} m/s`, vx2 + 6, vy2 - 2, '#58a6ff');
    }

    // ── Vectores de fuerza ────────────────────────────────
    const scale = Math.min(W, H) * 0.2 / Math.max(st.w, st.F, st.n, Math.abs(st.sumFx), 1);

    const vector = (dx, dy, name, color) => {
      if (Math.hypot(dx, dy) < 1e-8) return;
      const ex = bx + dx * scale;
      const ey = by + dy * scale;
      arrow(bx, by, ex, ey, color, 2.5);
      label(name, ex + 5, ey - 5, color);
    };

    vector(0, st.w, `mg=${Engine.fmt(st.w)} N`, C.peso);
    vector(nx * st.n, ny * st.n, `N=${Engine.fmt(st.n)} N`, C.normal);
    vector(tx * st.Fx + nx * st.Fy, ty * st.Fx + ny * st.Fy, `F=${Engine.fmt(st.F)} N`, C.fApp);
    vector(tx * st.fricSigned, ty * st.fricSigned, `f=${Engine.fmt(st.fricSigned)} N (${st.regime})`, C.fric);
    vector(tx * st.sumFx + nx * st.sumFy, ty * st.sumFx + ny * st.sumFy, 'ΣF', C.sumF);

    // ── Indicadores de posición actuales ─────────────────
    label(`mg∥=${Engine.fmt(st.weightParallel)} N; mg⊥=${Engine.fmt(st.weightNormal)} N`, 12, 24, C.tx1);

    // Indicador de posición con barra de progreso relativa
    const xLabel = `x = ${Engine.fmt(st.x)} m`;
    const aLabel = `a = ${Engine.fmt(st.ax)} m/s²`;
    label(xLabel, 12, H - 42, C.tx1);
    label(aLabel, 12, H - 26, C.tx1);

    // Barra de desplazamiento (referencia visual de cuánto se ha movido)
    const barW   = Math.min(W * 0.35, 160);
    const barH   = 6;
    const barX   = W - barW - 14;
    const barY   = H - 24;
    const tMax   = Engine.getState().tMax;
    const tNorm  = Math.min(st.t / tMax, 1);
    ctx.fillStyle = 'rgba(56,139,253,0.12)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 3); ctx.fill();
    if (tNorm > 0) {
      ctx.fillStyle = '#58a6ff';
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * tNorm, barH, 3); ctx.fill();
    }
    label('t', barX - 12, barY + barH - 1, C.tx2);
    label(`${Engine.fmt(tMax)}s`, barX + barW + 4, barY + barH - 1, C.tx3);

    // Estado del movimiento
    const moving   = Math.abs(st.vx) > 0.05;
    const stateStr = st.y > 0
      ? 'Sin contacto'
      : moving
        ? (st.vx > 0 ? '→ desliza (+x)' : '← desliza (−x)')
        : st.regime === 'cinética' ? '→ desliza' : '◼ reposo';
    label(stateStr, W - 14, H - 42, moving ? '#58a6ff' : C.tx2, 'right');
  }

  // ══════════════════════════════════════════════════════════
  //  MODO ELEVADOR
  // ══════════════════════════════════════════════════════════
  function drawElevador(st) {
    const W  = canvas.logicalWidth;
    const H  = canvas.logicalHeight;

    elevY = H * (0.4 - 0.25 * Math.tanh(st.x / 10));

    const bcx = W / 2;
    const bcy = elevY + BH / 2;
    const bx  = bcx - BW / 2;
    const by  = elevY;

    // Cuerda desde techo
    ctx.strokeStyle = C.cuerda;
    ctx.lineWidth   = 3;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(bcx, 0);
    ctx.lineTo(bcx, by);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tensión T (hacia arriba)
    const tLen = Math.min(st.T * 0.5, 120);
    arrow(bcx, by, bcx, by - tLen, C.normal, 3);
    label(`T=${Engine.fmt(st.T)}N`, bcx + 8, by - tLen * 0.5, C.normal);

    // Peso W (hacia abajo)
    const wLen = Math.min(st.w * 0.5, 120);
    arrow(bcx, by + BH, bcx, by + BH + wLen, C.peso, 3);
    label(`W=${Engine.fmt(st.w)}N`, bcx + 8, by + BH + wLen * 0.5, C.peso);

    // Bloque
    ctx.shadowColor = C.bloqueSh;
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = C.bloque;
    ctx.strokeStyle = C.bloqueB;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, BW, BH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font      = 'bold 13px Syne, sans-serif';
    ctx.fillStyle = C.tx1;
    ctx.textAlign = 'center';
    ctx.fillText(`${Engine.fmt(st.m)} kg`, bcx, bcy + 5);

    // Indicador de estado
    let aStr, aColor;
    if (Math.abs(st.ay) < 0.1) {
      aStr   = '⏸ Equilibrio  ay = 0';
      aColor = C.normal;
    } else if (st.ay > 0) {
      aStr   = `↑ Sube  ay = ${Engine.fmt(st.ay)} m/s²`;
      aColor = C.normal;
    } else {
      aStr   = `↓ Baja  ay = ${Engine.fmt(st.ay)} m/s²`;
      aColor = C.peso;
    }
    ctx.font      = 'bold 12px Space Mono, monospace';
    ctx.fillStyle = aColor;
    ctx.textAlign = 'center';
    ctx.fillText(aStr, W / 2, H * 0.92);

    ctx.font      = '10px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`T = m(g + ay) = ${Engine.fmt(st.m)}(9.8 + ${Engine.fmt(st.ay)})`, W / 2, H * 0.92 + 18);
  }

  // ══════════════════════════════════════════════════════════
  //  DRAW PRINCIPAL
  // ══════════════════════════════════════════════════════════
  function draw(st) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);
    drawGrid();

    if (st.modo === 'plano') {
      drawPlano(st);
    } else {
      drawElevador(st);
    }

    if (st.modo === 'elevador') drawHUD(st);
  }

  // ── HUD (solo elevador) ───────────────────────────────────
  function drawHUD(st) {
    const lines = [
      { label: 'm',  val: Engine.fmt(st.m)  + ' kg',   color: '#e6edf3' },
      { label: 'T',  val: Engine.fmt(st.T)  + ' N',    color: '#3fb950' },
      { label: 'W',  val: Engine.fmt(st.w)  + ' N',    color: '#f85149' },
      { label: 'ay', val: Engine.fmt(st.ay) + ' m/s²', color: '#e6edf3' },
    ];
    const bx = 14;
    let   by = 22;
    ctx.font = '10px Space Mono, monospace';
    lines.forEach(l => {
      ctx.fillStyle = '#484f58';
      ctx.textAlign = 'right';
      ctx.fillText(l.label, bx + 28, by);
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.fillText(l.val, bx + 32, by);
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