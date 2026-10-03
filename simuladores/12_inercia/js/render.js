// ============================================================
//  render.js  —  Canvas 2D SIM 12: Momento de Inercia
//  Layout del canvas (3 zonas):
//    IZQUIERDA : Cuerpo girando (animado)
//    CENTRO    : Barras comparativas I y K  (cm vs eje paralelo)
//    DERECHA   : Disco/varilla comparador de referencia
//
//  Cuerpos soportados:
//    varilla_cm, varilla_ext → dibuja varilla con eje marcado
//    disco, aro              → dibuja círculo sólido o hueco
//    esfera_sol, esfera_hue  → dibuja círculo con relleno diferente
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;

  const C = {
    bg:     '#0a1628',
    grid:   'rgba(48,54,61,0.35)',
    tx1:    '#e6edf3',
    tx2:    '#8b949e',
    tx3:    '#484f58',
    borde:  '#58a6ff',
    fill:   '#1c2d4a',
    eje:    'rgba(255,255,255,0.55)',
    barBg:  'rgba(48,54,61,0.5)',
  };

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas],resize);
  }

  function resize() {
    const narrow=canvas.getBoundingClientRect().width<650,main=canvas.closest('main');
    main.style.minHeight=narrow?'820px':'';main.style.height=narrow?'820px':'';
    [canvas].forEach(SimCanvas.resize);
  }

  // ── Utilidades ───────────────────────────────────────────
  function lbl(text, x, y, color, align, size, bold) {
    ctx.save();
    ctx.font      = `${bold !== false ? 'bold ' : ''}${size || 11}px Space Mono, monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawGrid() {
    const W = canvas.logicalWidth, H = canvas.logicalHeight, step = 40;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  // ── Dibuja el cuerpo girando ──────────────────────────────
  function drawCuerpo(st, c, cx, cy, maxR) {
    const theta = st.theta;
    const dim   = st.dim;
    const color = c.color;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(theta);

    if (c.param === 'L') {
      // ── VARILLA ──
      const halfL = Math.min(dim * maxR / 2, maxR);
      const thick = 12;

      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;

      if (c.id === 'varilla_cm') {
        // ── VARILLA CENTRO: eje en el centro ──
        // Varilla centrada en el origen (pivote = cx,cy)
        ctx.fillStyle   = C.fill;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(-halfL, -thick/2, halfL*2, thick, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Punto de eje en el centro
        ctx.fillStyle = C.eje;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Marcas de masa
        ctx.fillStyle = color + '44';
        [-halfL*0.5, 0, halfL*0.5].forEach(x => {
          ctx.beginPath();
          ctx.arc(x, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        });

      } else {
        // ── VARILLA EXTREMO: eje en el extremo izquierdo ──
        // La varilla va de x=0 a x=2*halfL.
        // El origen (0,0) coincide con el pivote real (extremo).
        ctx.fillStyle   = C.fill;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(0, -thick/2, halfL*2, thick, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Punto de eje en el extremo (0,0)
        ctx.fillStyle = C.eje;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Marcas de masa a lo largo de la varilla
        ctx.fillStyle = color + '44';
        [halfL*0.5, halfL, halfL*1.5].forEach(x => {
          ctx.beginPath();
          ctx.arc(x, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

    } else {
      // ── CUERPO CIRCULAR (disco, aro, esfera) ──
      const R = Math.min(dim * maxR * 0.9, maxR);

      ctx.shadowColor = color;
      ctx.shadowBlur  = 14;

      if (c.id === 'aro' || c.id === 'esfera_hue') {
        // Hueco: solo borde
        ctx.strokeStyle = color;
        ctx.lineWidth   = c.id === 'aro' ? 10 : 6;
        ctx.fillStyle   = C.fill;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Radio interior visible
        if (c.id === 'aro') {
          ctx.strokeStyle = color + '30';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Sólido: relleno con gradiente radial
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, color + '10');
        ctx.fillStyle   = grad;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Radios guía (cada 90°)
      ctx.strokeStyle = color + '35';
      ctx.lineWidth   = 1;
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        ctx.stroke();
      }

      // Centro
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Punto marcador en el borde
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(R, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // ── Barras comparativas ───────────────────────────────────
  function compact(value){const str=Engine.fmt(value);return str.length>13?value.toExponential(4):str;}
  function drawBarras(st,c,bx,by,bw,bh){
    lbl('Comparación I y K',bx+bw/2,by+14,C.tx2,'center',11);
    const rows=[['I (eje activo)',st.I,'kg·m²',c.color,Math.max(st.I,st.I_P,.01)],['I_P',st.I_P,'kg·m²','#e3b341',Math.max(st.I,st.I_P,.01)],['K (eje activo)',st.K,'J',c.color,Math.max(st.K,st.K_P,.01)],['K_P',st.K_P,'J','#e3b341',Math.max(st.K,st.K_P,.01)]];
    const gap=Math.min(58,(bh-48)/4),barW=Math.max(1,bw-24);
    rows.forEach(([name,value,unit,color,max],i)=>{const y=by+38+i*gap;
      lbl(name,bx+12,y,color,'left',10);lbl(compact(value)+' '+unit,bx+bw-12,y+14,color,'right',10);
      ctx.fillStyle=C.barBg;ctx.fillRect(bx+12,y+24,barW,7);
      ctx.fillStyle=color;ctx.fillRect(bx+12,y+24,barW*value/max,7);
    });
  }

  // ── Comparador de referencia (columna derecha) ────────────
  // Muestra los 2 cuerpos de varilla uno encima del otro para comparar
  function drawComparador(st, boxX, boxY, boxW, boxH) {
    const allC   = Engine.getCuerpos();
    const active = Engine.getCuerpo();

    // Fondo
    ctx.fillStyle = 'rgba(22,30,46,0.7)';
    ctx.strokeStyle = 'rgba(48,54,61,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 6); ctx.fill(); ctx.stroke();

    lbl('Todos los cuerpos', boxX + boxW/2, boxY + 14, C.tx3, 'center', 9);

    // Lista con barra de I proporcional
    const rowH = (boxH - 30) / allC.length;
    const maxI_all = Math.max(...allC.map(c => c.calcI(st.M, st.dim)));

    allC.forEach((c, i) => {
      const ry   = boxY + 26 + i * rowH;
      const I_i  = c.calcI(st.M, st.dim);
      const wBar = ((I_i / maxI_all) * (boxW - 24));
      const isAct= c.id === active.id;

      // Fondo de fila activa
      if (isAct) {
        ctx.fillStyle = c.color + '18';
        ctx.strokeStyle= c.color + '44';
        ctx.lineWidth  = 1;
        ctx.beginPath(); ctx.roundRect(boxX + 6, ry, boxW - 12, rowH - 3, 4); ctx.fill(); ctx.stroke();
      }

      // Barra
      ctx.fillStyle = C.barBg;
      ctx.beginPath(); ctx.roundRect(boxX + 8, ry + rowH * 0.83, boxW - 16, 5, 2); ctx.fill();
      ctx.fillStyle = c.color + (isAct ? 'ff' : '88');
      ctx.beginPath(); ctx.roundRect(boxX + 8, ry + rowH * 0.83, wBar, 5, 2); ctx.fill();

      // Nombre
      lbl(c.nombre, boxX + 12, ry + rowH * 0.28,
          isAct ? c.color : C.tx2, 'left', 9);

      // Valor I
      lbl(Engine.fmt(I_i) + ' kg·m²', boxX + boxW - 10, ry + rowH * 0.60,
          isAct ? c.color : C.tx2, 'right', 9);
    });
  }

  // ── Draw principal ───────────────────────────────────────
  function draw(st) {
    const W  = canvas.logicalWidth;
    const H  = canvas.logicalHeight;
    const c  = Engine.getCuerpo();

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    const narrow=W<650;
    if(narrow){
      const top=210,barsH=270;
      drawCuerpo(st,c,W*.72,100,Math.min(72,W*.19));
      lbl(c.nombre,W/2,top-27,c.color,'center',11);
      lbl(c.ejeLabel,W/2,top-10,C.tx2,'center',9);
      drawBarras(st,c,8,top,W-16,barsH);
      drawComparador(st,8,top+barsH+12,W-16,Math.max(240,H-top-barsH-24));
    }else{
      const bodyW=W*.28,barsX=bodyW+12,barsW=W*.34,compX=barsX+barsW+12;
      drawCuerpo(st,c,bodyW/2,H*.53,Math.min(bodyW*.34,H*.25));
      lbl(c.nombre,bodyW/2,H-55,c.color,'center',11);
      lbl(c.ejeLabel,bodyW/2,H-36,C.tx2,'center',9);
      drawBarras(st,c,barsX,10,barsW,Math.min(H-20,350));
      drawComparador(st,compX,10,W-compX-10,H-20);
    }
    drawHUD(st,c);
  }

  function drawHUD(st, c) {
    const lines = [
      { label: 'M',  val: Engine.fmt(st.M)     + ' kg',    color: '#e6edf3' },
      { label: 'dim',val: Engine.fmt(st.dim)    + ' m',     color: c.color   },
      { label: 'ω',  val: Engine.fmt(st.omega)  + ' rad/s', color: '#58a6ff' },
      { label: 'd',  val: Engine.fmt(st.d)      + ' m',     color: '#e3b341' },
      { label: 'I',  val: Engine.fmt(st.I)      + ' kg·m²', color: c.color   },
      { label: 'K',  val: Engine.fmt(st.K)      + ' J',     color: '#3fb950' },
    ];

    let by = 22;
    ctx.font = '10px Space Mono, monospace';
    lines.forEach(l => {
      ctx.fillStyle = C.tx3;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(l.label, 40, by);
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.fillText(l.val, 44, by);
      by += 15;
    });
  }

  // ── Frame loop ───────────────────────────────────────────
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