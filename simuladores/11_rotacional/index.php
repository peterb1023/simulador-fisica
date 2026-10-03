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
<link rel="stylesheet" href="../../css/selected-ui.css">
<script src="../../js/sim-inputs.js"></script>
</head>
<body data-sim-id="11">

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
    <div class="sim-layout-11">

      <!-- ══ PANEL IZQUIERDO ══ -->
      <aside class="panel-left">

        <!-- Parámetros -->
        <div class="ps">
          <div class="ps-label">Parámetros</div>
          <div class="sl-group">

            <div class="sl-row-11">
              <label class="sl-label sl-label-white" for="sl-R">R</label>
              <input type="range" id="sl-R"
                min="<?= $lim['R_min'] ?>" max="<?= $lim['R_max'] ?>"
                step="0.1" value="1.0">
              <span class="sl-val" id="val-R"><b>1.0</b> <span>m</span></span>
            </div>

            <div class="sl-row-11">
              <label class="sl-label sl-label-gold" for="sl-alpha">α</label>
              <input type="range" id="sl-alpha"
                min="<?= $lim['alpha_min'] ?>" max="<?= $lim['alpha_max'] ?>"
                step="0.5" value="2.0">
              <span class="sl-val" id="val-alpha"><b>2.0</b> <span>rad/s²</span></span>
            </div>

            <div class="sl-row-11">
              <label class="sl-label sl-label-blue" for="sl-w0">ω₀</label>
              <input type="range" id="sl-w0"
                min="<?= $lim['w0_min'] ?>" max="<?= $lim['w0_max'] ?>"
                step="0.5" value="0.0">
              <span class="sl-val" id="val-w0"><b>0.0</b> <span>rad/s</span></span>
            </div>

          </div>
        </div>

        <!-- Magnitudes calculadas -->
        <div class="ps">
          <div class="ps-label">Magnitudes</div>
          <div class="stat-grid-11">

            <div class="stat-cell">
              <div class="stat-label">ω actual</div>
              <div class="stat-val accent-blue" id="stat-omega">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">θ total</div>
              <div class="stat-val accent-blue" id="stat-theta">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">v (tangencial)</div>
              <div class="stat-val accent-green" id="stat-vtan">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">s (arco)</div>
              <div class="stat-val" id="stat-s">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">aₜ tangencial</div>
              <div class="stat-val accent-gold" id="stat-atan">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">aᵣ centrípeta</div>
              <div class="stat-val accent-red" id="stat-arad">—</div>
            </div>

          </div>
          <div class="eq-badge" id="stat-regime">MCU — α = 0</div>
        </div>

        <!-- Controles -->
        <div class="ps">
          <div class="ps-label">Controles</div>
          <div class="btn-group-11">
            <button class="btn-ctrl" id="btn-pause" onclick="togglePause(this)">⏸ Pausar</button>
            <button class="btn-ctrl btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="ps legend-box-11">
          <div class="ps-label">Leyenda</div>
          <div class="legend-row-11"><span class="leg-c" style="background:#3fb950"></span>v — Vel. tangencial</div>
          <div class="legend-row-11"><span class="leg-c" style="background:#e3b341"></span>aₜ — Acel. tangencial</div>
          <div class="legend-row-11"><span class="leg-c" style="background:#f85149"></span>aᵣ — Acel. centrípeta</div>
          <div class="legend-row-11"><span class="leg-c" style="background:#58a6ff"></span>ω — Vel. angular</div>
          <div class="legend-row-11"><span class="leg-c" style="background:rgba(88,166,255,0.25)"></span>θ — Sector angular</div>
        </div>

      </aside>

      <!-- ══ CANVAS CENTRAL ══ -->
      <main class="panel-center-11">
        <div class="temporal-scene"><canvas id="canvasMain"></canvas></div>
      </main>

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Se actualiza en cada frame</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-blue" id="sust-omega">—</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-theta">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-green" id="sust-vtan">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-gold" id="sust-atan">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-red" id="sust-arad">—</div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida-11" style="margin-top:auto">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item-11"><span class="ref-f-11">s = r · θ</span></div>
          <div class="ref-item-11"><span class="ref-f-11">ω = Δθ / Δt</span></div>
          <div class="ref-item-11"><span class="ref-f-11">α = Δω / Δt</span></div>
          <div class="ref-item-11"><span class="ref-f-11">v = r · ω</span></div>
          <div class="ref-item-11"><span class="ref-f-11">aₜ = r · α</span></div>
          <div class="ref-item-11"><span class="ref-f-11">aᵣ = ω² · r</span></div>
          <div class="ref-item-11"><span class="ref-f-11">ω = ω₀ + α·t</span></div>
          <div class="ref-item-11"><span class="ref-f-11">θ = ω₀t + ½αt²</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 11 -->
<style>
/* ── Layout 11 ── */
.sim-layout-11 {
  display: grid;
  grid-template-columns: 260px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}
.panel-center-11 {
  position: relative; background: #0a1628; overflow: hidden;
}
.panel-center-11 canvas {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}

/* ── Sliders ── */
.sl-group { display: flex; flex-direction: column; gap: 8px; }
.sl-row-11 { display: flex; align-items: center; gap: 6px; }
.sl-label {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  width: 26px; flex-shrink: 0; text-align: center;
}
.sl-label-white { color: var(--tx1); }
.sl-label-gold  { color: var(--et); }
.sl-label-blue  { color: var(--accent); }
.sl-row-11 input[type=range] {
  flex: 1; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-11 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.sl-val { font-family: var(--mono); font-size: 10px; color: var(--tx2); min-width: 92px; text-align: right; font-variant-numeric: tabular-nums; }
.sl-val b { color: var(--tx1); }
.sl-val span { font-size: 9px; }

/* ── Stats ── */
.stat-grid-11 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-cell {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--rs);
  padding: 7px 9px; min-height: 52px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;
}
.stat-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing:.07em; color: var(--tx3); margin-bottom:3px; }
.stat-val { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--tx1); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-val.accent-blue   { color: var(--accent); }
.stat-val.accent-green  { color: #3fb950; }
.stat-val.accent-gold   { color: #e3b341; }
.stat-val.accent-red    { color: #f85149; }

/* ── Badge régimen ── */
.eq-badge {
  margin-top: 8px;
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  color: var(--accent);
  background: rgba(88,166,255,.06); border: 1px solid rgba(88,166,255,.18);
  border-radius: 4px; padding: 5px 10px; text-align: center;
  transition: color .2s;
  min-height: 28px; box-sizing: border-box; font-variant-numeric: tabular-nums;
}

/* ── Botones ── */
.btn-group-11 { display: flex; flex-direction: column; gap: 5px; }
.btn-ctrl {
  padding: 8px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx1); transition: all .15s;
}
.btn-ctrl:hover  { border-color: var(--accent); color: var(--accent); }
.btn-reset:hover { border-color: var(--tx2); color: var(--tx2); }

/* ── Leyenda ── */
.legend-box-11 { margin-top: auto; }
.legend-row-11 { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--tx2); margin-bottom: 5px; }
.leg-c { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; display: inline-block; }

/* ── Panel derecho ── */
.panel-right {
  overflow-y: auto;
  overscroll-behavior: contain;
}
.res-hint { font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px; }
.step-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 9px 12px;
  min-height: 84px; box-sizing: border-box;
  contain: content;
}
.step-card.accent-blue   { border-color: rgba(88,166,255,.22); }
.step-card.accent-green  { border-color: rgba(63,185,80,.2); }
.step-card.accent-gold   { border-color: rgba(227,179,65,.2); }
.step-card.accent-red    { border-color: rgba(248,81,73,.2); }
.step-formula { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing:.08em; color: var(--tx3); margin-bottom:4px; min-height: 13px; }
.step-sust    { font-family: var(--mono); font-size: 10px; color: var(--tx2); margin-bottom:4px; line-height:1.5; font-variant-numeric: tabular-nums; min-height: 28px; word-break: break-word; }
.step-res     { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; min-height: 18px; }

/* ── Ref rápida ── */
.ref-rapida-11 { }
.ref-item-11 { margin-bottom: 4px; }
.ref-f-11 {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 7px; border-radius: 4px; display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>

<script>const CFG = <?= $js_cfg ?>;</script>
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