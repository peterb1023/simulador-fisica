// ============================================================
//  render.js  —  Canvas 2D SIM 08: Diagrama de Cuerpo Libre
//  Modo PLANO:
//    · Superficie con textura
//    · Bloque deslizando (animado con ax)
//    · Flecha W (peso, abajo)
//    · Flecha N (normal, arriba)
//    · Flecha F (aplicada, con ángulo φ)
//    · Flecha fk (fricción, opuesta a v) [AGREGADA]
//    · Flecha ΣF resultante (dorada)
//    · Etiquetas de cada fuerza
//  Modo ELEVADOR:
//    · Bloque colgando de cuerda
//    · Flecha W (abajo) y T (arriba)
//    · Indicador de movimiento
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;
  let elevY  = 0;   // posición vertical del bloque en el elevador (canvas px)

  const C = {
    bg:        '#0a1628',
    grid:      'rgba(48,54,61,0.35)',
    suelo:     'rgba(88,166,255,0.3)',
    sueloFill: 'rgba(88,166,255,0.05)',
    bloque:    '#1c2d4a',
    bloqueB:   '#58a6ff',
    peso:      '#f85149',   // W — rojo
    normal:    '#3fb950',   // N — verde
    fApp:      '#e3b341',   // F aplicada — dorado
    fric:      '#a371f7',   // fk — violeta [AGREGADA]
    sumF:      '#ffffff',   // ΣF resultante — blanco
    cuerda:    '#8b949e',
    tx1:       '#e6edf3',
    tx2:       '#8b949e',
    tx3:       '#484f58',
  };

  // Tamaño del bloque en px
  const BW = 60;
  const BH = 60;

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
    elevY = canvas.height * 0.3;
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

  // ── Cuadrícula ────────────────────────────────────────────
  function drawGrid() {
    const W = canvas.width, H = canvas.height, step = 40;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  // ══════════════════════════════════════════════════════════
  //  MODO PLANO
  // ══════════════════════════════════════════════════════════
  function drawPlano(st) {
    const W  = canvas.width;
    const H  = canvas.height;
    const groundY = H * 0.65;

    // Suelo
    ctx.fillStyle = C.sueloFill;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = C.suelo;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Marcas de suelo (hatching)
    ctx.strokeStyle = 'rgba(88,166,255,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 10, groundY + 12);
      ctx.stroke();
    }

    // Posición del bloque en canvas (mapeo: 1m ≈ 35px, centrado en W/2)
    const scale  = 35;
    const bx     = W / 2 + st.x * scale - BW / 2;
    const by     = groundY - BH;

    // Centro del bloque
    const bcx = bx + BW / 2;
    const bcy = by + BH / 2;

    // ── Fricción (si activa) — AGREGADA ──────────────────
    // Dirección opuesta a vx (o a F si vx == 0)
    if (st.fric > 0) {
      const fricDir = st.vx >= 0 ? -1 : 1;
      const fricLen = Math.min(st.fric * 0.8, 90);
      const fricX2  = bcx + fricDir * fricLen;
      arrow(bcx, groundY - BH / 2, fricX2, groundY - BH / 2, C.fric, 2.5);
      label(`fk=${Engine.fmt(st.fric)}N`, fricX2 + (fricDir > 0 ? 6 : -6), groundY - BH / 2 - 8,
            C.fric, fricDir > 0 ? 'left' : 'right');

      // Badge [AGREGADA]
      ctx.save();
      ctx.font      = '8px Space Mono, monospace';
      ctx.fillStyle = C.fric;
      ctx.textAlign = fricDir > 0 ? 'left' : 'right';
      ctx.fillText('[AGREGADA]', fricX2 + (fricDir > 0 ? 6 : -6), groundY - BH / 2 + 4);
      ctx.restore();
    }

    // ── Peso W (hacia abajo) ──────────────────────────────
    const wLen = Math.min(st.w * 0.5, 100);
    arrow(bcx, by + BH, bcx, by + BH + wLen, C.peso, 2.5);
    label(`W=${Engine.fmt(st.w)}N`, bcx + 6, by + BH + wLen * 0.55, C.peso);

    // ── Normal N (hacia arriba) ───────────────────────────
    const nLen = Math.min(st.n * 0.5, 100);
    arrow(bcx, by, bcx, by - nLen, C.normal, 2.5);
    label(`N=${Engine.fmt(st.n)}N`, bcx + 6, by - nLen * 0.5, C.normal);

    // ── F aplicada (con ángulo φ) ─────────────────────────
    const phi_rad = st.phi * Math.PI / 180;
    const fLen    = Math.min(st.F * 0.7, 110);
    const fTipX   = bcx + Math.cos(phi_rad) * fLen;
    const fTipY   = bcy - Math.sin(phi_rad) * fLen;
    arrow(bcx, bcy, fTipX, fTipY, C.fApp, 3);
    label(`F=${Engine.fmt(st.F)}N`, fTipX + 8, fTipY - 4, C.fApp);

    // Arco del ángulo φ
    if (st.phi > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(227,179,65,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bcx, bcy, 22, -phi_rad, 0);
      ctx.stroke();
      ctx.font      = '9px Space Mono, monospace';
      ctx.fillStyle = C.fApp;
      ctx.textAlign = 'left';
      ctx.fillText(`${st.phi}°`, bcx + 26, bcy + 4);
      ctx.restore();
    }

    // ── ΣF resultante (si ax ≠ 0) ────────────────────────
    if (Math.abs(st.ax) > 0.05) {
      const sumLen = Math.min(Math.abs(st.sumFx) * 0.7, 100);
      const sumDir = st.sumFx >= 0 ? 1 : -1;
      arrow(bcx, bcy + BH * 0.1, bcx + sumDir * sumLen, bcy + BH * 0.1, C.sumF, 3);
      label(`ΣF=${Engine.fmt(st.sumFx)}N`, bcx + sumDir * (sumLen + 8), bcy + BH * 0.1 + 4,
            C.sumF, sumDir > 0 ? 'left' : 'right');
    }

    // ── Bloque ────────────────────────────────────────────
    // Sombra
    ctx.shadowColor = 'rgba(88,166,255,0.15)';
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = C.bloque;
    ctx.strokeStyle = C.bloqueB;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, BW, BH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Masa dentro del bloque
    ctx.font      = 'bold 13px Syne, sans-serif';
    ctx.fillStyle = C.tx1;
    ctx.textAlign = 'center';
    ctx.fillText(`${Engine.fmt(st.m)} kg`, bcx, bcy + 5);

    // ── Indicador de aceleración (texto debajo del bloque) ─
    const aText = Math.abs(st.ax) < 0.01
      ? '⚖ Equilibrio  a = 0'
      : `a = ${Engine.fmt(st.ax)} m/s²  ${st.ax > 0 ? '→' : '←'}`;
    ctx.font      = 'bold 12px Space Mono, monospace';
    ctx.fillStyle = Math.abs(st.ax) < 0.01 ? C.normal : C.sumF;
    ctx.textAlign = 'center';
    ctx.fillText(aText, W / 2, groundY + 30);

    // ── Velocidad actual ──────────────────────────────────
    ctx.font      = '10px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`v = ${Engine.fmt(st.vx)} m/s`, W / 2, groundY + 46);
  }

  // ══════════════════════════════════════════════════════════
  //  MODO ELEVADOR
  // ══════════════════════════════════════════════════════════
  function drawElevador(st) {
    const W  = canvas.width;
    const H  = canvas.height;

    // Animar posición vertical del bloque según ay
    // Ventana visual acotada, posición física consultable sin depender de frames.
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

    // ── Tensión T (hacia arriba) ──────────────────────────
    const tLen = Math.min(st.T * 0.5, 120);
    arrow(bcx, by, bcx, by - tLen, C.normal, 3);
    label(`T=${Engine.fmt(st.T)}N`, bcx + 8, by - tLen * 0.5, C.normal);

    // ── Peso W (hacia abajo) ──────────────────────────────
    const wLen = Math.min(st.w * 0.5, 120);
    arrow(bcx, by + BH, bcx, by + BH + wLen, C.peso, 3);
    label(`W=${Engine.fmt(st.w)}N`, bcx + 8, by + BH + wLen * 0.5, C.peso);

    // ── Bloque ────────────────────────────────────────────
    ctx.shadowColor = 'rgba(88,166,255,0.15)';
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

    // ── Indicador de estado ───────────────────────────────
    let aStr, aColor;
    if (Math.abs(st.ay) < 0.1) {
      aStr   = '⚖ Equilibrio  ay = 0';
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

    // Fórmula de tensión en vivo
    ctx.font      = '10px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`T = m(g + ay) = ${Engine.fmt(st.m)}(9.8 + ${Engine.fmt(st.ay)})`, W / 2, H * 0.92 + 18);
  }

  // ════════════════════════════════════════════════════════
  //  DRAW PRINCIPAL
  // ════════════════════════════════════════════════════════
  function draw(st) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    if (st.modo === 'plano') {
      drawPlano(st);
    } else {
      drawElevador(st);
    }

    drawHUD(st);
  }

  // ── HUD ───────────────────────────────────────────────────
  function drawHUD(st) {
    const lines = st.modo === 'plano'
      ? [
          { label: 'm',    val: Engine.fmt(st.m)     + ' kg',   color: '#e6edf3' },
          { label: 'F',    val: Engine.fmt(st.F)      + ' N',    color: '#e3b341' },
          { label: 'φ',    val: st.phi                + '°',     color: '#e3b341' },
          { label: 'N',    val: Engine.fmt(st.n)      + ' N',    color: '#3fb950' },
          { label: 'W',    val: Engine.fmt(st.w)      + ' N',    color: '#f85149' },
          { label: 'fk',   val: Engine.fmt(st.fric)   + ' N',    color: '#a371f7' },
          { label: 'ax',   val: Engine.fmt(st.ax)     + ' m/s²', color: '#e6edf3' },
        ]
      : [
          { label: 'm',    val: Engine.fmt(st.m)  + ' kg',   color: '#e6edf3' },
          { label: 'T',    val: Engine.fmt(st.T)  + ' N',    color: '#3fb950' },
          { label: 'W',    val: Engine.fmt(st.w)  + ' N',    color: '#f85149' },
          { label: 'ay',   val: Engine.fmt(st.ay) + ' m/s²', color: '#e6edf3' },
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