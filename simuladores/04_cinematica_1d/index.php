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
</head>
<body data-sim-id="04">

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
    <div class="sim-layout-04">

      <!-- ══ PANEL IZQUIERDO: parámetros ══ -->
      <aside class="panel-left">

        <div class="ps">
          <div class="ps-label">Condiciones iniciales</div>
          <div class="sl-group">
            <div class="sl-row-04">
              <span class="sl-label">x<sub>0</sub></span>
              <input type="range" id="sl-x0"
                min="<?= $lim['x0_min'] ?>" max="<?= $lim['x0_max'] ?>"
                step="1" value="0">
              <span class="sl-val" id="val-x0"><b>0</b> <span>m</span></span>
            </div>
            <div class="sl-row-04">
              <span class="sl-label">v<sub>0</sub></span>
              <input type="range" id="sl-v0"
                min="<?= $lim['v0_min'] ?>" max="<?= $lim['v0_max'] ?>"
                step="0.5" value="5">
              <span class="sl-val" id="val-v0"><b>5</b> <span>m/s</span></span>
            </div>
          </div>
        </div>

        <div class="ps">
          <div class="ps-label">Aceleración</div>
          <div class="sl-group">
            <div class="sl-row-04" id="row-a">
              <label class="sl-label" for="sl-a">a</label>
              <input type="range" id="sl-a"
                min="<?= $lim['a_min'] ?>" max="<?= $lim['a_max'] ?>"
                step="0.5" value="-2">
              <span class="sl-val" id="val-a"><b>−2</b> <span>m/s²</span></span>
            </div>
          </div>
          <label class="caida-toggle">
            <input type="checkbox" id="chk-caida" onchange="toggleCaida(this)">
            <span class="caida-slider"></span>
            <span class="caida-label">Caída libre (g = <?= $lim['g'] ?> m/s²)</span>
          </label>
        </div>

        <div class="ps">
          <div class="ps-label">Duración</div>
          <div class="sl-group">
            <div class="sl-row-04">
              <span class="sl-label">t<sub>max</sub></span>
              <input type="number" id="sl-t" min="1" step="1" value="8">
              <span class="sl-unit">s</span>
            </div>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="ps legend-box">
          <div class="ps-label">Leyenda</div>
          <div class="legend-row"><span class="leg-dot" style="background:#58a6ff"></span>Objeto / posición x</div>
          <div class="legend-row"><span class="leg-dot" style="background:#e3b341"></span>Gráfica x(t) — posición</div>
          <div class="legend-row"><span class="leg-dot" style="background:#3fb950"></span>Gráfica v(t) — velocidad</div>
          <div class="legend-row"><span class="leg-dot" style="background:#e3b341;opacity:.5"></span>Marcador posición inicial x₀</div>
        </div>

      </aside>

      <!-- ══ ZONA CENTRAL: pista + línea de tiempo + gráficas ══ -->
      <main class="panel-center-04">

        <!-- Pista animada -->
        <div class="canvas-pista">
          <canvas id="canvasMain"></canvas>
        </div>

        <!-- ── Línea de tiempo (video scrubber) ── -->
        <div class="timeline-bar">
          <button id="btn-tl-reset" onclick="resetSim()" class="tl-btn" title="Reiniciar">⏮</button>
          <button id="btn-tl-play"  onclick="togglePause()" class="tl-btn" title="Reproducir / Pausar">⏸</button>
          <div class="tl-track-wrap">
            <input type="range" id="timeline" min="0" max="8" step="0.02" value="0">
          </div>
          <span class="tl-cur" id="tl-time">0.00</span>
          <span class="tl-sep">/</span>
          <span class="tl-end" id="tl-max">8 s</span>
        </div>

        <!-- Dos gráficas lado a lado -->
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

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Actualiza en cada frame con los valores actuales de t, x, v</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-vel">—</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-pos">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-gold" id="sust-vel2">—</div>
        </div>

        <div class="res-section ref-rapida">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item"><span class="ref-f">vx = v₀ + a·t</span></div>
          <div class="ref-item"><span class="ref-f">x = x₀ + v₀·t + ½·a·t²</span></div>
          <div class="ref-item"><span class="ref-f">vx² = v₀² + 2·a·(x−x₀)</span></div>
          <div class="ref-item"><span class="ref-f">x−x₀ = ½·(v₀+vx)·t</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 04 -->
<style>
/* ── Layout 04 ── */
.sim-layout-04 {
  display: grid;
  grid-template-columns: 250px 1fr 260px;
  height: calc(100vh - 52px);
  overflow: hidden;
}

/* ── Panel centro ── */
.panel-center-04 {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}

.canvas-pista {
  flex: 0 0 35%;
  position: relative;
  background: #0a1628;
  border-bottom: 1px solid var(--border);
}
.canvas-pista canvas {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}

/* ── Línea de tiempo ── */
.timeline-bar {
  height: 44px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex-shrink: 0;
}
.tl-btn {
  width: 30px; height: 30px;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx2); border-radius: 6px; cursor: pointer;
  font-size: 13px; display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0;
}
.tl-btn:hover { border-color: var(--accent); color: var(--accent); }
.tl-track-wrap {
  flex: 1;
  display: flex; align-items: center;
}
#timeline {
  width: 100%; -webkit-appearance: none; height: 4px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
#timeline::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg); transition: transform .1s;
}
#timeline::-webkit-slider-thumb:hover { transform: scale(1.3); }
#timeline::-moz-range-thumb {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.tl-cur {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  color: var(--accent); min-width: 38px; text-align: right; flex-shrink: 0;
}
.tl-sep {
  font-family: var(--mono); font-size: 10px; color: var(--tx3); flex-shrink: 0;
}
.tl-end {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  min-width: 28px; flex-shrink: 0;
}

/* ── Gráficas ── */
.canvas-graficas {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
}
.grafica-wrap {
  position: relative;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.grafica-wrap:last-child { border-right: none; }
.grafica-label {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx2);
  padding: 6px 10px 2px; flex-shrink: 0;
}
.grafica-wrap canvas {
  flex: 1; width: 100%; display: block;
}

/* ── Sliders izquierda ── */
.sl-group { display: flex; flex-direction: column; gap: 6px; }
.sl-row-04 {
  display: flex; align-items: center; gap: 6px;
  min-width: 0;
}
.sl-label {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  color: var(--accent); width: 24px; flex-shrink: 0; text-align: center;
}
.sl-row-04 input[type=range] {
  flex: 1; min-width: 60px; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-04 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 13px; height: 13px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.sl-row-04 input[type=range]:disabled { opacity: .35; cursor: not-allowed; }
.sl-row-04 input[type=range]:disabled::-webkit-slider-thumb { cursor: not-allowed; }

.sl-val {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  min-width: 56px; max-width: 72px; text-align: right;
  white-space: nowrap; overflow: hidden; flex-shrink: 0;
}
.sl-val b { color: var(--tx1); }
.sl-val span { font-size: 9px; }

/* Input numérico de duración */
.sl-row-04 input[type=number] {
  flex: 1; min-width: 0;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--tx1);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  outline: none;
  text-align: center;
  -moz-appearance: textfield;
}
.sl-row-04 input[type=number]::-webkit-outer-spin-button,
.sl-row-04 input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
.sl-row-04 input[type=number]:focus { border-color: var(--accent); }
.sl-unit {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  flex-shrink: 0;
}

/* ── Toggle caída libre ── */
.caida-toggle {
  display: flex; align-items: center; gap: 8px;
  margin-top: 8px; cursor: pointer;
}
.caida-toggle input { display: none; }
.caida-slider {
  width: 32px; height: 18px; border-radius: 9px;
  background: var(--input); border: 1px solid var(--border);
  position: relative; flex-shrink: 0; transition: background .2s;
}
.caida-slider::after {
  content: ''; position: absolute;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--tx3); top: 2px; left: 2px; transition: all .2s;
}
.caida-toggle input:checked + .caida-slider {
  background: rgba(248,81,73,.3); border-color: #f85149;
}
.caida-toggle input:checked + .caida-slider::after {
  background: #f85149; transform: translateX(14px);
}
.caida-label { font-size: 11px; color: var(--tx2); line-height: 1.3; }

/* ── Leyenda ── */
.legend-box { margin-top: auto; }
.legend-row {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; color: var(--tx2); margin-bottom: 5px;
}
.leg-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}

/* ── Panel derecho ── */
.res-hint {
  font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px;
}
.step-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 10px 12px;
}
.step-card.accent-gold { border-color: rgba(227,179,65,.25); }
.step-formula {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx3); margin-bottom: 4px;
}
.step-sust {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  margin-bottom: 4px; line-height: 1.5;
  overflow-wrap: anywhere; word-break: break-all;
}
.step-res {
  font-family: var(--mono); font-size: 13px; font-weight: 700;
  color: var(--accent);
}
.accent-gold .step-res { color: var(--et); }

/* ── Referencia rápida ── */
.ref-rapida { margin-top: auto; }
.ref-item { margin-bottom: 5px; }
.ref-f {
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
<link rel="stylesheet" href="../../css/accessibility.css">
<script src="../../js/accessibility.js"></script>
<link rel="stylesheet" href="../../css/registry.css">
<script src="../../js/sim-registry.js"></script>
<script src="../../js/sim-groups.js"></script>
<script src="../../js/sim-records-ui.js"></script>
</body>
</html>
