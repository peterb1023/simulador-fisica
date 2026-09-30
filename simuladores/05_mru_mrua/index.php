<?php
require_once __DIR__ . '/php/config.php';
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SIM <?= SIM_VERSION ?> — <?= SIM_TITLE ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="css/sim.css">
</head>
<body data-sim-id="05">
<div id="app">
  <header class="sim-header">
    <div class="sim-badge">SIM #<?= SIM_VERSION ?></div>
    <div class="sim-titles">
      <h1><?= SIM_TITLE ?></h1>
      <span><?= SIM_SUBTITLE ?></span>
    </div>
    <nav class="sim-nav">
      <button class="nav-btn active" onclick="setTab('sim',this)">▶ Simulador</button>
      <button class="nav-btn" onclick="setTab('formulas',this)">∑ Fórmulas</button>
      <a href="../../index.php" class="nav-btn" style="text-decoration:none">← Portal</a>
    </nav>
  </header>

  <!-- TAB SIMULADOR -->
  <div id="tab-sim" class="tab active">
  <div class="sim-layout-05">

    <!-- ── PANEL IZQUIERDO ── -->
    <aside class="panel-left">
      <div class="ps">
        <div class="ps-label" style="color:#58a6ff">● MRU — Velocidad constante</div>
        <div class="sl-group">
          <div class="sl-row-05">
            <span class="sl-label" style="color:#58a6ff">x<sub>0</sub></span>
            <input type="range" id="sl-mru-x0"
              min="<?= MRU_X0_MIN ?>" max="<?= MRU_X0_MAX ?>" step="1" value="<?= $defaults['mru_x0'] ?>"
              style="--thumb:#58a6ff">
            <span class="sl-val" id="val-mru-x0"><b><?= $defaults['mru_x0'] ?></b> <span>m</span></span>
          </div>
          <div class="sl-row-05">
            <label class="sl-label" style="color:#58a6ff" for="sl-mru-v">v</label>
            <input type="range" id="sl-mru-v"
              min="<?= MRU_V_MIN ?>" max="<?= MRU_V_MAX ?>" step="0.5" value="<?= $defaults['mru_v'] ?>"
              style="--thumb:#58a6ff">
            <span class="sl-val" id="val-mru-v"><b><?= $defaults['mru_v'] ?></b> <span>m/s</span></span>
          </div>
        </div>
      </div>

      <div class="ps">
        <div class="ps-label" style="color:#f0883e">● MRUA — Con aceleración</div>
        <div class="sl-group">
          <div class="sl-row-05">
            <span class="sl-label" style="color:#f0883e">x<sub>0</sub></span>
            <input type="range" id="sl-mrua-x0"
              min="<?= MRUA_X0_MIN ?>" max="<?= MRUA_X0_MAX ?>" step="1" value="<?= $defaults['mrua_x0'] ?>"
              style="--thumb:#f0883e">
            <span class="sl-val" id="val-mrua-x0"><b><?= $defaults['mrua_x0'] ?></b> <span>m</span></span>
          </div>
          <div class="sl-row-05">
            <span class="sl-label" style="color:#f0883e">v<sub>0</sub></span>
            <input type="range" id="sl-mrua-v0"
              min="<?= MRUA_V0_MIN ?>" max="<?= MRUA_V0_MAX ?>" step="0.5" value="<?= $defaults['mrua_v0'] ?>"
              style="--thumb:#f0883e">
            <span class="sl-val" id="val-mrua-v0"><b><?= $defaults['mrua_v0'] ?></b> <span>m/s</span></span>
          </div>
          <div class="sl-row-05" id="row-mrua-a">
            <label class="sl-label" style="color:#f0883e" for="sl-mrua-a">a</label>
            <input type="range" id="sl-mrua-a"
              min="<?= MRUA_A_MIN ?>" max="<?= MRUA_A_MAX ?>" step="0.5" value="<?= $defaults['mrua_a'] ?>"
              style="--thumb:#f0883e">
            <span class="sl-val" id="val-mrua-a"><b><?= $defaults['mrua_a'] ?></b> <span>m/s²</span></span>
          </div>
        </div>
        <label class="caida-toggle">
          <input type="checkbox" id="chk-caida" onchange="toggleCaida(this)">
          <span class="caida-slider"></span>
          <span class="caida-label">Caída libre (g = <?= GRAVITY ?> m/s²)</span>
        </label>
      </div>

      <div class="ps">
        <div class="ps-label">Duración</div>
        <div class="sl-group">
          <div class="sl-row-05">
            <span class="sl-label">t<sub>max</sub></span>
            <input type="number" id="sl-t" min="<?= T_MAX_MIN ?>" step="1" value="<?= T_MAX_DEFAULT ?>">
            <span class="sl-unit">s</span>
          </div>
        </div>
      </div>

      <div class="ps legend-box">
        <div class="ps-label">Leyenda</div>
        <div class="legend-row"><span class="leg-dot" style="background:#58a6ff"></span>MRU</div>
        <div class="legend-row"><span class="leg-dot" style="background:#f0883e"></span>MRUA</div>
        <div class="legend-row"><span class="leg-dot" style="background:#3fb950"></span>v(t) MRU</div>
        <div class="legend-row"><span class="leg-dot" style="background:#e3b341"></span>v(t) MRUA</div>
      </div>
    </aside>

    <!-- ── CENTRO ── -->
    <main class="panel-center-05">
      <div class="canvas-pista">
        <canvas id="canvasMain"></canvas>
      </div>
      <div class="timeline-bar">
        <button id="btn-tl-reset" onclick="resetSim()" class="tl-btn">⏮</button>
        <button id="btn-tl-play"  onclick="togglePause()" class="tl-btn">⏸</button>
        <div class="tl-track-wrap">
          <input type="range" id="timeline" min="0" max="<?= T_MAX_DEFAULT ?>" step="0.02" value="0">
        </div>
        <span class="tl-cur" id="tl-time">0.00</span>
        <span class="tl-sep">/</span>
        <span class="tl-end" id="tl-max"><?= T_MAX_DEFAULT ?> s</span>
      </div>
      <div class="canvas-graficas">
        <div class="grafica-wrap">
          <div class="grafica-label">x(t) — Posición</div>
          <canvas id="canvasX"></canvas>
        </div>
        <div class="grafica-wrap">
          <div class="grafica-label">v(t) — Velocidad</div>
          <canvas id="canvasV"></canvas>
        </div>
      </div>
    </main>

    <!-- ── PANEL DERECHO ── -->
    <aside class="panel-right">
      <div class="res-section">
        <div class="res-title">Resolución en vivo</div>
        <div class="res-hint">Se actualiza en cada frame</div>
      </div>
      <div class="res-section">
        <div class="res-mode-label" style="color:#58a6ff">MRU</div>
        <div class="step-card" id="sust-mru-pos">—</div>
      </div>
      <div class="res-section">
        <div class="step-card" id="sust-mru-vel">—</div>
      </div>
      <div class="res-section">
        <div class="res-mode-label" style="color:#f0883e">MRUA</div>
        <div class="step-card" id="sust-mrua-vel">—</div>
      </div>
      <div class="res-section">
        <div class="step-card" id="sust-mrua-pos">—</div>
      </div>
      <div class="res-section" style="margin-top:auto">
        <div class="res-title">Diferencia clave</div>
        <div class="diff-table">
          <div class="diff-row diff-head"><span></span><span style="color:#58a6ff">MRU</span><span style="color:#f0883e">MRUA</span></div>
          <div class="diff-row"><span>a</span><span>0</span><span>≠ 0</span></div>
          <div class="diff-row"><span>v(t)</span><span>constante</span><span>lineal</span></div>
          <div class="diff-row"><span>x(t)</span><span>lineal</span><span>parabólica</span></div>
        </div>
      </div>
    </aside>

  </div><!-- /.sim-layout-05 -->
  </div><!-- /#tab-sim -->

  <!-- TAB FÓRMULAS -->
  <div id="tab-formulas" class="tab">
    <?php include __DIR__ . '/php/formulas.php'; ?>
  </div>

</div><!-- /#app -->

<!-- JS: orden importante — engine primero, luego render, luego ui -->
<script src="../../js/sim-common.js"></script>
<script src="js/engine.js"></script>
<script src="../../js/canvas-common.js"></script>
<script src="js/render.js"></script>
<script src="js/ui.js"></script>
<link rel="stylesheet" href="../../css/accessibility.css">
<script src="../../js/accessibility.js"></script>
<link rel="stylesheet" href="../../css/registry.css">
<script src="../../js/sim-registry.js"></script>
<script src="../../js/sim-groups.js"></script>
<script src="../../js/sim-records-ui.js"></script>
</body>
</html>