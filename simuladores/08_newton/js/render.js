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
    SimCanvas.observe([canvas],resize);
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

  // ── Cuadrícula ────────────────────────────────────────────
  function drawGrid() {
    const W = canvas.logicalWidth, H = canvas.logicalHeight, step = 40;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  // ══════════════════════════════════════════════════════════
  //  MODO PLANO
  // ══════════════════════════════════════════════════════════
  function drawPlano(st) {
    const W=canvas.logicalWidth,H=canvas.logicalHeight,th=st.theta*Math.PI/180;
    const tx=Math.cos(th),ty=-Math.sin(th),nx=-Math.sin(th),ny=-Math.cos(th);
    const cx=W/2,cy=H*0.58;
    ctx.strokeStyle=C.suelo;ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(cx-tx*W,cy-ty*W);ctx.lineTo(cx+tx*W,cy+ty*W);ctx.stroke();
    // Cámara sigue al bloque: x e y físicos se muestran, nunca se recortan en el motor.
    const lift=30+Math.min(st.y*10,H*0.2),bx=cx+nx*lift,by=cy+ny*lift;
    ctx.save();ctx.translate(bx,by);ctx.rotate(-th);ctx.fillStyle=C.bloque;ctx.fillRect(-25,-25,50,50);ctx.restore();
    const scale=Math.min(W,H)*0.2/Math.max(st.w,st.F,st.n,Math.abs(st.sumFx),1);
    const vector=(x,y,name,color)=>{if(Math.hypot(x,y)<1e-8)return;const ex=bx+x*scale,ey=by+y*scale;arrow(bx,by,ex,ey,color,2.5);label(name,ex+5,ey-5,color);};
    vector(0,st.w,`mg=${Engine.fmt(st.w)} N`,C.peso);
    vector(nx*st.n,ny*st.n,`N=${Engine.fmt(st.n)} N`,C.normal);
    vector(tx*st.Fx+nx*st.Fy,ty*st.Fx+ny*st.Fy,`F=${Engine.fmt(st.F)} N`,C.fApp);
    vector(tx*st.fricSigned,ty*st.fricSigned,`f=${Engine.fmt(st.fricSigned)} N (${st.regime})`,C.fric);
    vector(tx*st.sumFx+nx*st.sumFy,ty*st.sumFx+ny*st.sumFy,'ΣF',C.sumF);
    label(`mg∥=${Engine.fmt(st.weightParallel)} N; mg⊥=${Engine.fmt(st.weightNormal)} N`,12,24,C.tx1);
    label(`x=${Engine.fmt(st.x)} m; v=${Engine.fmt(st.vx)} m/s; a=${Engine.fmt(st.ax)} m/s²`,12,H-40,C.tx1);
    label(st.y>0?'Sin contacto: N=0, fricción=0':'Cámara de seguimiento; fuerzas a escala común',12,H-20,C.tx2);
  }

  function drawElevador(st) {
    const W  = canvas.logicalWidth;
    const H  = canvas.logicalHeight;

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
    ctx.fillRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);
    drawGrid();

    if (st.modo === 'plano') {
      drawPlano(st);
    } else {
      drawElevador(st);
    }

    if(st.modo==='elevador')drawHUD(st);
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