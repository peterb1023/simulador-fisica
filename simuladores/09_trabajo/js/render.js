// ============================================================
//  render.js  —  Canvas: escena de trabajo + gráfica F(s) (SIM 09)
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvasMain, ctxMain;
  let canvasGraph, ctxGraph;
  let animId = null;

  const C = {
    bg:      '#0a1628',
    panel:   '#0d1117',
    grid:    'rgba(48,54,61,0.5)',
    axis:    'rgba(88,166,255,0.35)',
    tx2:     '#8b949e',
    tx3:     '#484f58',
    obj:     '#58a6ff',
    objGlow: 'rgba(88,166,255,0.2)',
    fuerza:  '#e3b341',     // flecha de F
    comp:    '#58a6ff',     // componente horizontal
    perp:    '#f85149',     // componente perpendicular
    trail:   'rgba(88,166,255,0.15)',
    work:    '#3fb950',     // área de trabajo (W)
    spring:  '#bd93f9',     // resorte
    zero:    'rgba(248,81,73,0.4)',
  };

  // ── Setup ────────────────────────────────────────────
  function init() {
    canvasMain  = document.getElementById('canvasMain');
    canvasGraph = document.getElementById('canvasGraph');
    ctxMain     = canvasMain.getContext('2d');
    ctxGraph    = canvasGraph.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    [canvasMain, canvasGraph].forEach(c => {
      c.width  = c.offsetWidth  || c.parentElement.offsetWidth;
      c.height = c.offsetHeight || c.parentElement.offsetHeight;
    });
  }

  // ════════════════════════════════════════════════════
  //  ESCENA PRINCIPAL
  // ════════════════════════════════════════════════════
  function drawMain(st) {
    const W = canvasMain.width;
    const H = canvasMain.height;
    const ctx = ctxMain;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    if (st.modo === 'fuerza') {
      drawFuerzaScene(ctx, W, H, st);
    } else {
      drawResorteScene(ctx, W, H, st);
    }
  }

  // ── Escena: Fuerza con ángulo ─────────────────────
  function drawFuerzaScene(ctx, W, H, st) {
    const c = st.calc;
    const floorY  = H * 0.68;
    const marginL = 60;
    const marginR = 50;
    const trackW  = W - marginL - marginR;

    // Piso con textura
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, floorY, W, H - floorY);
    // Rayado diagonal del piso
    ctx.strokeStyle = 'rgba(48,54,61,0.4)';
    ctx.lineWidth = 1;
    for (let x = -H; x < W + H; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + H * 0.5, floorY + H * 0.5);
      ctx.stroke();
    }

    // Línea de referencia del piso
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginL, floorY);
    ctx.lineTo(W - marginR, floorY);
    ctx.stroke();

    // Marcas de distancia en el piso
    ctx.font = '9px Space Mono, monospace';
    ctx.fillStyle = C.tx3;
    ctx.textAlign = 'center';
    const pxPerM = trackW / st.s;
    for (let m = 0; m <= st.s; m += Math.ceil(st.s / 8)) {
      const px = marginL + m * pxPerM;
      ctx.fillStyle = C.tx3;
      ctx.fillRect(px, floorY, 1, 6);
      ctx.fillStyle = C.tx2;
      ctx.fillText(m + 'm', px, floorY + 18);
    }
    ctx.textAlign = 'left';

    // ── Trail ──
    const trailLen = Math.min(st.histFs.length, 40);
    for (let i = 1; i < trailLen; i++) {
      const p = st.histFs[st.histFs.length - trailLen + i];
      const px = marginL + p.s * pxPerM;
      const alpha = i / trailLen * 0.35;
      ctx.beginPath();
      ctx.arc(px, floorY - 15, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(88,166,255,${alpha})`;
      ctx.fill();
    }

    // Posición del objeto
    const objPx  = marginL + st.sActual * pxPerM;
    const objSz  = 28;
    const objY   = floorY - objSz;
    const objCX  = objPx + objSz / 2;
    const objCY  = objY + objSz / 2;

    // Sombreado debajo del objeto (trabajo realizado)
    if (st.sActual > 0) {
      ctx.fillStyle = 'rgba(63,185,80,0.07)';
      ctx.fillRect(marginL, floorY - 4, st.sActual * pxPerM, 4);
    }

    // Distancia recorrida
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.fillStyle = C.work;
    ctx.textAlign = 'center';
    if (st.sActual > 0.3) {
      ctx.fillText(`s = ${Engine.fmt(st.sActual)} m`, marginL + st.sActual * pxPerM / 2, floorY - 8);
    }
    ctx.textAlign = 'left';

    // Objeto (caja)
    ctx.fillStyle = C.obj;
    ctx.shadowColor = C.objGlow;
    ctx.shadowBlur = 18;
    ctx.fillRect(objPx, objY, objSz, objSz);
    ctx.shadowBlur = 0;

    // Borde interior de la caja
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(objPx + 2, objY + 2, objSz - 4, objSz - 4);

    // ── Flecha de fuerza F (con ángulo φ) ──────────
    const phiRad  = st.phi * Math.PI / 180;
    const fScale  = 1.2; // px por N
    const fLen    = Math.min(st.F * fScale, 90);

    const fx = objCX - fLen * Math.cos(phiRad);  // origin hacia atrás
    const fy = objCY + fLen * Math.sin(phiRad);

    // Línea de la fuerza
    drawArrow(ctx, fx, fy, objCX, objCY, C.fuerza, 2.5, 10);

    // Etiqueta F
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.fuerza;
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${Engine.fmt(st.F)} N`, fx - 14, fy + 16);
    ctx.textAlign = 'left';

    // ── Componente horizontal (F·cosφ) ─────────────
    if (st.phi > 0) {
      const fhLen = fLen * Math.cos(phiRad);
      drawArrow(ctx, fx, objCY, objCX, objCY, C.comp, 1.5, 8, [4, 3]);

      // Arco del ángulo φ
      ctx.strokeStyle = C.fuerza;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(objCX, objCY, 22, Math.PI, Math.PI + phiRad);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label φ
      ctx.font = '10px Space Mono, monospace';
      ctx.fillStyle = C.fuerza;
      const midAngle = Math.PI + phiRad / 2;
      ctx.fillText(`φ=${st.phi}°`, objCX + Math.cos(midAngle) * 32 - 14, objCY + Math.sin(midAngle) * 28);
    }

    // ── Labels encima del objeto ────────────────────
    const Wactual = st.calc.Fcomp * st.sActual;
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.work;
    ctx.textAlign = 'center';
    ctx.fillText(`W_ext = ΔU = ${Engine.fmt(Wactual)} J`, objCX, objY - 26);

    ctx.font = '10px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`F·cosφ = ${Engine.fmt(st.calc.Fcomp)} N`, objCX, objY - 12);
    ctx.textAlign = 'left';

    // ── Tiempo / info ─────────────────────────────
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`s = ${Engine.fmt(st.sActual)} / ${Engine.fmt(st.s)} m`, marginL, 22);
  }

  // ── Escena: Resorte ────────────────────────────────
  function drawResorteScene(ctx, W, H, st) {
    const c = st.calc;
    const wallX   = 80;
    const floorY  = H * 0.65;
    const restX   = wallX + 60;   // posición natural del extremo del resorte
    const maxStretch = W * 0.5;
    const stretchPx  = st.sActual * maxStretch / 2;

    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, floorY, W, H - floorY);
    ctx.strokeStyle = 'rgba(48,54,61,0.4)';
    ctx.lineWidth = 1;
    for (let x = -H; x < W + H; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, floorY); ctx.lineTo(x + H * 0.4, H); ctx.stroke();
    }

    // Pared
    ctx.fillStyle = '#21262d';
    ctx.fillRect(0, floorY - H * 0.4, wallX, H * 0.4);
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX, floorY - H * 0.4);
    ctx.lineTo(wallX, floorY);
    ctx.stroke();

    // Línea de referencia (posición natural)
    ctx.strokeStyle = 'rgba(248,81,73,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(restX, floorY - H * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);

    const springEndX = restX + stretchPx;
    const springY    = floorY - H * 0.2;
    const objSz      = 36;
    const objX       = springEndX;
    const objY       = springY - objSz / 2;

    // Área de trabajo del resorte (sombreado)
    if (st.sActual > 0) {
      ctx.fillStyle = 'rgba(189,147,249,0.08)';
      ctx.fillRect(restX, springY - 5, stretchPx, 10);
    }

    // ── Dibujo del resorte (zigzag) ─────────────
    drawSpring(ctx, wallX, springY, springEndX, springY, 12, C.spring);

    // Objeto (caja)
    ctx.fillStyle = C.spring;
    ctx.shadowColor = 'rgba(189,147,249,0.3)';
    ctx.shadowBlur = 16;
    ctx.fillRect(objX, objY, objSz, objSz);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(objX + 2, objY + 2, objSz - 4, objSz - 4);

    // Flecha de fuerza del resorte (hacia izquierda → restitución)
    const fSpring = st.k * st.sActual;
    if (fSpring > 0.5) {
      const arrowLen = Math.min(fSpring * 0.6, 60);
      drawArrow(ctx, objX + objSz + arrowLen, springY, objX + objSz, springY, C.fuerza, 2, 9);
      ctx.font = 'bold 10px Space Mono, monospace';
      ctx.fillStyle = C.fuerza;
      ctx.fillText(`F_resorte = −${Engine.fmt(fSpring)} N`, objX + objSz + 6, springY - 10);
    }

    // Labels
    const Wactual = 0.5 * st.k * st.sActual * st.sActual;
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.spring;
    ctx.textAlign = 'center';
    ctx.fillText(`W_ext = ΔU = ${Engine.fmt(Wactual)} J`, objX + objSz / 2, objY - 24);
    ctx.font = '10px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`x = ${Engine.fmt(st.sActual)} m`, objX + objSz / 2, objY - 10);
    ctx.textAlign = 'left';

    // Info
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`k = ${Engine.fmt(st.k)} N/m   x = ${Engine.fmt(st.sActual)}/${Engine.fmt(st.x)} m`, wallX + 10, 22);
  }

  function drawSpring(ctx, x1, y, x2, _, coils, color) {
    const len    = x2 - x1;
    const nCoils = coils;
    const amp    = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    const step = len / (nCoils * 2 + 2);
    ctx.lineTo(x1 + step, y);
    for (let i = 0; i < nCoils; i++) {
      const bx = x1 + step + i * step * 2;
      ctx.lineTo(bx + step * 0.5, y - amp);
      ctx.lineTo(bx + step,       y + amp);
      ctx.lineTo(bx + step * 1.5, y - amp);
      ctx.lineTo(bx + step * 2,   y);
    }
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, lw, headSize, dash=[]) {
    const dx   = x2 - x1;
    const dy   = y2 - y1;
    const len  = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (len > headSize) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headSize * Math.cos(angle - 0.4), y2 - headSize * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - headSize * Math.cos(angle + 0.4), y2 - headSize * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }
  }

  // ════════════════════════════════════════════════════
  //  GRÁFICA F(s)
  // ════════════════════════════════════════════════════
  function drawGraph(st) {
    const canvas = canvasGraph;
    const ctx    = ctxGraph;
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 20, right: 16, bottom: 32, left: 50 };
    const gW  = W - PAD.left - PAD.right;
    const gH  = H - PAD.top  - PAD.bottom;

    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, W, H);

    const hist = st.histFs;
    if (hist.length < 2) return;

    const maxS  = st.modo === 'fuerza' ? st.s  : st.x;
    const maxF  = st.modo === 'fuerza' ? st.calc.Fcomp * 1.2 : st.k * st.x * 1.2;
    const minF  = 0;

    const toX = s  => PAD.left + (s / maxS) * gW;
    const toY = fs => PAD.top  + (1 - (fs - minF) / (maxF - minF + 0.001)) * gH;

    // Grid
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const px = PAD.left + (i / 5) * gW;
      ctx.beginPath(); ctx.moveTo(px, PAD.top); ctx.lineTo(px, PAD.top + gH); ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const py = PAD.top + (i / 4) * gH;
      ctx.beginPath(); ctx.moveTo(PAD.left, py); ctx.lineTo(PAD.left + gW, py); ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + gH);
    ctx.lineTo(PAD.left + gW, PAD.top + gH);
    ctx.stroke();

    // Área bajo la curva = W
    const lineColor = st.modo === 'resorte' ? C.spring : C.fuerza;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(0));
    hist.forEach(p => ctx.lineTo(toX(p.s), toY(p.Fs)));
    ctx.lineTo(toX(hist[hist.length - 1].s), toY(0));
    ctx.closePath();
    ctx.fillStyle = lineColor + '28';
    ctx.fill();

    // Curva
    ctx.beginPath();
    hist.forEach((p, i) => {
      const px = toX(p.s);
      const py = toY(p.Fs);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Punto actual
    const last = hist[hist.length - 1];
    ctx.beginPath();
    ctx.arc(toX(last.s), toY(last.Fs), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = C.panel;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Línea vertical cursor
    ctx.strokeStyle = 'rgba(88,166,255,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(toX(last.s), PAD.top);
    ctx.lineTo(toX(last.s), PAD.top + gH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label del área
    const Wactual = st.modo === 'fuerza'
      ? st.calc.Fcomp * st.sActual
      : 0.5 * st.k * st.sActual * st.sActual;

    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.fillStyle = C.work;
    ctx.textAlign = 'center';
    ctx.fillText(`Área = W = ${Engine.fmt(Wactual)} J`, PAD.left + gW / 2, PAD.top + 14);
    ctx.textAlign = 'left';

    // Labels ejes
    ctx.font = '8px Space Mono, monospace';
    ctx.fillStyle = C.tx3;
    // Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = minF + (i / 4) * (maxF - minF);
      const py  = PAD.top + (1 - i / 4) * gH;
      ctx.fillText(Engine.fmt(val), PAD.left - 4, py + 3);
    }
    // X
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const val = (i / 5) * maxS;
      const px  = PAD.left + (i / 5) * gW;
      const unit = st.modo === 'fuerza' ? 'm' : 'm';
      ctx.fillText(Engine.fmt(val) + unit, px, PAD.top + gH + 14);
    }
    ctx.textAlign = 'left';

    // Ejes labels
    ctx.save();
    ctx.translate(10, PAD.top + gH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = lineColor;
    ctx.font = 'bold 9px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F (N)', 0, 0);
    ctx.restore();
    ctx.fillStyle = C.tx3;
    ctx.font = 'bold 9px Syne, sans-serif';
    ctx.fillText(st.modo === 'fuerza' ? 's (m)' : 'x (m)', PAD.left + gW + 4, PAD.top + gH + 4);
  }

  // ── Frame ──────────────────────────────────────────
  function frame() {
    const st = Engine.getState();
    Engine.step(clock.tick());

    drawMain(st);
    drawGraph(st);
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