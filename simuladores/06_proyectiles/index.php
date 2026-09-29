<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
$lim    = $cfg['limites'];
$js_cfg = json_encode($cfg);
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
    <div class="sim-layout-06">

      <!-- ══ PANEL IZQUIERDO ══ -->
      <aside class="panel-left">

        <div class="ps">
          <div class="ps-label">Lanzamiento</div>
          <div class="sl-group">

            <div class="sl-row-06">
              <span class="sl-label sl-label-accent">v<sub>0</sub></span>
              <input type="range" id="sl-v0"
                min="<?= $lim['v0_min'] ?>" max="<?= $lim['v0_max'] ?>"
                step="0.5" value="20">
              <span class="sl-val" id="val-v0"><b>20</b> <span>m/s</span></span>
            </div>

            <div class="sl-row-06">
              <span class="sl-label sl-label-gold">α</span>
              <input type="range" id="sl-alpha"
                min="<?= $lim['alpha_min'] ?>" max="<?= $lim['alpha_max'] ?>"
                step="1" value="45">
              <span class="sl-val" id="val-alpha"><b>45</b> <span>°</span></span>
            </div>

            <div class="sl-row-06">
              <span class="sl-label sl-label-green">y<sub>0</sub></span>
              <input type="range" id="sl-y0"
                min="<?= $lim['y0_min'] ?>" max="<?= $lim['y0_max'] ?>"
                step="0.5" value="0">
              <span class="sl-val" id="val-y0"><b>0</b> <span>m</span></span>
            </div>

          </div>
        </div>

        <!-- Datos de vuelo -->
        <div class="ps">
          <div class="ps-label">Datos de vuelo</div>
          <div class="stat-grid">
            <div class="stat-cell">
              <div class="stat-label">v<sub>0x</sub></div>
              <div class="stat-val" id="stat-v0x">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">v<sub>0y</sub></div>
              <div class="stat-val" id="stat-v0y">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">t vuelo</div>
              <div class="stat-val accent-gold" id="stat-tmax">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">Alcance R</div>
              <div class="stat-val accent-red" id="stat-xmax">—</div>
            </div>
            <div class="stat-cell" style="grid-column:span 2">
              <div class="stat-label">Altura máx.</div>
              <div class="stat-val accent-gold" id="stat-ymax">—</div>
            </div>
          </div>
        </div>

        <!-- Controles -->
        <div class="ps">
          <div class="ps-label">Controles</div>
          <div class="btn-group">
            <button class="btn-ctrl" id="btn-pause" onclick="togglePause(this)">⏸ Pausar</button>
            <button class="btn-ctrl btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="ps legend-box">
          <div class="ps-label">Leyenda</div>
          <div class="legend-row"><span class="leg-line" style="background:#58a6ff"></span>v<sub>x</sub> — componente horizontal (constante)</div>
          <div class="legend-row"><span class="leg-line" style="background:#3fb950"></span>v<sub>y</sub> — sube (positivo)</div>
          <div class="legend-row"><span class="leg-line" style="background:#f85149"></span>v<sub>y</sub> — baja (negativo)</div>
          <div class="legend-row"><span class="leg-line" style="background:#e3b341"></span>|v| — vector resultante</div>
          <div class="legend-row"><span class="leg-dot-sm" style="background:rgba(255,255,255,0.15)"></span>Trayectoria teórica (punteada)</div>
          <div class="legend-row"><span class="leg-line" style="background:#58a6ff"></span>Trail real del proyectil</div>
        </div>

      </aside>

      <!-- ══ CANVAS CENTRAL ══ -->
      <main class="panel-center-06">
        <canvas id="canvasMain"></canvas>
      </main>

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Se actualiza en cada frame</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-comp">—</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-pos">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-green" id="sust-vel">—</div>
        </div>

        <!-- Ecuación de trayectoria — referencia fija -->
        <div class="res-section">
          <div class="res-title">Ecuación de trayectoria</div>
          <div class="tray-box">
            <div class="tray-formula">y = tan(α)·x − <span style="font-size:9px">[g / (2v₀²cos²α)]</span>·x²</div>
            <div class="res-hint" style="margin-top:6px">Elimina t entre x(t) e y(t).<br>Solo depende de la posición x.</div>
          </div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida" style="margin-top:auto">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item"><span class="ref-f">v₀x = v₀·cos α</span></div>
          <div class="ref-item"><span class="ref-f">v₀y = v₀·sen α</span></div>
          <div class="ref-item"><span class="ref-f">x = v₀x · t</span></div>
          <div class="ref-item"><span class="ref-f">y = y₀ + v₀y·t − ½g·t²</span></div>
          <div class="ref-item"><span class="ref-f">vx = v₀x (constante)</span></div>
          <div class="ref-item"><span class="ref-f">vy = v₀y − g·t</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 06 -->
<style>
/* ── Layout 06: canvas ocupa todo el centro ── */
.sim-layout-06 {
  display: grid;
  grid-template-columns: 210px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}

.panel-center-06 {
  position: relative;
  background: #0a1628;
  overflow: hidden;
}
.panel-center-06 canvas {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}

/* ── Sliders ── */
.sl-group { display: flex; flex-direction: column; gap: 8px; }
.sl-row-06 { display: flex; align-items: center; gap: 6px; }
.sl-label {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  width: 26px; flex-shrink: 0; text-align: center;
}
.sl-label-accent { color: var(--accent); }
.sl-label-gold   { color: var(--et); }
.sl-label-green  { color: var(--ec); }

.sl-row-06 input[type=range] {
  flex: 1; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-06 input[type=range]::-webkit-slider-thumb {
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

/* ── Stats de vuelo ── */
.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px;
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
  color: var(--accent);
}
.stat-val.accent-gold { color: var(--et); }
.stat-val.accent-red  { color: #f85149; }

/* ── Botones ── */
.btn-group { display: flex; flex-direction: column; gap: 5px; }
.btn-ctrl {
  padding: 8px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx1); transition: all .15s;
}
.btn-ctrl:hover { border-color: var(--accent); color: var(--accent); }
.btn-reset:hover { border-color: var(--tx2); color: var(--tx2); }

/* ── Leyenda ── */
.legend-box { margin-top: auto; }
.legend-row {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; color: var(--tx2); margin-bottom: 5px;
}
.leg-line {
  width: 14px; height: 2px; border-radius: 1px; flex-shrink: 0;
  display: inline-block;
}
.leg-dot-sm {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  display: inline-block; border: 1px dashed rgba(255,255,255,0.2);
}

/* ── Panel derecho ── */
.res-hint { font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px; }
.step-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 10px 12px;
}
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

/* ── Ecuación de trayectoria ── */
.tray-box {
  background: var(--card); border: 1px solid var(--border);
  border-left: 3px solid var(--et);
  border-radius: var(--rs); padding: 10px 12px;
}
.tray-formula {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  color: var(--et); line-height: 1.6;
}

/* ── Referencia rápida ── */
.ref-rapida { }
.ref-item { margin-bottom: 4px; }
.ref-f {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 7px; border-radius: 4px;
  display: inline-block;
}
</style>

<script>const CFG = <?= $js_cfg ?>;</script>
<script src="../../js/sim-common.js"></script>
<script src="js/engine.js"></script>
<script src="js/render.js"></script>
<script src="js/ui.js"></script>
</body>
</html>