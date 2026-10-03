// ============================================================
//  render.js  —  Canvas 2D SIM 11: Cinemática Rotacional
//  Dibuja:
//    · Disco con radio R, radios guía y punto marcador
//    · Flecha v_tan  (tangencial al borde, dirección de giro)
//    · Flecha a_tan  (tangencial, misma dirección que α)
//    · Flecha a_rad  (centrípeta, hacia el centro)
//    · Arco θ acumulado (sector sombreado)
//    · HUD de magnitudes
//    · Rastro del punto en el borde (trail)
// ============================================================

const Renderer = (() => {
  const clock = SimCommon.createClock();

  let canvas, ctx;
  let animId = null;

  // Trail del punto marcador
  const TRAIL_LEN = 90;
  let trail = [];

  const C = {
    bg:       '#0a1628',
    grid:     'rgba(48,54,61,0.35)',
    disco:    '#1c2d4a',
    discoB:   '#58a6ff',
    radio:    'rgba(88,166,255,0.25)',
    punto:    '#ffffff',
    vtan:     '#3fb950',   // verde
    atan:     '#e3b341',   // dorado
    arad:     '#f85149',   // rojo
    omega:    '#58a6ff',   // azul
    trail:    'rgba(255,255,255,0.18)',
    theta:    'rgba(88,166,255,0.08)',
    thetaB:   'rgba(88,166,255,0.35)',
    tx1:      '#e6edf3',
    tx2:      '#8b949e',
    tx3:      '#484f58',
  };

  function init() {
    canvas = document.getElementById('canvasMain');
    ctx    = canvas.getContext('2d');
    resize();
    SimCanvas.observe([canvas],resize);
  }

  function resize() {
    [canvas].forEach(SimCanvas.resize);
    trail=[];
  }

  // ── Utilidades ───────────────────────────────────────────
  function arrow(x1, y1, x2, y2, color, lw) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 4) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = lw || 2.5;
    ctx.lineCap     = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(dy, dx);
    const h   = Math.min(12, len * 0.28);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(ang - 0.42), y2 - h * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - h * Math.cos(ang + 0.42), y2 - h * Math.sin(ang + 0.42));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function lbl(text, x, y, color, align, size) {
    ctx.save();
    ctx.font      = `bold ${size || 11}px Space Mono, monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
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

  // ── Draw principal ───────────────────────────────────────
  function draw(st) {
    const W  = canvas.logicalWidth;
    const H  = canvas.logicalHeight;
    const cx = W / 2;
    const cy = H / 2;

    // Escala: el disco ocupa ~40% del alto como máximo
    const MAX_PX = Math.min(W, H) * 0.38;
    const scale  = MAX_PX / 3.0;   // 3.0 = R_max
    const R_px   = st.R * scale;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    // ── Sector θ (arco acumulado, módulo 2π) ─────────────
    const thetaMod = ((st.punto_theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    ctx.save();
    ctx.fillStyle   = C.theta;
    ctx.strokeStyle = C.thetaB;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R_px, -Math.PI / 2, -Math.PI / 2 + thetaMod,
            st.omega < 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ── Disco ─────────────────────────────────────────────
    ctx.save();
    ctx.shadowColor = 'rgba(88,166,255,0.2)';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = C.disco;
    ctx.strokeStyle = C.discoB;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R_px, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── Radios guía (cada 90°) ────────────────────────────
    for (let i = 0; i < 4; i++) {
      const ang = st.punto_theta + (i * Math.PI / 2);
      ctx.strokeStyle = C.radio;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * R_px, cy + Math.sin(ang) * R_px);
      ctx.stroke();
    }

    // ── Posición del punto marcador ───────────────────────
    // ángulo: 0 = arriba (−π/2), gira según signo de omega
    const pAng = st.punto_theta - Math.PI / 2;
    const px   = cx + Math.cos(pAng) * R_px;
    const py   = cy + Math.sin(pAng) * R_px;

    // Trail
    trail.push({ x: px, y: py });
    if (trail.length > TRAIL_LEN) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      const a = i / trail.length;
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.22})`;
      ctx.lineWidth   = a * 2.5;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    // ── Vectores en el punto marcador ─────────────────────
    const VEC_SCALE = 22;   // px por (m/s) o (m/s²)

    // Dirección tangencial: perpendicular al radio, en sentido de ω
    const tangDir = st.omega >= 0 ? 1 : -1;
    const tanAng  = pAng + (Math.PI / 2) * tangDir;

    // v_tan (verde) — velocidad tangencial
    const vtLen = Math.min(Math.abs(st.v_tan) * VEC_SCALE, 110);
    if (vtLen > 3) {
      const vtx2 = px + Math.cos(tanAng) * vtLen;
      const vty2 = py + Math.sin(tanAng) * vtLen;
      arrow(px, py, vtx2, vty2, C.vtan, 2.5);
      lbl(`v=${Engine.fmt(st.v_tan)}`, vtx2 + 6, vty2 - 4, C.vtan);
    }

    // a_tan (dorado) — aceleración tangencial
    const atLen = Math.min(Math.abs(st.a_tan) * VEC_SCALE * 1.2, 95);
    if (atLen > 3) {
      const atDir = st.alpha >= 0 ? tangDir : -tangDir;
      const atAng = pAng + (Math.PI / 2) * atDir;
      const atx2  = px + Math.cos(atAng) * atLen;
      const aty2  = py + Math.sin(atAng) * atLen;
      // Dibuja ligeramente desplazada para no solapar con v_tan
      const off = 10;
      const ox = Math.cos(pAng) * off;
      const oy = Math.sin(pAng) * off;
      arrow(px + ox, py + oy, atx2 + ox, aty2 + oy, C.atan, 2.5);
      lbl(`aₜ=${Engine.fmt(st.a_tan)}`, atx2 + ox + 6, aty2 + oy + 4, C.atan);
    }

    // a_rad (rojo) — hacia el centro
    const arLen = Math.min(Math.abs(st.a_rad) * VEC_SCALE * 0.9, 100);
    if (arLen > 3) {
      // Dirección desde el punto hacia el centro
      const arAng = Math.atan2(cy - py, cx - px);
      const arx2  = px + Math.cos(arAng) * arLen;
      const ary2  = py + Math.sin(arAng) * arLen;
      arrow(px, py, arx2, ary2, C.arad, 2.5);
      lbl(`aᵣ=${Engine.fmt(st.a_rad)}`, arx2 - 6, ary2 - 8, C.arad, 'right');
    }

    // ── Centro del disco ──────────────────────────────────
    ctx.fillStyle = C.discoB;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // ── Punto marcador ────────────────────────────────────
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = C.punto;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── Radio visible (línea del centro al punto) ─────────
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label R
    const rMidX = cx + Math.cos(pAng) * R_px * 0.5;
    const rMidY = cy + Math.sin(pAng) * R_px * 0.5;
    lbl(`R=${Engine.fmt(st.R)}m`, rMidX + 6, rMidY - 4, C.tx2);

    // ── Indicador ω (arco curvo encima del disco) ─────────
    drawOmegaArrow(cx, cy, R_px + 20, st.omega);

    // ── HUD ───────────────────────────────────────────────
    drawHUD(st);

    // ── Estado en la parte de abajo ───────────────────────
    drawStatus(st, W, H);
  }

  // ── Flecha curva de ω ─────────────────────────────────────
  function drawOmegaArrow(cx, cy, r, omega) {
    if (Math.abs(omega) < 0.05) return;
    const spanAng = Math.min(Math.abs(omega) * 0.15, 1.2);
    const startAng = -Math.PI * 0.65;
    const endAng   = startAng + (omega >= 0 ? spanAng : -spanAng);

    ctx.save();
    ctx.strokeStyle = C.omega;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAng, endAng, omega < 0);
    ctx.stroke();

    // Punta de flecha al final del arco
    const tipAng  = endAng;
    const perpAng = tipAng + (omega >= 0 ? Math.PI / 2 : -Math.PI / 2);
    const tx = cx + Math.cos(tipAng) * r;
    const ty = cy + Math.sin(tipAng) * r;
    const h  = 9;
    ctx.fillStyle = C.omega;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - h * Math.cos(perpAng - 0.4), ty - h * Math.sin(perpAng - 0.4));
    ctx.lineTo(tx - h * Math.cos(perpAng + 0.4), ty - h * Math.sin(perpAng + 0.4));
    ctx.closePath(); ctx.fill();

    // Label ω
    const labelAng = (startAng + endAng) / 2;
    const lx = cx + Math.cos(labelAng) * (r + 18);
    const ly = cy + Math.sin(labelAng) * (r + 18);
    lbl(`ω=${Engine.fmt(omega)}`, lx, ly, C.omega, 'center', 10);
    ctx.restore();
  }

  // ── HUD ──────────────────────────────────────────────────
  function drawHUD(st) {
    const lines = [
      { label: 'R',     val: Engine.fmt(st.R)     + ' m',     color: '#e6edf3' },
      { label: 'α',     val: Engine.fmt(st.alpha)  + ' rad/s²', color: '#e3b341' },
      { label: 'ω',     val: Engine.fmt(st.omega)  + ' rad/s',  color: '#58a6ff' },
      { label: 'θ',     val: Engine.fmt(st.theta)  + ' rad',    color: '#58a6ff' },
      { label: 'v',     val: Engine.fmt(st.v_tan)  + ' m/s',    color: '#3fb950' },
      { label: 'aₜ',   val: Engine.fmt(st.a_tan)  + ' m/s²',   color: '#e3b341' },
      { label: 'aᵣ',   val: Engine.fmt(st.a_rad)  + ' m/s²',   color: '#f85149' },
      { label: 't',     val: Engine.fmt(st.t)      + ' s',      color: '#8b949e' },
    ];

    const bx = 14;
    let   by = 22;
    ctx.font = '10px Space Mono, monospace';
    lines.forEach(l => {
      ctx.fillStyle = '#484f58';
      ctx.textAlign = 'right';
      ctx.fillText(l.label, bx + 24, by);
      ctx.fillStyle = l.color;
      ctx.textAlign = 'left';
      ctx.fillText(l.val, bx + 28, by);
      by += 15;
    });
  }

  // ── Estado inferior ──────────────────────────────────────
  function drawStatus(st, W, H) {
    let msg, color;
    if (Math.abs(st.omega) < 0.05 && Math.abs(st.alpha) < 0.05) {
      msg   = '⬤ Reposo — ω = 0, α = 0';
      color = '#8b949e';
    } else if (Math.abs(st.alpha) < 0.05) {
      msg   = `◉ MCU — α = 0 · ω = ${Engine.fmt(st.omega)} rad/s constante`;
      color = '#58a6ff';
    } else if (st.omega * st.alpha > 0) {
      msg   = `↑ MCUV Acelerado — ω ${st.omega >= 0 ? '↑' : '↓'}`;
      color = '#3fb950';
    } else {
      msg   = `↓ MCUV Desacelerado — ω ${st.omega >= 0 ? '↓' : '↑'}`;
      color = '#f85149';
    }

    ctx.font      = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(msg, W / 2, H - 18);
  }

  // ── Frame loop ───────────────────────────────────────────
  let lastPanelTime = 0;
  const PANEL_INTERVAL_MS = 100; // ~10 Hz throttle para DOM sin reducir FPS del canvas

  function frame() {
    Engine.step(clock.tick());
    const st = Engine.getState();
    draw(st);
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (now - lastPanelTime >= PANEL_INTERVAL_MS || st.paused) {
      UI.updatePanel(Engine.getSustitucion());
      lastPanelTime = now;
    }
    animId = requestAnimationFrame(frame);
  }

  function start() {
    clock.reset();
    lastPanelTime = 0;
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }
  function stop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  return { init, start, stop, resize };

})();