// ============================================================
//  render.js  —  Canvas SIM 10: visualización de potencia
//  Dibuja un gauge animado que muestra la potencia actual
//  relativa al máximo configurado. También muestra el
//  diagrama conceptual de P = F·v cuando el modo es Fv.
// ============================================================

const Renderer = (() => {

  let canvas, ctx;
  let animId = null;
  let displayP = 0;   // valor animado (suavizado)

  const C = {
    bg:      '#0a1628',
    panel:   '#0d1117',
    accent:  '#58a6ff',
    gold:    '#e3b341',
    green:   '#3fb950',
    red:     '#f85149',
    tx2:     '#8b949e',
    tx3:     '#484f58',
    border:  '#30363d',
  };

  function init() {
    canvas = document.getElementById('canvasVis');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  }

  // ── Frame ─────────────────────────────────────────────────
  function frame() {
    if (!canvas || !ctx) { animId = requestAnimationFrame(frame); return; }

    const st  = Engine.getState();
    const P   = (st.resultado !== null && (st.modo === 'P' || st.modo === 'Fv'))
                  ? st.resultado
                  : (st.modo === 'W' || st.modo === 't') ? st.P : 0;
    const Pmax = 50000;

    // Suavizado
    displayP += (P - displayP) * 0.08;

    draw(st, displayP, Pmax);
    animId = requestAnimationFrame(frame);
  }

  function draw(st, P, Pmax) {
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    if (st.modo === 'Fv') {
      drawFvDiagram(st, W, H);
    } else {
      drawGauge(P, Pmax, W, H);
    }
  }

  // ════════════════════════════════════════════════════════
  //  GAUGE DE POTENCIA
  // ════════════════════════════════════════════════════════
  function drawGauge(P, Pmax, W, H) {
    const cx = W / 2;
    const cy = H * 0.52;
    const R  = Math.min(W, H) * 0.36;

    const ratio    = Math.min(Math.max(P / Pmax, 0), 1);
    const startAng = Math.PI * 0.75;
    const endAng   = Math.PI * 2.25;
    const fillAng  = startAng + ratio * (endAng - startAng);

    // Color del gauge según nivel
    let gaugeColor;
    if (ratio < 0.4)       gaugeColor = C.green;
    else if (ratio < 0.75) gaugeColor = C.gold;
    else                   gaugeColor = C.red;

    // Arco de fondo
    ctx.beginPath();
    ctx.arc(cx, cy, R, startAng, endAng);
    ctx.strokeStyle = C.border;
    ctx.lineWidth   = 18;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Arco de valor
    if (ratio > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, R, startAng, fillAng);
      ctx.strokeStyle = gaugeColor;
      ctx.lineWidth   = 18;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, R, startAng, fillAng);
      ctx.strokeStyle = gaugeColor + '40';
      ctx.lineWidth   = 30;
      ctx.stroke();
    }

    // Marcas del gauge (0, 25%, 50%, 75%, 100%)
    [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
      const ang = startAng + pct * (endAng - startAng);
      const x1  = cx + (R - 24) * Math.cos(ang);
      const y1  = cy + (R - 24) * Math.sin(ang);
      const x2  = cx + (R - 10) * Math.cos(ang);
      const y2  = cy + (R - 10) * Math.sin(ang);
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

      // Etiqueta
      const xL  = cx + (R - 40) * Math.cos(ang);
      const yL  = cy + (R - 40) * Math.sin(ang);
      ctx.font      = '8px Space Mono, monospace';
      ctx.fillStyle = C.tx3;
      ctx.textAlign = 'center';
      ctx.fillText(fmtKW(Pmax * pct), xL, yL + 3);
    });

    // Aguja
    const needleAng = startAng + ratio * (endAng - startAng);
    const nx = cx + (R - 6) * Math.cos(needleAng);
    const ny = cy + (R - 6) * Math.sin(needleAng);
    ctx.strokeStyle = gaugeColor;
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = C.border;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = gaugeColor;
    ctx.fill();

    // Valor central
    ctx.font      = `bold ${Math.floor(R * 0.28)}px Syne, sans-serif`;
    ctx.fillStyle = gaugeColor;
    ctx.textAlign = 'center';
    ctx.fillText(fmtKW(P), cx, cy + R * 0.32);

    ctx.font      = '11px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`${Engine.fmt(P / 746)} hp`, cx, cy + R * 0.32 + 18);

    // Label
    ctx.font      = '10px Syne, sans-serif';
    ctx.fillStyle = C.tx3;
    ctx.fillText('POTENCIA', cx, cy - R * 0.85);
  }

  function fmtKW(w) {
    if (w >= 1000) return (Math.round(w / 100) / 10) + ' kW';
    return Math.round(w) + ' W';
  }

  // ════════════════════════════════════════════════════════
  //  DIAGRAMA F·v
  // ════════════════════════════════════════════════════════
  function drawFvDiagram(st, W, H) {
    const cx = W / 2;
    const cy = H / 2;

    // Objeto moviéndose
    const objX = cx - 60;
    const objY = cy + 20;
    const objW = 50;
    const objH = 30;

    // Cuerpo
    ctx.fillStyle = '#1c2128';
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(objX - objW / 2, objY - objH / 2, objW, objH, 6);
    ctx.fill();
    ctx.stroke();

    // Ruedas
    [objX - 14, objX + 14].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, objY + objH / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = C.tx3;
      ctx.fill();
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Flecha F (fuerza — roja, viene de atrás)
    const fScale = Math.min(st.F / 200, 1) * 70 + 10;
    drawArrow(ctx, objX - objW / 2 - fScale - 4, objY, objX - objW / 2 - 2, objY, C.red, 3);
    ctx.font      = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = C.red;
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${Engine.fmt(st.F)} N`, objX - objW / 2 - fScale / 2 - 4, objY - 12);

    // Flecha v (velocidad — verde, sale al frente)
    const vScale = Math.min(st.v / 40, 1) * 80 + 10;
    drawArrow(ctx, objX + objW / 2 + 2, objY, objX + objW / 2 + vScale + 4, objY, C.green, 3);
    ctx.fillStyle = C.green;
    ctx.fillText(`v = ${Engine.fmt(st.v)} m/s`, objX + objW / 2 + vScale / 2 + 8, objY - 12);

    // Resultado P = F·v
    const P = st.F * st.v;
    ctx.font      = `bold 22px Syne, sans-serif`;
    ctx.fillStyle = C.gold;
    ctx.textAlign = 'center';
    ctx.fillText(`P = ${Engine.fmt(P)} W`, cx, cy - 44);

    ctx.font      = '12px Space Mono, monospace';
    ctx.fillStyle = C.tx2;
    ctx.fillText(`${Engine.fmt(P / 746)} hp  /  ${Engine.fmt(P / 1000)} kW`, cx, cy - 22);

    // Suelo
    ctx.strokeStyle = C.border;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.08, objY + objH / 2 + 8);
    ctx.lineTo(W * 0.92, objY + objH / 2 + 8);
    ctx.stroke();

    // Marcas del suelo
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth   = 1;
    for (let x = W * 0.08; x < W * 0.92; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, objY + objH / 2 + 8);
      ctx.lineTo(x - 8, objY + objH / 2 + 16);
      ctx.stroke();
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, lw) {
    const dx  = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 4) return;
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(dy, dx);
    const h   = Math.min(10, len * 0.4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function start() {
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }
  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  return { init, start, stop, resize };

})();