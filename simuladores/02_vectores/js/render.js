// ============================================================
//  render.js  —  Plano cartesiano + vectores (SIM 02)
// ============================================================

const Renderer = (() => {

  let canvas, ctx, W, H;
  let animId  = null;
  let isDragging = false;
  let dragId     = null;
  let dragOffset = { x: 0, y: 0 };
  let isPanning  = false;
  let panStart   = { x: 0, y: 0 };

  // Escala: unidades físicas ↔ píxeles
  // 1 unidad = SCALE px
  const BASE_SCALE = 42;
  const MIN_SCALE  = 15;
  const MAX_SCALE  = 100;
  let scale = BASE_SCALE;

  // Origen del plano en píxeles (centro del canvas)
  let ox, oy;

  const C = {
    bg:      '#0a1628',
    grid:    'rgba(48,54,61,0.5)',
    gridM:   'rgba(48,54,61,0.25)',
    axis:    '#30363d',
    axisL:   'rgba(88,166,255,0.5)',
    text:    '#8b949e',
    result:  '#e3b341',
    resultA: 'rgba(227,179,65,0.18)',
  };

  // ── Setup ────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('simCanvas');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas],resize);
    bindDrag();
  }

  function resize() {
    [canvas].forEach(SimCanvas.resize);
    W=canvas.logicalWidth;H=canvas.logicalHeight;
    ox=W/2;oy=H/2;scale=Math.min(W,H)/14;
  }

  // ── Coordenadas ──────────────────────────────────────────
  // Unidades físicas → píxeles
  function toPixel(vx, vy) {
    return { x: ox + vx * scale, y: oy - vy * scale };
  }
  // Píxeles → unidades físicas
  function toUnit(px, py) {
    return { vx: (px - ox) / scale, vy: -(py - oy) / scale };
  }

  // ── Grid ─────────────────────────────────────────────────
  function drawGrid() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Rango de unidades visibles
    const x0 = Math.floor(-ox / scale);
    const x1 = Math.ceil((W - ox) / scale);
    const y0 = Math.floor(-(H - oy) / scale);
    const y1 = Math.ceil(oy / scale);

    // Grid menor (cada 1 unidad)
    ctx.strokeStyle = C.gridM;
    ctx.lineWidth = 0.5;
    for (let x = x0; x <= x1; x++) {
      const px = ox + x * scale;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let y = y0; y <= y1; y++) {
      const py = oy - y * scale;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // Grid mayor (cada 5 unidades)
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.8;
    for (let x = Math.ceil(x0/5)*5; x <= x1; x += 5) {
      const px = ox + x * scale;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let y = Math.ceil(y0/5)*5; y <= y1; y += 5) {
      const py = oy - y * scale;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = C.axisL;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();

    // Labels de eje
    ctx.fillStyle = C.text;
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(x0/5)*5; x <= x1; x += 5) {
      if (x === 0) continue;
      const px = ox + x * scale;
      ctx.fillText(x, px, oy + 14);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(y0/5)*5; y <= y1; y += 5) {
      if (y === 0) continue;
      const py = oy - y * scale;
      ctx.fillText(y, ox - 6, py + 3);
    }

    // Labels de ejes
    ctx.fillStyle = C.axisL;
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('x', W - 16, oy - 6);
    ctx.textAlign = 'center';
    ctx.fillText('y', ox + 10, 12);
    ctx.textAlign = 'left';

    // Origen
    ctx.fillStyle = C.text;
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText('O', ox + 5, oy + 13);
  }

  // ── Flecha vectorial ─────────────────────────────────────
  function drawArrow(x1, y1, x2, y2, color, label, r, thin) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 2) return;

    const angle = Math.atan2(dy, dx);
    const hw = thin ? 7 : 10;  // tamaño de la cabeza
    const hlen = thin ? 12 : 16;

    ctx.strokeStyle = color;
    ctx.lineWidth   = thin ? 1.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - Math.cos(angle) * hlen * 0.6, y2 - Math.sin(angle) * hlen * 0.6);
    ctx.stroke();

    // Cabeza
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.4) * hlen, y2 - Math.sin(angle - 0.4) * hlen);
    ctx.lineTo(x2 - Math.cos(angle + 0.4) * hlen, y2 - Math.sin(angle + 0.4) * hlen);
    ctx.closePath();
    ctx.fill();

    // Etiqueta
    if (label) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const nx = -Math.sin(angle);
      const ny =  Math.cos(angle);
      const off = thin ? 14 : 18;

      // Fondo del label
      ctx.font = `bold ${thin ? 11 : 13}px Syne, sans-serif`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(10,22,40,0.85)';
      ctx.fillRect(mx + nx*off - tw/2 - 3, my + ny*off - 9, tw + 6, 14);

      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(label, mx + nx*off, my + ny*off + 1);
      ctx.textAlign = 'left';
    }
  }

  // ── Ángulo arc ───────────────────────────────────────────
  function drawAngleArc(color, theta) {
    const rad = theta * Math.PI / 180;
    const arcR = scale * 0.8;
    ctx.beginPath();
    ctx.arc(ox, oy, arcR, 0, -rad, rad < 0);
    ctx.strokeStyle = color + '66';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Componentes punteadas ────────────────────────────────
  function drawComponents(pt, color) {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 1;
    // Línea horizontal
    ctx.beginPath(); ctx.moveTo(ox, pt.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
    // Línea vertical
    ctx.beginPath(); ctx.moveTo(pt.x, oy); ctx.lineTo(pt.x, pt.y); ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Handle de arrastre ───────────────────────────────────
  function drawHandle(pt, color, id) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#0a1628';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ── Dibujar un vector ────────────────────────────────────
  function drawVector(v) {
    const tip = toPixel(v.vx, v.vy);
    drawComponents(tip, v.color);
    drawArrow(ox, oy, tip.x, tip.y, v.color, v.name, v.r, false);
    drawHandle(tip, v.color, v.id);
  }

  // ── Dibujar resultante ───────────────────────────────────
  function drawResultant(res) {
    if (res.R < 0.01) return;
    const tip = toPixel(res.Rx, res.Ry);

    // Polígono de suma (tail-to-tip)
    const vecs = Engine.getVectors();
    if (vecs.length >= 2) {
      let cx = 0, cy = 0;
      ctx.beginPath();
      const o = toPixel(0, 0);
      ctx.moveTo(o.x, o.y);
      for (const v of vecs) {
        cx += v.vx; cy += v.vy;
        const p = toPixel(cx, cy);
        ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = C.result + '44';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawArrow(ox, oy, tip.x, tip.y, C.result, 'R', res.R, false);
    // Dot en origen
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.result;
    ctx.fill();
  }

  // ── Frame ────────────────────────────────────────────────
  function frame() {
    drawGrid();

    const vecs = Engine.getVectors();
    const res  = Engine.getResultant();

    // Primero componentes, luego vectores, luego resultante encima
    vecs.forEach(drawVector);
    drawResultant(res);

    UI.updatePanel(vecs, res);

    animId = requestAnimationFrame(frame);
  }

  // ── Drag & Drop + Pan + Zoom ────────────────────────────
  function bindDrag() {
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    canvas.addEventListener('wheel',     onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove, { passive: false });
    canvas.addEventListener('touchend',   onUp, { passive: false });
  }

  function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const evt = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      button: 0
    };
    onDown(evt);
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const evt = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    onMove(evt);
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.logicalWidth  / rect.width),
      y: (clientY - rect.top)  * (canvas.logicalHeight / rect.height),
    };
  }

  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // Solo left click
    const pos  = getCanvasPos(e);
    const vecs = Engine.getVectors();
    const HIT  = 14; // radio de hit en píxeles

    // Intentar hacer hit con un vector
    for (const v of vecs) {
      const tip = toPixel(v.vx, v.vy);
      const dx  = pos.x - tip.x, dy = pos.y - tip.y;
      if (Math.sqrt(dx*dx + dy*dy) <= HIT) {
        isDragging = true;
        dragId     = v.id;
        return;
      }
    }

    // Si no hay hit con un vector, iniciar pan
    isPanning = true;
    panStart.x = pos.x;
    panStart.y = pos.y;
  }

  function onMove(e) {
    const pos = getCanvasPos(e);

    // Arrastrar vector
    if (isDragging && dragId !== null) {
      const u = toUnit(pos.x, pos.y);
      // Snap a 0.5 unidades
      const vx = Math.round(u.vx * 2) / 2;
      const vy = Math.round(u.vy * 2) / 2;
      Engine.setCartesian(dragId, vx, vy);
      UI.syncControls(dragId);
      return;
    }

    // Pan del plano
    if (isPanning) {
      const dx = pos.x - panStart.x;
      const dy = pos.y - panStart.y;
      ox += dx;
      oy += dy;
      panStart.x = pos.x;
      panStart.y = pos.y;
    }
  }

  function onUp() {
    isDragging = false;
    dragId     = null;
    isPanning  = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const pos = getCanvasPos(e);
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // scroll abajo = alejar, scroll arriba = acercar
    applyZoom(delta, pos);
  }

  function applyZoom(delta, pos) {
    // Calcular nueva escala
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
    
    // Mantener el punto bajo el cursor al hacer zoom
    const u = toUnit(pos.x, pos.y);
    ox = pos.x - u.vx * newScale;
    oy = pos.y + u.vy * newScale;
    
    scale = newScale;
  }

  function zoomIn() {
    applyZoom(1.25, { x: W/2, y: H/2 });
  }

  function zoomOut() {
    applyZoom(0.8, { x: W/2, y: H/2 });
  }

  function start() {
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }

  function resetCamera() {
    ox = W / 2;
    oy = H / 2;
    scale = Math.min(W, H) / 14;
  }

  return { init, start, resize, resetCamera, zoomIn, zoomOut };

})();
