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

      // Sombra
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;

      // Cuerpo de la varilla
      ctx.fillStyle   = C.fill;
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.roundRect(-halfL, -thick/2, halfL*2, thick, 4);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Eje de rotación
      if (c.id === 'varilla_cm') {
        // Punto en el centro
        ctx.fillStyle = C.eje;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Punto en el extremo izquierdo
        ctx.fillStyle = C.eje;
        ctx.beginPath();
        ctx.arc(-halfL, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Marcas de masa cada cuarto
      ctx.fillStyle = color + '44';
      [-halfL*0.5, 0, halfL*0.5].forEach(x => {
        ctx.beginPath();
        ctx.arc(x, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      });

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
  function drawBarras(st, c, bx, by, bw, bh) {
    const I_cm  = st.I;
    const I_P   = st.I_P;
    const K_cm  = st.K;
    const K_P   = st.K_P;

    const maxI  = Math.max(I_P, 0.01);
    const maxK  = Math.max(K_P, 0.01);

    const barH  = Math.min(bh * 0.18, 34);
    const gap   = barH * 0.55;
    const labelW = 60;
    const barX   = bx + labelW;
    const barW   = bw - labelW - 16;

    // Título zona
    lbl('Comparación I y K', bx + bw/2, by + 14, C.tx2, 'center', 10);

    let y = by + 34;

    // ─ I_cm ─
    lbl('I_cm', bx + labelW - 6, y + barH/2, c.color, 'right', 10);
    ctx.fillStyle = C.barBg;
    ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 3); ctx.fill();
    ctx.fillStyle = c.color + 'cc';
    const wI = (I_cm / maxI) * barW;
    ctx.beginPath(); ctx.roundRect(barX, y, wI, barH, 3); ctx.fill();
    lbl(Engine.fmt(I_cm) + ' kg·m²', barX + wI + 5, y + barH/2, c.color, 'left', 9);
    y += barH + gap;

    // ─ I_P ─
    lbl('I_P', bx + labelW - 6, y + barH/2, '#e3b341', 'right', 10);
    ctx.fillStyle = C.barBg;
    ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 3); ctx.fill();
    ctx.fillStyle = '#e3b341cc';
    const wIP = (I_P / maxI) * barW;
    ctx.beginPath(); ctx.roundRect(barX, y, wIP, barH, 3); ctx.fill();
    lbl(Engine.fmt(I_P) + ' kg·m²', barX + wIP + 5, y + barH/2, '#e3b341', 'left', 9);
    y += barH + gap * 2.2;

    // ─ K_cm ─
    lbl('K_cm', bx + labelW - 6, y + barH/2, c.color, 'right', 10);
    ctx.fillStyle = C.barBg;
    ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 3); ctx.fill();
    ctx.fillStyle = c.color + 'cc';
    const wK = (K_cm / maxK) * barW;
    ctx.beginPath(); ctx.roundRect(barX, y, wK, barH, 3); ctx.fill();
    lbl(Engine.fmt(K_cm) + ' J', barX + wK + 5, y + barH/2, c.color, 'left', 9);
    y += barH + gap;

    // ─ K_P ─
    lbl('K_P', bx + labelW - 6, y + barH/2, '#e3b341', 'right', 10);
    ctx.fillStyle = C.barBg;
    ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 3); ctx.fill();
    ctx.fillStyle = '#e3b341cc';
    const wKP = (K_P / maxK) * barW;
    ctx.beginPath(); ctx.roundRect(barX, y, wKP, barH, 3); ctx.fill();
    lbl(Engine.fmt(K_P) + ' J', barX + wKP + 5, y + barH/2, '#e3b341', 'left', 9);
    y += barH + gap * 2;

    // Delta I
    const deltaI = I_P - I_cm;
    lbl(`ΔI = M·d² = ${Engine.fmt(st.M)}·${Engine.fmt(st.d)}² = ${Engine.fmt(deltaI)} kg·m²`,
        bx + bw/2, y + 10, C.tx2, 'center', 9, false);

    // Nota: d = 0 → I_P = I_cm
    if (st.d < 0.01) {
      lbl('d = 0 → eje paralelo = eje cm', bx + bw/2, y + 24, C.tx3, 'center', 9, false);
    }
  }

  // ── Comparador de referencia (columna derecha) ────────────
  // Muestra los 2 cuerpos de varilla uno encima del otro para comparar
  function drawComparador(st, W, H) {
    const allC   = Engine.getCuerpos();
    const active = Engine.getCuerpo();
    const boxX   = W * 0.72;
    const boxW   = W * 0.27;
    const boxY   = 10;
    const boxH   = H - 20;

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
      ctx.beginPath(); ctx.roundRect(boxX + 8, ry + rowH * 0.52, boxW - 16, 5, 2); ctx.fill();
      ctx.fillStyle = c.color + (isAct ? 'ff' : '88');
      ctx.beginPath(); ctx.roundRect(boxX + 8, ry + rowH * 0.52, wBar, 5, 2); ctx.fill();

      // Nombre
      lbl(c.nombre, boxX + 12, ry + rowH * 0.28,
          isAct ? c.color : C.tx3, 'left', isAct ? 9 : 8);

      // Valor I
      lbl(Engine.fmt(I_i) + ' kg·m²', boxX + boxW - 10, ry + rowH * 0.28,
          isAct ? c.color : C.tx3, 'right', isAct ? 9 : 8);
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

    // Zona izquierda: cuerpo girando
    const leftW  = W * 0.32;
    const centerX = leftW / 2;
    const centerY = H / 2;
    const maxR   = Math.min(leftW, H) * 0.38;

    drawCuerpo(st, c, centerX, centerY, maxR);

    // Label del cuerpo y eje
    lbl(c.nombre, centerX, H - 42, c.color, 'center', 11);
    lbl(c.ejeLabel, centerX, H - 27, C.tx3, 'center', 9, false);
    lbl(`ω = ${Engine.fmt(st.omega)} rad/s`, centerX, H - 14, C.tx2, 'center', 9, false);

    // Línea divisoria
    ctx.strokeStyle = 'rgba(48,54,61,0.5)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(leftW, 10);
    ctx.lineTo(leftW, H - 10);
    ctx.stroke();

    // Zona central: barras
    const midW  = W * 0.40;
    const midX  = leftW + 8;
    drawBarras(st, c, midX, 10, midW - 16, H - 20);

    // Zona derecha: comparador
    drawComparador(st, W, H);

    // HUD top-left
    drawHUD(st, c);
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