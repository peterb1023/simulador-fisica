<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
$js_cfg = json_encode($cfg, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lab Virtual — Física I</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0d1117;
  --panel:   #161b22;
  --card:    #1c2128;
  --input:   #21262d;
  --border:  #30363d;
  --borderL: #484f58;
  --tx1:     #e6edf3;
  --tx2:     #8b949e;
  --tx3:     #484f58;
  --accent:  #58a6ff;
  --ep:      #388bfd;
  --ec:      #3fb950;
  --th:      #f85149;
  --et:      #e3b341;
  --purple:  #bc8cff;
  --orange:  #f0883e;
  --r:  8px;
  --rs: 5px;
  --font: 'Syne', sans-serif;
  --mono: 'Space Mono', monospace;
}

html, body { min-height: 100%; background: var(--bg); color: var(--tx1); font-family: var(--font); }

/* ── Header ── */
.portal-header {
  display: flex; align-items: center; gap: 16px;
  padding: 0 32px; height: 60px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
}
.portal-badge {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  background: var(--accent); color: #0d1117;
  padding: 3px 10px; border-radius: 20px; letter-spacing: .08em;
  white-space: nowrap;
}
.portal-title { font-size: 16px; font-weight: 800; }
.portal-subtitle { font-size: 11px; color: var(--tx2); margin-top: 1px; }
.portal-meta { margin-left: auto; display: flex; align-items: center; gap: 20px; }
.portal-meta-item { font-family: var(--mono); font-size: 10px; color: var(--tx3); }
.portal-meta-item b { color: var(--tx2); }

/* ── Hero ── */
.hero {
  padding: 60px 32px 48px;
  max-width: 1100px; margin: 0 auto;
}
.hero-eyebrow {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: .15em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.hero-eyebrow::before {
  content: ''; display: inline-block;
  width: 24px; height: 1px; background: var(--accent);
}
.hero h1 {
  font-size: clamp(32px, 5vw, 52px); font-weight: 800;
  line-height: 1.1; margin-bottom: 16px; letter-spacing: -.02em;
}
.hero h1 span { color: var(--accent); }
.hero p { font-size: 15px; color: var(--tx2); max-width: 560px; line-height: 1.7; margin-bottom: 32px; }
.hero-stats {
  display: flex; gap: 32px; flex-wrap: wrap;
}
.hs { }
.hs-n { font-family: var(--mono); font-size: 28px; font-weight: 700; color: var(--tx1); }
.hs-l { font-size: 11px; color: var(--tx3); margin-top: 2px; text-transform: uppercase; letter-spacing: .06em; }

/* ── Divider ── */
.divider { height: 1px; background: var(--border); margin: 0 32px; }

/* ── View Tabs ── */
.view-tabs {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; gap: 4px;
  padding: 24px 32px 0;
}
.view-tab {
  background: transparent; border: 1px solid var(--border);
  color: var(--tx2); font-family: var(--font); font-size: 12px;
  padding: 5px 16px; border-radius: 20px; cursor: pointer; transition: all .15s;
}
.view-tab:hover { border-color: var(--borderL); color: var(--tx1); }
.view-tab.active { background: var(--accent); border-color: var(--accent); color: #0d1117; font-weight: 600; }
.view-label {
  margin-left: auto; font-size: 11px; color: var(--tx3);
  font-family: var(--mono);
}

/* ── Semana View ── */
.semana-view { display: none; }
.semana-view.active { display: block; }

/* ── Week group ── */
.week-group {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 32px 0;
}
.week-header {
  display: flex; align-items: baseline; gap: 12px;
  margin-bottom: 16px;
}
.week-num {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  color: var(--tx3); text-transform: uppercase; letter-spacing: .08em;
}
.week-label { font-size: 13px; color: var(--tx2); }

/* ── Categoria View ── */
.cat-view { display: none; }
.cat-view.active { display: block; }
.cat-group {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 32px 0;
}
.cat-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.cat-icon {
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
}
.cat-name { font-size: 14px; font-weight: 600; }
.cat-count { font-size: 11px; color: var(--tx3); font-family: var(--mono); margin-left: auto; }

/* ── Sim Card ── */
.sim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.sim-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  cursor: pointer;
  transition: all .15s;
  text-decoration: none; color: inherit;
  display: block;
  position: relative;
  overflow: hidden;
}
.sim-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--card-accent, var(--accent));
  transition: opacity .15s;
  opacity: .6;
}
.sim-card:hover {
  border-color: var(--card-accent, var(--accent));
  background: #1f242b;
  transform: translateY(-1px);
}
.sim-card:hover::before { opacity: 1; }

.sc-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 10px;
}
.sc-num {
  font-family: var(--mono); font-size: 10px;
  color: var(--tx3); flex-shrink: 0;
}
.sc-status {
  margin-left: auto; flex-shrink: 0;
}
.badge {
  font-family: var(--mono); font-size: 9px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  padding: 2px 8px; border-radius: 10px;
}
.badge-done { background: rgba(63,185,80,.15); color: var(--ec); border: 1px solid rgba(63,185,80,.3); }
.badge-next { background: rgba(88,166,255,.15); color: var(--accent); border: 1px solid rgba(88,166,255,.3); }
.badge-plan { background: rgba(139,148,158,.1); color: var(--tx3); border: 1px solid var(--border); }

.sc-title { font-size: 14px; font-weight: 800; margin-bottom: 6px; line-height: 1.3; }
.sc-type {
  font-size: 10px; color: var(--tx3); font-family: var(--mono);
  text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: 10px;
}
.sc-formulas {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-top: 10px;
}
.sc-formula-tag {
  font-family: var(--mono); font-size: 10px;
  background: var(--input); border: 1px solid var(--border);
  color: var(--tx2); padding: 2px 7px; border-radius: 4px;
}

/* Done card glow */
.sim-card.done .sc-title { color: var(--tx1); }
.sim-card.next .sc-title { color: var(--accent); }

/* ── Extras Section ── */
.extras-section {
  max-width: 1100px; margin: 0 auto;
  padding: 40px 32px 60px;
}
.extras-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px;
}
.extras-header-line { flex: 1; height: 1px; background: var(--border); }
.extras-label {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  color: var(--tx3); text-transform: uppercase; letter-spacing: .1em;
  white-space: nowrap;
}
.extras-note { font-size: 12px; color: var(--tx3); margin-bottom: 16px; line-height: 1.6; }
.extras-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.extra-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); padding: 16px;
  border-left: 3px solid var(--purple);
  transition: all .15s; cursor: pointer;
  text-decoration: none; color: inherit; display: block;
}
.extra-card:hover { border-color: var(--purple); background: #1f242b; }
.extra-tag {
  font-family: var(--mono); font-size: 9px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--purple); margin-bottom: 8px;
}
.extra-title { font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.extra-desc { font-size: 12px; color: var(--tx2); line-height: 1.5; }
.extra-badge {
  display: inline-block; margin-top: 10px;
  font-family: var(--mono); font-size: 9px;
  background: rgba(188,140,255,.1); color: var(--purple);
  border: 1px solid rgba(188,140,255,.25);
  padding: 2px 8px; border-radius: 10px;
}

/* ── Progress bar ── */
.progress-bar-wrap {
  background: var(--input); border-radius: 2px;
  height: 3px; margin-top: 12px; overflow: hidden;
}
.progress-bar { height: 100%; border-radius: 2px; transition: width .3s; }

/* ── Footer ── */
.portal-footer {
  border-top: 1px solid var(--border);
  padding: 20px 32px;
  display: flex; align-items: center; gap: 12px;
  max-width: 1100px; margin: 0 auto;
}
.footer-txt { font-size: 11px; color: var(--tx3); }
.footer-stack { margin-left: auto; display: flex; gap: 8px; }
.tech-tag {
  font-family: var(--mono); font-size: 9px;
  background: var(--input); border: 1px solid var(--border);
  color: var(--tx3); padding: 2px 8px; border-radius: 4px;
}

/* ── Scan line animation ── */
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
.scanline {
  position: fixed; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(transparent, rgba(88,166,255,.06), transparent);
  pointer-events: none; z-index: 999;
  animation: scanline 6s linear infinite;
}
</style>
<style>:focus-visible{outline:3px solid #79c0ff;outline-offset:3px}</style>
</head>
<body>

<div class="scanline"></div>

<!-- HEADER -->
<header class="portal-header">
  <div class="portal-badge">LAB FÍSICA I</div>
  <div>
    <div class="portal-title">Simuladores Virtuales</div>
    <div class="portal-subtitle">Física I — Ing. Civil · XAMPP + PHP + Canvas</div>
  </div>
  <div class="portal-meta">
    <div class="portal-meta-item"><b>13</b> / 13 con pruebas numéricas</div>
    <div class="portal-meta-item"><b>Stack:</b> PHP · JS · HTML5</div>
  </div>
</header>

<!-- HERO -->
<div class="hero">
  <div class="hero-eyebrow">Lab Virtual · Física I</div>
  <h1>Aprende física<br>con <span>simulaciones</span><br>interactivas.</h1>
  <p>Visualiza fórmulas resolviéndose en tiempo real. Ajusta parámetros, observa cómo cambian las energías, fuerzas y trayectorias — todo basado en las fórmulas exactas de tu profesor.</p>
  <div class="hero-stats">
    <div class="hs"><div class="hs-n">13</div><div class="hs-l">Simuladores</div></div>
    <div class="hs"><div class="hs-n">5</div><div class="hs-l">Categorías</div></div>
    <div class="hs"><div class="hs-n">13</div><div class="hs-l">Semanas</div></div>
    <div class="hs"><div class="hs-n">2</div><div class="hs-l">Extras</div></div>
  </div>
</div>

<div class="divider"></div>

<!-- VIEW TABS -->
<div class="view-tabs">
  <button class="view-tab active" onclick="switchView('semana', this)">Por Semana</button>
  <button class="view-tab" onclick="switchView('categoria', this)">Por Categoría</button>
  <div class="view-label">13 simuladores · 2 extras</div>
</div>

<!-- ══════════════════════════════════════════════
     VISTA: POR SEMANA
══════════════════════════════════════════════ -->
<div class="semana-view active" id="view-semana">

  <!-- Semana 1–2 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semanas 1–2</span>
      <span class="week-label">Vectores y Unidades</span>
    </div>
    <div class="sim-grid">

      <a class="sim-card" href="simuladores/02_vectores/index.php" style="--card-accent:#388bfd">
        <div class="sc-head">
          <span class="sc-num">SIM 02</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Vectores</div>
        <div class="sc-type">Plano cartesiano interactivo</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">r = √(Vx²+Vy²)</span>
          <span class="sc-formula-tag">Vx = r·cosθ</span>
          <span class="sc-formula-tag">R = ΣV</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ep)"></div></div>
      </a>

      <a class="sim-card" href="simuladores/03_unidades/index.php" style="--card-accent:#3fb950">
        <div class="sc-head">
          <span class="sc-num">SIM 03</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Conversión de Unidades</div>
        <div class="sc-type">Calculadora paso a paso</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">Prefijos SI</span>
          <span class="sc-formula-tag">Exa → Atto</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ec)"></div></div>
      </a>

    </div>
  </div>

  <!-- Semana 3–4 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semanas 3–4</span>
      <span class="week-label">Cinemática 1D</span>
    </div>
    <div class="sim-grid">

      <a class="sim-card" href="simuladores/04_cinematica_1d/index.php" style="--card-accent:#e3b341">
        <div class="sc-head">
          <span class="sc-num">SIM 04</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Cinemática 1D</div>
        <div class="sc-type">Gráficas animadas x(t) y v(t)</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">v = v₀ + at</span>
          <span class="sc-formula-tag">x = x₀ + v₀t + ½at²</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--et)"></div></div>
      </a>

      <a class="sim-card" href="simuladores/05_mru_mrua/index.php" style="--card-accent:#e3b341">
        <div class="sc-head">
          <span class="sc-num">SIM 05</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">MRU y MRUA</div>
        <div class="sc-type">Canvas animado</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">v constante</span>
          <span class="sc-formula-tag">a constante</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--et)"></div></div>
      </a>

    </div>
  </div>

  <!-- Semana 5 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semana 5</span>
      <span class="week-label">Cinemática 2D — Proyectiles</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/06_proyectiles/index.php" style="--card-accent:#f0883e">
        <div class="sc-head">
          <span class="sc-num">SIM 06</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Proyectiles</div>
        <div class="sc-type">Canvas animado con trayectoria</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">x = (v₀cosα)t</span>
          <span class="sc-formula-tag">y = v₀yt − ½gt²</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--orange)"></div></div>
      </a>
    </div>
  </div>

  <!-- Semana 6 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semana 6</span>
      <span class="week-label">Movimiento Circular</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/07_circular/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head">
          <span class="sc-num">SIM 07</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Movimiento Circular</div>
        <div class="sc-type">Canvas animado con flechas</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">arad = v²/R</span>
          <span class="sc-formula-tag">v = 2πR/T</span>
          <span class="sc-formula-tag">atan = d|v|/dt</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--purple)"></div></div>
      </a>
    </div>
  </div>

  <!-- Semana 7–8 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semanas 7–8</span>
      <span class="week-label">Leyes de Newton</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/08_newton/index.php" style="--card-accent:#f85149">
        <div class="sc-head">
          <span class="sc-num">SIM 08</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Leyes de Newton</div>
        <div class="sc-type">Diagrama de cuerpo libre interactivo</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">ΣF = ma</span>
          <span class="sc-formula-tag">w = mg</span>
          <span class="sc-formula-tag">T = m(g+ay)</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--th)"></div></div>
      </a>
    </div>
  </div>

  <!-- Semana 9–11 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semanas 9–11</span>
      <span class="week-label">Trabajo y Energía</span>
    </div>
    <div class="sim-grid">

      <a class="sim-card done" href="simuladores/01_energia/index.php" style="--card-accent:#3fb950">
        <div class="sc-head">
          <span class="sc-num">SIM 01</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Energía en la Pista</div>
        <div class="sc-type">Canvas animado · Conservación</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">U = mgh</span>
          <span class="sc-formula-tag">K = ½mv²</span>
          <span class="sc-formula-tag">E = K + U</span>
          <span class="sc-formula-tag">W = −ΔU</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ec)"></div></div>
      </a>

      <a class="sim-card" href="simuladores/09_trabajo/index.php" style="--card-accent:#3fb950">
        <div class="sc-head">
          <span class="sc-num">SIM 09</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Trabajo</div>
        <div class="sc-type">Canvas · Fuerza y desplazamiento</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">W = Fs·cosφ</span>
          <span class="sc-formula-tag">W_tot = ΔK</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ec)"></div></div>
      </a>

      <a class="sim-card" href="simuladores/10_potencia/index.php" style="--card-accent:#3fb950">
        <div class="sc-head">
          <span class="sc-num">SIM 10</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Potencia</div>
        <div class="sc-type">Calculadora con resolución</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">P = W/t</span>
          <span class="sc-formula-tag">P = F·v</span>
          <span class="sc-formula-tag">1 hp = 746 W</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ec)"></div></div>
      </a>

    </div>
  </div>

  <!-- Semana 12–13 -->
  <div class="week-group">
    <div class="week-header">
      <span class="week-num">Semanas 12–13</span>
      <span class="week-label">Cinemática Rotacional</span>
    </div>
    <div class="sim-grid">

      <a class="sim-card" href="simuladores/11_rotacional/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head">
          <span class="sc-num">SIM 11</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Cinemática Rotacional</div>
        <div class="sc-type">Canvas · Disco girando</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">ω = Δθ/Δt</span>
          <span class="sc-formula-tag">v = rω</span>
          <span class="sc-formula-tag">a_tan = rα</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--purple)"></div></div>
      </a>

      <a class="sim-card" href="simuladores/12_inercia/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head">
          <span class="sc-num">SIM 12</span>
          <span class="sc-status"><span class="badge badge-done">✓ Probado</span></span>
        </div>
        <div class="sc-title">Momento de Inercia</div>
        <div class="sc-type">Comparador visual de cuerpos</div>
        <div class="sc-formulas">
          <span class="sc-formula-tag">I = Σmr²</span>
          <span class="sc-formula-tag">K = ½Iω²</span>
          <span class="sc-formula-tag">I_P = I_cm + Md²</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--purple)"></div></div>
      </a>
      <a class="sim-card" href="simuladores/13_llanta/index.php" style="--card-accent:#3fb950"><div class="sc-head"><span class="sc-num">SIM 13</span><span class="badge badge-done">✓ Probado</span></div><div class="sc-title">Llanta compuesta</div><div class="sc-type">Dos paredes anulares + huella cilíndrica</div><div class="sc-formulas"><span class="sc-formula-tag">I = 2Ip + Ih</span><span class="sc-formula-tag">K = ½Iω²</span></div></a>

    </div>
  </div>

</div><!-- /view-semana -->


<!-- ══════════════════════════════════════════════
     VISTA: POR CATEGORÍA
══════════════════════════════════════════════ -->
<div class="cat-view" id="view-categoria">

  <!-- Vectores y coordenadas -->
  <div class="cat-group">
    <div class="cat-header">
      <div class="cat-icon" style="background:rgba(56,139,253,.15)">📐</div>
      <span class="cat-name">Vectores y Coordenadas</span>
      <span class="cat-count">SIM 02, 03</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/02_vectores/index.php" style="--card-accent:#388bfd">
        <div class="sc-head"><span class="sc-num">SIM 02</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Vectores</div>
        <div class="sc-type">Plano cartesiano interactivo</div>
        <div class="sc-formulas"><span class="sc-formula-tag">r = √(Vx²+Vy²)</span><span class="sc-formula-tag">θ = atan2(Vy,Vx)</span><span class="sc-formula-tag">R = √(A²+B²+2AB·cosθ)</span></div>
      </a>
      <a class="sim-card" href="simuladores/03_unidades/index.php" style="--card-accent:#3fb950">
        <div class="sc-head"><span class="sc-num">SIM 03</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Conversión de Unidades</div>
        <div class="sc-type">Calculadora paso a paso</div>
        <div class="sc-formulas"><span class="sc-formula-tag">Prefijos SI</span><span class="sc-formula-tag">Exa → Atto</span></div>
      </a>
    </div>
  </div>

  <!-- Cinemática lineal -->
  <div class="cat-group">
    <div class="cat-header">
      <div class="cat-icon" style="background:rgba(227,179,65,.15)">↗</div>
      <span class="cat-name">Cinemática Lineal</span>
      <span class="cat-count">SIM 04, 05, 06</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/04_cinematica_1d/index.php" style="--card-accent:#e3b341">
        <div class="sc-head"><span class="sc-num">SIM 04</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Cinemática 1D</div>
        <div class="sc-type">Gráficas animadas x(t), v(t)</div>
        <div class="sc-formulas"><span class="sc-formula-tag">v = v₀ + at</span><span class="sc-formula-tag">v² = v₀² + 2aΔx</span></div>
      </a>
      <a class="sim-card" href="simuladores/05_mru_mrua/index.php" style="--card-accent:#e3b341">
        <div class="sc-head"><span class="sc-num">SIM 05</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">MRU y MRUA</div>
        <div class="sc-type">Canvas animado</div>
        <div class="sc-formulas"><span class="sc-formula-tag">v constante</span><span class="sc-formula-tag">a constante</span></div>
      </a>
      <a class="sim-card" href="simuladores/06_proyectiles/index.php" style="--card-accent:#f0883e">
        <div class="sc-head"><span class="sc-num">SIM 06</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Proyectiles</div>
        <div class="sc-type">Canvas animado con trayectoria</div>
        <div class="sc-formulas"><span class="sc-formula-tag">x = (v₀cosα)t</span><span class="sc-formula-tag">y = v₀yt − ½gt²</span></div>
      </a>
    </div>
  </div>

  <!-- Dinámica -->
  <div class="cat-group">
    <div class="cat-header">
      <div class="cat-icon" style="background:rgba(248,81,73,.15)">⇉</div>
      <span class="cat-name">Dinámica (Newton)</span>
      <span class="cat-count">SIM 08</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/08_newton/index.php" style="--card-accent:#f85149">
        <div class="sc-head"><span class="sc-num">SIM 08</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Leyes de Newton</div>
        <div class="sc-type">Diagrama de cuerpo libre</div>
        <div class="sc-formulas"><span class="sc-formula-tag">ΣF = ma</span><span class="sc-formula-tag">w = mg</span><span class="sc-formula-tag">T = m(g+ay)</span></div>
      </a>
    </div>
  </div>

  <!-- Trabajo y Energía -->
  <div class="cat-group">
    <div class="cat-header">
      <div class="cat-icon" style="background:rgba(63,185,80,.15)">⚡</div>
      <span class="cat-name">Trabajo y Energía</span>
      <span class="cat-count">SIM 01, 09, 10</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card done" href="simuladores/01_energia/index.php" style="--card-accent:#3fb950">
        <div class="sc-head"><span class="sc-num">SIM 01</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Energía en la Pista</div>
        <div class="sc-type">Canvas animado · Conservación</div>
        <div class="sc-formulas"><span class="sc-formula-tag">U = mgh</span><span class="sc-formula-tag">K = ½mv²</span><span class="sc-formula-tag">E = K + U</span></div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--ec)"></div></div>
      </a>
      <a class="sim-card" href="simuladores/09_trabajo/index.php" style="--card-accent:#3fb950">
        <div class="sc-head"><span class="sc-num">SIM 09</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Trabajo</div>
        <div class="sc-type">Canvas · F × desplazamiento</div>
        <div class="sc-formulas"><span class="sc-formula-tag">W = Fs·cosφ</span><span class="sc-formula-tag">W_tot = ΔK</span></div>
      </a>
      <a class="sim-card" href="simuladores/10_potencia/index.php" style="--card-accent:#3fb950">
        <div class="sc-head"><span class="sc-num">SIM 10</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Potencia</div>
        <div class="sc-type">Calculadora con resolución</div>
        <div class="sc-formulas"><span class="sc-formula-tag">P = W/t</span><span class="sc-formula-tag">P = F·v</span></div>
      </a>
    </div>
  </div>

  <!-- Rotacional -->
  <div class="cat-group">
    <div class="cat-header">
      <div class="cat-icon" style="background:rgba(188,140,255,.15)">↻</div>
      <span class="cat-name">Circular y Rotacional</span>
      <span class="cat-count">SIM 07, 11, 12</span>
    </div>
    <div class="sim-grid">
      <a class="sim-card" href="simuladores/07_circular/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head"><span class="sc-num">SIM 07</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Movimiento Circular</div>
        <div class="sc-type">Canvas con flechas arad, atan</div>
        <div class="sc-formulas"><span class="sc-formula-tag">arad = v²/R</span><span class="sc-formula-tag">v = 2πR/T</span></div>
      </a>
      <a class="sim-card" href="simuladores/11_rotacional/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head"><span class="sc-num">SIM 11</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Cinemática Rotacional</div>
        <div class="sc-type">Canvas · Disco girando</div>
        <div class="sc-formulas"><span class="sc-formula-tag">ω = Δθ/Δt</span><span class="sc-formula-tag">v = rω</span></div>
      </a>
      <a class="sim-card" href="simuladores/12_inercia/index.php" style="--card-accent:#bc8cff">
        <div class="sc-head"><span class="sc-num">SIM 12</span><span class="sc-status"><span class="badge badge-done">✓ Probado</span></span></div>
        <div class="sc-title">Momento de Inercia</div>
        <div class="sc-type">Comparador visual</div>
        <div class="sc-formulas"><span class="sc-formula-tag">I = Σmr²</span><span class="sc-formula-tag">K = ½Iω²</span></div>
      </a>
      <a class="sim-card" href="simuladores/13_llanta/index.php" style="--card-accent:#3fb950"><div class="sc-head"><span class="sc-num">SIM 13</span><span class="badge badge-done">✓ Probado</span></div><div class="sc-title">Llanta compuesta</div><div class="sc-type">Dos paredes anulares + huella cilíndrica</div><div class="sc-formulas"><span class="sc-formula-tag">I = 2Ip + Ih</span><span class="sc-formula-tag">K = ½Iω²</span></div></a>
    </div>
  </div>

</div><!-- /view-categoria -->


<!-- ══════════════════════════════════════════════
     EXTRAS
══════════════════════════════════════════════ -->
<div class="extras-section">
  <div class="extras-header">
    <div class="extras-label">Otros proyectos</div>
    <div class="extras-header-line"></div>
  </div>
  <p class="extras-note">Proyectos independientes de matemáticas avanzadas. No se modifican, solo se enlazan desde aquí.</p>
  <div class="extras-grid">
    <a class="extra-card" href="extras/simulador_ABS.html">
      <div class="extra-tag">Matemáticas avanzadas</div>
      <div class="extra-title">Transformada de Laplace</div>
      <div class="extra-desc">Simulador de sistemas de control ABS. Visualización de funciones en el dominio s.</div>
      <span class="extra-badge">Extra · HTML standalone</span>
    </a>
    <a class="extra-card" href="extras/simulador_transporte.html">
      <div class="extra-tag">Grafos y rutas</div>
      <div class="extra-title">Rutas de Transporte</div>
      <div class="extra-desc">Sistemas matriciales de rutas. Aviso: conserva un error histórico de cálculo (bC no definido).</div>
      <span class="extra-badge">Extra · HTML standalone</span>
    </a>
  </div>
</div>

<!-- FOOTER -->
<div style="border-top:1px solid var(--border)">
  <div class="portal-footer">
    <span class="footer-txt">Lab Virtual — Física I · 2026</span>
    <div class="footer-stack">
      <span class="tech-tag">PHP</span>
      <span class="tech-tag">HTML5 Canvas</span>
      <span class="tech-tag">JS Vanilla</span>
      <span class="tech-tag">XAMPP</span>
    </div>
  </div>
</div>

<script>
function switchView(name, btn) {
  document.querySelectorAll('.semana-view, .cat-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  btn.classList.add('active');
}
</script>
</body>
</html>