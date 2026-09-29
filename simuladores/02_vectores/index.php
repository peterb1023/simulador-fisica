<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
$js_cfg = json_encode($cfg, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SIM <?= $cfg['sim_num'] ?> — <?= htmlspecialchars($cfg['titulo']) ?></title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/sim.css">
</head>
<body>

<div id="app">

  <!-- HEADER -->
  <header class="sim-header">
    <div class="sim-badge">SIM #<?= $cfg['sim_num'] ?></div>
    <div class="sim-titles">
      <h1><?= htmlspecialchars($cfg['titulo']) ?></h1>
      <span><?= htmlspecialchars($cfg['subtitulo']) ?></span>
    </div>
    <nav class="sim-nav">
      <button class="nav-btn active" onclick="setTab('sim',this)">▶ Simulador</button>
      <button class="nav-btn" onclick="setTab('formulas',this)">∑ Fórmulas</button>
      <a href="../../index.php" class="nav-btn" style="text-decoration:none">← Portal</a>
    </nav>
  </header>

  <!-- TAB: SIMULADOR -->
  <div id="tab-sim" class="tab active">
    <div class="sim-layout">

      <!-- PANEL IZQ: lista de vectores -->
      <aside class="panel-left">

        <div class="ps">
          <div class="ps-label">Vectores</div>
          <div id="vec-controls">
            <!-- Cards generadas por ui.js -->
          </div>
          <button class="btn-add-vec" id="btn-add-vec" onclick="addVec()">
            + Agregar vector
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn-reset-sm" onclick="resetSim()" style="flex: 1;">↺ Reiniciar</button>
            <button class="btn-reset-sm" onclick="resetCamera()" style="flex: 1;">🎯 Centrar</button>
          </div>

          <div style="margin-top: 16px; padding: 10px; background: rgba(56,139,253,0.1); border-radius: 6px; border-left: 2px solid #388bfd;">
            <div style="font-size: 10px; color: #8b949e; line-height: 1.5;">
              <strong style="color: #58a6ff;">Controles del plano:</strong><br>
              ▸ Arrastra en vacío = Desplazar<br>
              ▸ Rueda del ratón = Zoom
            </div>
          </div>
        </div>

      </aside>

      <!-- CANVAS CENTRAL -->
      <main class="panel-center">
        <div class="temporal-scene"><canvas id="simCanvas"></canvas></div>
        <div class="zoom-controls">
          <button class="zoom-btn" onclick="Renderer.zoomIn()" title="Zoom in (+)">➕</button>
          <button class="zoom-btn" onclick="Renderer.zoomOut()" title="Zoom out (-)">➖</button>
        </div>
      </main>

      <!-- PANEL DER: resultante -->
      <aside class="panel-right">

        <!-- Resultante -->
        <div class="res-section">
          <div class="res-title">Resultante R</div>
          <div class="res-grid">
            <div class="res-cell">
              <div class="res-cell-label">Rx</div>
              <div class="res-cell-val" id="res-rx">—</div>
            </div>
            <div class="res-cell">
              <div class="res-cell-label">Ry</div>
              <div class="res-cell-val" id="res-ry">—</div>
            </div>
            <div class="res-cell">
              <div class="res-cell-label">|R|</div>
              <div class="res-cell-val big" id="res-r">—</div>
            </div>
            <div class="res-cell">
              <div class="res-cell-label">θ</div>
              <div class="res-cell-val" id="res-ang">—</div>
            </div>
          </div>
        </div>

        <section class="res-section"><div class="res-title">Productos A y B (primeros dos vectores)</div><p id="vector-products">Añade dos vectores.</p><p>Componentes en unidades genéricas u. A·B es escalar (u²); (A×B)z es la componente z (u²), perpendicular al plano. Signo positivo: hacia fuera del plano.</p></section>
        <!-- Resolución paso a paso -->
        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-step" id="res-rx-sust">—</div>
          <div class="res-step" id="res-ry-sust">—</div>
          <div class="res-step" id="res-r-sust">—</div>
          <div class="res-step" id="res-ang-sust">—</div>

          <!-- Ley del coseno (solo 2 vectores) -->
          <div class="lc-block" id="ley-coseno-block" style="display:none">
            <div class="lc-title">Ley del coseno</div>
            <div class="lc-formula">R = √(A²+B²+2AB·cosθ)</div>
            <div class="lc-sust" id="lc-sust">—</div>
            <div class="lc-res"  id="lc-res">—</div>
          </div>
        </div>

      </aside>
    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div><!-- /#app -->

<script>const CFG = <?= $js_cfg ?>;</script>
<script src="../../js/sim-common.js"></script>
<script src="js/engine.js"></script>
<script src="../../js/canvas-common.js"></script>
<script src="js/render.js"></script>
<script src="js/ui.js"></script>
<link rel="stylesheet" href="../../css/accessibility.css">
<script src="../../js/accessibility.js"></script>
</body>
</html>
