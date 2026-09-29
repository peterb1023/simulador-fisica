// ============================================================
//  render.js  —  Canvas: pista + gráficas x(t) y v(t) (SIM 04)
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvasMain, ctxMain;
  let canvasX,    ctxX;
  let canvasV,    ctxV;
  let animId = null;

  const C = {
    bg:       '#0a1628',
    panel:    '#0d1117',
    grid:     'rgba(48,54,61,0.5)',
    axis:     'rgba(88,166,255,0.4)',
    tx2:      '#8b949e',
    tx3:      '#484f58',
    obj:      '#58a6ff',
    objGlow:  'rgba(88,166,255,0.25)',
    lineX:    '#e3b341',
    lineV:    '#3fb950',
    zero:     'rgba(248,81,73,0.5)',
    tCursor:  'rgba(88,166,255,0.6)',
    x0mark:   'rgba(227,179,65,0.5)',
  };

  // ── Setup ────────────────────────────────────────────────
  function init() {
    canvasMain = document.getElementById('canvasMain');
    canvasX    = document.getElementById('canvasX');
    canvasV    = document.getElementById('canvasV');
    ctxMain    = canvasMain.getContext('2d');
    ctxX       = canvasX.getContext('2d');
    ctxV       = canvasV.getContext('2d');
    resize();
    SimCanvas.observe([canvasMain,canvasX,canvasV],resize);
  }

  function resize() {
    [canvasMain,canvasX,canvasV].forEach(SimCanvas.resize);
  }

  // ════════════════════════════════════════════════════════
  //  PISTA DEL OBJETO  (cámara sigue al objeto)
  // ════════════════════════════════════════════════════════
  function drawMain(st) {
    const W   = canvasMain.logicalWidth;
    const H   = canvasMain.logicalHeight;
    const ctx = ctxMain;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    const railY  = H * 0.55;
    const railH  = 4;
    const margin = 44;

    // ── Cámara que sigue al objeto ───────────────────────
    // 60 m visibles alrededor del objeto
    const visRange = 60;
    const pxPerM   = (W - margin * 2) / visRange;
    const objPxX   = W * 0.45;                    // objeto siempre al 45%
    const originPx = objPxX - st.x * pxPerM;      // dónde cae x=0 en pantalla

    // ── Sombra + Riel ────────────────────────────────────
    ctx.fillStyle = 'rgba(88,166,255,0.04)';
    ctx.fillRect(margin, railY - 2, W - margin * 2, railH + 4);
    ctx.fillStyle = C.axis;
    ctx.fillRect(margin, railY, W - margin * 2, railH);

    // ── Marcas de escala (posiciones absolutas) ───────────
    const visL   = (margin - originPx) / pxPerM;
    const visR   = (W - margin - originPx) / pxPerM;
    const step   = 10;
    const mStart = Math.ceil(visL  / step) * step;
    const mEnd   = Math.floor(visR / step) * step;

    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'center';
    for (let m = mStart; m <= mEnd; m += step) {
      const px = originPx + m * pxPerM;
      ctx.fillStyle = (m === 0) ? 'rgba(248,81,73,0.55)' : C.tx3;
      ctx.fillRect(px - 0.5, railY - 5, 1, 5 + railH + 5);
      ctx.fillStyle = (m === 0) ? 'rgba(248,81,73,0.7)' : C.tx2;
      ctx.fillText(m, px, railY + railH + 15);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = C.tx3;
    ctx.fillText('m', W - margin + 6, railY + railH + 15);

    // ── Línea x=0 ────────────────────────────────────────
    const zeroPx = originPx;
    if (zeroPx > margin && zeroPx < W - margin) {
      ctx.strokeStyle = 'rgba(248,81,73,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(zeroPx, railY - 22);
      ctx.lineTo(zeroPx, railY + railH + 22);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Marcador x₀ (posición inicial) ──────────────────
    const x0Px = originPx + st.x0 * pxPerM;
    if (x0Px > margin && x0Px < W - margin) {
      ctx.strokeStyle = C.x0mark;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x0Px, railY - 18);
      ctx.lineTo(x0Px, railY + railH + 18);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px Space Mono, monospace';
      ctx.fillStyle = C.x0mark;
      ctx.textAlign = 'center';
      ctx.fillText('x₀', x0Px, railY - 23);
      ctx.textAlign = 'left';
    }

    // ── Trail (historial de posiciones) ──────────────────
    if (st.histX.length > 1) {
      const trail = st.histX.slice(-80);
      trail.forEach((p, i) => {
        const alpha = (i / trail.length) * 0.38;
        const px = originPx + p.x * pxPerM;
        if (px < margin || px > W - margin) return;
        ctx.beginPath();
        ctx.arc(px, railY + railH / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(88,166,255,${alpha})`;
        ctx.fill();
      });
    }

    // ── Objeto ────────────────────────────────────────────
    const objR = 14;
    const objY = railY + railH / 2;

    // Sombra en el riel
    ctx.beginPath();
    ctx.ellipse(objPxX, railY + railH + 3, objR * 0.75, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Glow
    const grd = ctx.createRadialGradient(objPxX, objY, 0, objPxX, objY, objR * 2.5);
    grd.addColorStop(0, C.objGlow);
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(objPxX, objY, objR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Círculo principal
    ctx.beginPath();
    ctx.arc(objPxX, objY, objR, 0, Math.PI * 2);
    ctx.fillStyle = C.obj;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(objPxX, objY, objR - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Flecha de velocidad ───────────────────────────────
    const vLen = Math.sign(st.v) * Math.min(Math.abs(st.v) * pxPerM * 0.55, 90);
    if (Math.abs(vLen) > 2) {
      drawVArrow(ctx, objPxX, objY - objR - 8, vLen, C.lineV);
    }

    // ── Etiquetas encima del objeto ───────────────────────
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.obj;
    ctx.fillText(`x = ${Engine.fmt(st.x)} m`, objPxX, objY - objR - 26);
    ctx.fillStyle = C.lineV;
    ctx.fillText(`v = ${Engine.fmt(st.v)} m/s`, objPxX, objY - objR - 42);
    ctx.textAlign = 'left';

    // ── Tiempo en esquina superior izquierda ──────────────
    ctx.font = 'bold 12px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`t = ${st.t.toFixed(2)} s`, margin, 22);

    if (st.modoCaida) {
      ctx.font = '10px Syne, sans-serif';
      ctx.fillStyle = '#f85149';
      ctx.fillText('↓ CAÍDA LIBRE  g = 9.8 m/s²', margin, 38);
    }
  }

  function drawVArrow(ctx, x, y, len, color) {
    const dir    = len > 0 ? 1 : -1;
    const absLen = Math.abs(len);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * absLen, y);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + dir * absLen,           y);
    ctx.lineTo(x + dir * (absLen - 8), y - 5);
    ctx.lineTo(x + dir * (absLen - 8), y + 5);
    ctx.closePath();
    ctx.fill();
  }

  // ════════════════════════════════════════════════════════
  //  GRÁFICA GENÉRICA
  // ════════════════════════════════════════════════════════
  function drawGraph(canvas, ctx, hist, color, labelY, st) {
    const W   = canvas.logicalWidth;
    const H   = canvas.logicalHeight;
    const PAD = { top: 18, right: 14, bottom: 28, left: 44 };
    const gW  = W - PAD.left - PAD.right;
    const gH  = H - PAD.top  - PAD.bottom;

    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, W, H);

    if (hist.length < 2) return;

    const tMax = st.tMax;
    const vals = hist.map(p => p.v !== undefined ? p.v : p.x);
    const yMin = Math.min(...vals, 0);
    const yMax = Math.max(...vals, 0);
    const yPad = Math.max((yMax - yMin) * 0.15, 2);
    const yLo  = yMin - yPad;
    const yHi  = yMax + yPad;

    const toX = t   => PAD.left + (t / tMax) * gW;
    const toY = val => PAD.top  + (1 - (val - yLo) / (yHi - yLo)) * gH;

    // Grid
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    for (let t = 0; t <= tMax; t++) {
      const px = toX(t);
      ctx.beginPath(); ctx.moveTo(px, PAD.top); ctx.lineTo(px, PAD.top + gH); ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const py = PAD.top + (i / 4) * gH;
      ctx.beginPath(); ctx.moveTo(PAD.left, py); ctx.lineTo(PAD.left + gW, py); ctx.stroke();
    }

    // Eje cero
    const zeroY = toY(0);
    if (zeroY >= PAD.top && zeroY <= PAD.top + gH) {
      ctx.strokeStyle = C.zero;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(PAD.left, zeroY); ctx.lineTo(PAD.left + gW, zeroY); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ejes
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + gH);
    ctx.lineTo(PAD.left + gW, PAD.top + gH);
    ctx.stroke();

    // Labels
    ctx.font = '8px Space Mono, monospace';
    ctx.fillStyle = C.tx3;
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = yLo + (i / 4) * (yHi - yLo);
      const py  = PAD.top + (1 - i / 4) * gH;
      ctx.fillText(Engine.fmt(val), PAD.left - 4, py + 3);
    }
    ctx.textAlign = 'center';
    for (let t = 0; t <= tMax; t += 2) {
      ctx.fillText(t + 's', toX(t), PAD.top + gH + 14);
    }

    // Label eje Y
    ctx.save();
    ctx.translate(10, PAD.top + gH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = color;
    ctx.font = 'bold 9px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelY, 0, 0);
    ctx.restore();

    // Área
    ctx.beginPath();
    ctx.moveTo(toX(hist[0].t), toY(0));
    hist.forEach(p => ctx.lineTo(toX(p.t), toY(p.v !== undefined ? p.v : p.x)));
    ctx.lineTo(toX(hist[hist.length - 1].t), toY(0));
    ctx.closePath();
    ctx.fillStyle = color + '18';
    ctx.fill();

    // Curva
    ctx.beginPath();
    hist.forEach((p, i) => {
      const px = toX(p.t);
      const py = toY(p.v !== undefined ? p.v : p.x);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Punto actual
    const last = hist[hist.length - 1];
    const cpx  = toX(last.t);
    const cpy  = toY(last.v !== undefined ? last.v : last.x);
    ctx.beginPath();
    ctx.arc(cpx, cpy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#0d1117';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Línea cursor vertical
    ctx.strokeStyle = C.tCursor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cpx, PAD.top);
    ctx.lineTo(cpx, PAD.top + gH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Sincronizar scrubber de línea de tiempo ───────────────
  function syncTimeline(st) {
    const tl = document.getElementById('timeline');
    if (tl && !tl._dragging) tl.value = st.t;
    const tlTime = document.getElementById('tl-time');
    if (tlTime) tlTime.textContent = st.t.toFixed(2);
    // Mostrar ▶ cuando la simulación termina
    if (st.ended) {
      const btn = document.getElementById('btn-tl-play');
      if (btn && btn.textContent === '⏸') btn.textContent = '▶';
    }
  }

  // ── Frame principal ──────────────────────────────────────
  function frame() {
    const st = Engine.getState();
    Engine.step(clock.tick());

    drawMain(st);
    drawGraph(canvasX, ctxX,
      st.histX.map(p => ({ t: p.t, v: p.x })),
      C.lineX, 'x (m)', st);
    drawGraph(canvasV, ctxV,
      st.histV,
      C.lineV, 'v (m/s)', st);

    UI.updatePanel(Engine.getSustitucion());
    syncTimeline(st);

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
