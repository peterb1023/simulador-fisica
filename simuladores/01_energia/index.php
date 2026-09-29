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
<title>Simulador de Física — <?= htmlspecialchars($cfg['titulo']) ?></title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/sim.css">
<link rel="stylesheet" href="../../css/timeline.css">
</head>
<body data-sim-id="01">
<div id="app">

  <!-- HEADER -->
  <header class="sim-header">
    <div class="sim-badge">SIM #1</div>
    <div class="sim-titles">
      <h1><?= htmlspecialchars($cfg['titulo']) ?></h1>
      <span>Conservación de Energía Mecánica</span>
    </div>
    <nav class="sim-nav">
      <button class="nav-btn active" onclick="setTab('sim',this)">▶ Simulador</button>
      <button class="nav-btn" onclick="setTab('formulas',this)">∑ Fórmulas</button>
    </nav>
  </header>

  <!-- TAB: SIMULADOR -->
  <div id="tab-sim" class="tab active">
    <div class="sim-layout">

      <!-- PANEL IZQ: controles -->
      <aside class="panel-left">

        <div class="ps">
          <div class="ps-label">Gravedad</div>
          <div class="g-btns">
            <button class="g-btn active" onclick="pickGravity(9.8,this)">🌍 Tierra<em>9.8 m/s²</em></button>
            <button class="g-btn" onclick="pickGravity(1.6,this)">🌙 Luna<em>1.6 m/s²</em></button>
            <button class="g-btn" onclick="pickGravity(24.8,this)">🪐 Júpiter<em>24.8 m/s²</em></button>
          </div>
        </div>

        <div class="ps">
          <div class="ps-label">Masa del objeto</div>
          <div class="sl-row">
            <input type="range" id="sl-masa" min="<?= $cfg['masa_min'] ?>" max="<?= $cfg['masa_max'] ?>" step="1" value="60" oninput="setMasa(+this.value)">
            <span class="sl-val"><b id="v-masa">60</b> kg</span>
          </div>
        </div>

        <div class="ps">
          <div class="ps-label">Altura inicial</div>
          <div class="sl-row">
            <input type="range" id="sl-h" min="1" max="<?= $cfg['h_max'] ?>" step="0.1" value="5" oninput="setAltura(+this.value)">
            <span class="sl-val"><b id="v-h">5.0</b> m</span>
          </div>
        </div>

        <div class="ps">
          <div class="ps-label">Fricción</div>
          <label class="toggle-label">
            <input type="checkbox" id="chk-friction" onchange="setFriction(this.checked)">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <span id="friction-txt">Sin fricción</span>
          </label>
        </div>

        <div class="ps btn-row">
          <button class="btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          <button class="btn-pause" id="btn-pause" onclick="togglePause()">⏸ Pausar</button>
        </div>

      </aside>

      <!-- CANVAS CENTRAL -->
      <main class="panel-center">
        <div class="temporal-scene"><canvas id="simCanvas"></canvas></div>
<div data-timeline aria-label="Controles de tiempo"><button type="button" data-reset aria-label="Volver al inicio">⏮</button><button type="button" data-play aria-label="Pausar">⏸</button><input type="range" min="0" max="20" step="any" value="0" aria-label="Tiempo de simulación en segundos"><output>0 s</output></div>
        <div class="speed-badge" id="speed-badge">v = 0.00 m/s</div>
        <div class="height-badge" id="height-badge">h = 5.0 m</div>
      </main>

      <!-- PANEL DER: energías + fórmulas -->
      <aside class="panel-right">

        <div class="energy-panel">
          <div class="ep-title">Energía (julios)</div>

          <div class="e-row">
            <span class="e-dot" style="background:var(--ep)"></span>
            <span class="e-name">Potencial</span>
            <div class="e-bar-wrap"><div class="e-bar" id="bar-ep" style="background:var(--ep)"></div></div>
            <span class="e-val" id="v-ep">0 J</span>
          </div>

          <div class="e-row">
            <span class="e-dot" style="background:var(--ec)"></span>
            <span class="e-name">Cinética</span>
            <div class="e-bar-wrap"><div class="e-bar" id="bar-ec" style="background:var(--ec)"></div></div>
            <span class="e-val" id="v-ec">0 J</span>
          </div>

          <div class="e-row" id="row-th">
            <span class="e-dot" style="background:var(--th)"></span>
            <span class="e-name">Térmica</span>
            <div class="e-bar-wrap"><div class="e-bar" id="bar-th" style="background:var(--th)"></div></div>
            <span class="e-val" id="v-th">0 J</span>
          </div>

          <div class="e-divider"></div>

          <div class="e-row total-row">
            <span class="e-dot" style="background:var(--et)"></span>
            <span class="e-name">Total</span>
            <div class="e-bar-wrap"><div class="e-bar" id="bar-et" style="background:var(--et)"></div></div>
            <span class="e-val" id="v-et">0 J</span>
          </div>
        </div>

        <!-- RESOLUCIÓN EN VIVO -->
        <div class="formula-live">
          <div class="fl-title">Resolución en vivo</div>

          <div class="fl-block">
            <div class="fl-name" style="color:var(--ep)">Energía Potencial</div>
            <div class="fl-formula">U = m · g · h</div>
            <div class="fl-sust" id="fl-ep-s">—</div>
            <div class="fl-result" id="fl-ep-r">—</div>
          </div>

          <div class="fl-block">
            <div class="fl-name" style="color:var(--ec)">Energía Cinética</div>
            <div class="fl-formula">K = ½ · m · v²</div>
            <div class="fl-sust" id="fl-ec-s">—</div>
            <div class="fl-result" id="fl-ec-r">—</div>
          </div>

          <div class="fl-block">
            <div class="fl-name" style="color:var(--et)">Conservación</div>
            <div class="fl-formula">E = K + U</div>
            <div class="fl-sust" id="fl-et-s">—</div>
            <div class="fl-result" id="fl-et-r">—</div>
          </div>
        </div>

      </aside>
    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<script>const CFG = <?= $js_cfg ?>;</script>
<script src="../../js/sim-common.js"></script>
<script src="js/engine.js"></script>
<script src="../../js/canvas-common.js"></script>
<script src="js/render.js"></script>
<script src="js/ui.js"></script>
<script src="../../js/timeline.js"></script>
<link rel="stylesheet" href="../../css/accessibility.css">
<script src="../../js/accessibility.js"></script>
<link rel="stylesheet" href="../../css/registry.css">
<script src="../../js/sim-registry.js"></script>
<script src="../../js/sim-records-ui.js"></script>
</body>
</html>
