<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
$lim    = $cfg['limites'];
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
<link rel="stylesheet" href="../../css/timeline.css">
<link rel="stylesheet" href="../../css/selected-ui.css">
<script src="../../js/sim-inputs.js"></script>
</head>
<body data-sim-id="07">

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
    <div class="sim-layout-07">

      <!-- ══ PANEL IZQUIERDO ══ -->
      <aside class="panel-left">

        <!-- Parámetros del círculo -->
        <div class="ps">
          <div class="ps-label">Parámetros</div>
          <div class="sl-group">

            <div class="sl-row-07">
              <label class="sl-label sl-label-accent" for="sl-R">R</label>
              <input type="range" id="sl-R"
                min="<?= $lim['R_min'] ?>" max="<?= $lim['R_max'] ?>"
                step="0.5" value="4">
              <span class="sl-val" id="val-R"><b>4</b> <span>m</span></span>
            </div>

            <div class="sl-row-07">
              <span class="sl-label sl-label-white">v<sub>0</sub></span>
              <input type="range" id="sl-v0"
                min="<?= $lim['v_min'] ?>" max="<?= $lim['v_max'] ?>"
                step="0.5" value="6">
              <span class="sl-val" id="val-v0"><b>6</b> <span>m/s</span></span>
            </div>

            <div class="sl-row-07">
              <span class="sl-label sl-label-green">a<sub>t</sub></span>
              <input type="range" id="sl-atan"
                min="-<?= $lim['atan_max'] ?>" max="<?= $lim['atan_max'] ?>"
                step="0.5" value="0">
              <span class="sl-val" id="val-atan"><b>0</b> <span>m/s²</span></span>
            </div>

          </div>
          <!-- Indicador MCU / MCUV -->
          <div class="modo-badge" id="stat-modo">MCU</div>
        </div>

        <!-- Datos en tiempo real -->
        <div class="ps">
          <div class="ps-label">Datos en tiempo real</div>
          <div class="stat-grid-07">
            <div class="stat-cell">
              <div class="stat-label">v</div>
              <div class="stat-val" id="stat-v">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">ω</div>
              <div class="stat-val accent-blue" id="stat-omega">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">T</div>
              <div class="stat-val accent-gold" id="stat-T">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">f</div>
              <div class="stat-val accent-gold" id="stat-f">—</div>
            </div>
            <div class="stat-cell" style="grid-column:span 2">
              <div class="stat-label">arad (centrípeta)</div>
              <div class="stat-val accent-red" id="stat-arad">—</div>
            </div>
          </div>
        </div>

        <!-- Controles -->
        <div class="ps">
          <div class="ps-label">Controles</div>
          <div class="btn-group-07">
            <button class="btn-ctrl" id="btn-pause" onclick="togglePause(this)">⏸ Pausar</button>
            <button class="btn-ctrl btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="ps legend-box-07">
          <div class="ps-label">Leyenda</div>
          <div class="legend-row-07"><span class="leg-arr" style="background:#f85149"></span>arad — centrípeta (al centro)</div>
          <div class="legend-row-07"><span class="leg-arr" style="background:#3fb950"></span>atan — tangencial (si ≠ 0)</div>
          <div class="legend-row-07"><span class="leg-arr" style="background:#58a6ff; opacity:.5"></span>Radio R</div>
          <div class="legend-row-07"><span class="leg-arr" style="background:#58a6ff"></span>Trail del objeto</div>
        </div>

      </aside>

      <!-- ══ CANVAS CENTRAL ══ -->
      <main class="panel-center-07">
        <div class="temporal-scene"><canvas id="canvasMain"></canvas></div>
<div data-timeline aria-label="Controles de tiempo"><button type="button" data-reset aria-label="Volver al inicio">⏮</button><button type="button" data-play aria-label="Pausar">⏸</button><input type="range" min="0" max="20" step="any" value="0" aria-label="Tiempo de simulación en segundos"><output>0 s</output></div>
      </main>

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Se actualiza en cada frame</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-red" id="sust-arad-v">—</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-arad-T">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-blue" id="sust-vel">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-green" id="sust-atan">—</div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida-07" style="margin-top:auto">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item-07"><span class="ref-f-07">arad = v² / R</span></div>
          <div class="ref-item-07"><span class="ref-f-07">v = 2πR / T</span></div>
          <div class="ref-item-07"><span class="ref-f-07">arad = 4π²R / T²</span></div>
          <div class="ref-item-07"><span class="ref-f-07">ω = v / R (rad/s)</span></div>
          <div class="ref-item-07"><span class="ref-f-07">T = 2πR / v</span></div>
          <div class="ref-item-07"><span class="ref-f-07">atan = d|v|/dt</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 07 -->
<style>
/* ── Layout 07 ── */
.sim-layout-07 {
  display: grid;
  grid-template-columns: 210px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}
.panel-center-07 {
  position: relative;
  background: #0a1628;
  overflow: hidden;
}
.panel-center-07 canvas {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}

/* ── Sliders ── */
.sl-group { display: flex; flex-direction: column; gap: 8px; }
.sl-row-07 { display: flex; align-items: center; gap: 6px; }
.sl-label {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  width: 26px; flex-shrink: 0; text-align: center;
}
.sl-label-accent { color: var(--accent); }
.sl-label-white  { color: var(--tx1); }
.sl-label-green  { color: #3fb950; }

.sl-row-07 input[type=range] {
  flex: 1; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-07 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.sl-val {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  min-width: 64px; text-align: right; white-space: nowrap;
}
.sl-val b { color: var(--tx1); }
.sl-val span { font-size: 9px; }

/* ── Badge MCU / MCUV ── */
.modo-badge {
  margin-top: 10px;
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  color: var(--accent);
  background: rgba(88,166,255,.08);
  border: 1px solid rgba(88,166,255,.2);
  border-radius: 4px;
  padding: 4px 12px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  transition: color .2s, border-color .2s;
}

/* ── Stats ── */
.stat-grid-07 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
.stat-cell {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 7px 9px;
}
.stat-label {
  font-size: 9px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .07em; color: var(--tx3); margin-bottom: 3px;
}
.stat-val {
  font-family: var(--mono); font-size: 13px; font-weight: 700;
  color: var(--tx1);
}
.stat-val.accent-blue  { color: var(--accent); }
.stat-val.accent-gold  { color: var(--et); }
.stat-val.accent-red   { color: #f85149; }

/* ── Botones ── */
.btn-group-07 { display: flex; flex-direction: column; gap: 5px; }
.btn-ctrl {
  padding: 8px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx1); transition: all .15s;
}
.btn-ctrl:hover { border-color: var(--accent); color: var(--accent); }
.btn-reset:hover { border-color: var(--tx2); color: var(--tx2); }

/* ── Leyenda ── */
.legend-box-07 { margin-top: auto; }
.legend-row-07 {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; color: var(--tx2); margin-bottom: 5px;
}
.leg-arr {
  width: 14px; height: 2px; border-radius: 1px; flex-shrink: 0;
  display: inline-block;
}

/* ── Resolución ── */
.res-hint { font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px; }
.step-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 10px 12px;
}
.step-card.accent-red   { border-color: rgba(248,81,73,.2); }
.step-card.accent-blue  { border-color: rgba(88,166,255,.2); }
.step-card.accent-green { border-color: rgba(63,185,80,.2); }
.step-formula {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx3); margin-bottom: 5px;
}
.step-sust {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  margin-bottom: 5px; line-height: 1.6;
}
.step-res {
  font-family: var(--mono); font-size: 13px; font-weight: 700;
  color: var(--accent);
}

/* ── Referencia rápida ── */
.ref-rapida-07 { }
.ref-item-07 { margin-bottom: 4px; }
.ref-f-07 {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 7px; border-radius: 4px;
  display: inline-block;
}
</style>

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
<script src="../../js/sim-groups.js"></script>
<script src="../../js/sim-records-ui.js"></script>
</body>
</html>
