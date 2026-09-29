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
    <div class="sim-layout-08">

      <!-- ══ PANEL IZQUIERDO ══ -->
      <aside class="panel-left">

        <!-- Selector de escenario -->
        <div class="ps">
          <div class="ps-label">Escenario</div>
          <div class="modo-group">
            <button class="modo-btn active" onclick="setModo('plano',this)">▭ Plano</button>
            <button class="modo-btn"        onclick="setModo('elevador',this)">⇕ Elevador</button>
          </div>
        </div>

        <!-- Parámetros -->
        <div class="ps">
          <div class="ps-label">Parámetros</div>
          <div class="sl-group">

            <div class="sl-row-08">
              <span class="sl-label sl-label-white">m</span>
              <input type="range" id="sl-m"
                min="<?= $lim['m_min'] ?>" max="<?= $lim['m_max'] ?>"
                step="0.5" value="5">
              <span class="sl-val" id="val-m"><b>5</b> <span>kg</span></span>
            </div>

            <div class="sl-row-08">
              <span class="sl-label sl-label-gold">F</span>
              <input type="range" id="sl-F"
                min="<?= $lim['F_min'] ?>" max="<?= $lim['F_max'] ?>"
                step="1" value="30">
              <span class="sl-val" id="val-F"><b>30</b> <span>N</span></span>
            </div>

            <div class="sl-row-08" id="row-phi">
              <span class="sl-label sl-label-gold">φ</span>
              <input type="range" id="sl-phi"
                min="<?= $lim['phi_min'] ?>" max="<?= $lim['phi_max'] ?>"
                step="1" value="0">
              <span class="sl-val" id="val-phi"><b>0</b> <span>°</span></span>
            </div>

            <div class="sl-row-08" id="row-muk">
              <span class="sl-label sl-label-purple">μk</span>
              <input type="range" id="sl-muk"
                min="<?= $lim['mu_min'] ?>" max="<?= $lim['mu_max'] ?>"
                step="0.05" value="0">
              <span class="sl-val" id="val-muk"><b>0</b> <span></span></span>
            </div>

          </div>
        </div>

        <!-- Fuerzas resultantes -->
        <div class="ps">
          <div class="ps-label">Fuerzas</div>
          <div class="stat-grid-08">
            <div class="stat-cell">
              <div class="stat-label">W (peso)</div>
              <div class="stat-val accent-red" id="stat-w">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">N (normal)</div>
              <div class="stat-val accent-green" id="stat-n">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">fk <span class="badge-agr-sm">[+]</span></div>
              <div class="stat-val accent-purple" id="stat-fric">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">ΣF</div>
              <div class="stat-val" id="stat-sumF">—</div>
            </div>
            <div class="stat-cell" style="grid-column:span 2">
              <div class="stat-label">Aceleración a</div>
              <div class="stat-val" id="stat-ax">—</div>
            </div>
          </div>
          <div class="eq-badge" id="stat-eq">ΣF = ma</div>
        </div>

        <!-- Controles -->
        <div class="ps">
          <div class="ps-label">Controles</div>
          <div class="btn-group-08">
            <button class="btn-ctrl" id="btn-pause" onclick="togglePause(this)">⏸ Pausar</button>
            <button class="btn-ctrl btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          </div>
        </div>

        <!-- Leyenda -->
        <div class="ps legend-box-08">
          <div class="ps-label">Leyenda</div>
          <div class="legend-row-08"><span class="leg-c" style="background:#f85149"></span>W — Peso (mg)</div>
          <div class="legend-row-08"><span class="leg-c" style="background:#3fb950"></span>N — Normal</div>
          <div class="legend-row-08"><span class="leg-c" style="background:#e3b341"></span>F — Fuerza aplicada</div>
          <div class="legend-row-08"><span class="leg-c" style="background:#a371f7"></span>fk — Fricción [AGREGADA]</div>
          <div class="legend-row-08"><span class="leg-c" style="background:#ffffff"></span>ΣF — Resultante</div>
        </div>

      </aside>

      <!-- ══ CANVAS CENTRAL ══ -->
      <main class="panel-center-08">
        <canvas id="canvasMain"></canvas>
      </main>

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Se actualiza en cada frame</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-red" id="sust-peso">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-green" id="sust-normal">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-purple" id="sust-fric">—</div>
        </div>

        <div class="res-section">
          <div class="step-card" id="sust-segunda">—</div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida-08" style="margin-top:auto">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item-08"><span class="ref-f-08">ΣF⃗ = 0  (1ª Ley)</span></div>
          <div class="ref-item-08"><span class="ref-f-08">ΣF⃗ = ma⃗  (2ª Ley)</span></div>
          <div class="ref-item-08"><span class="ref-f-08">w = m·g</span></div>
          <div class="ref-item-08"><span class="ref-f-08">T = m(g + ay)</span></div>
          <div class="ref-item-08 agr"><span class="ref-f-08 agr-f">fk = μk·n  [AGREGADA]</span></div>
          <div class="ref-item-08 agr"><span class="ref-f-08 agr-f">fs ≤ μs·n  [AGREGADA]</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 08 -->
<style>
/* ── Layout 08 ── */
.sim-layout-08 {
  display: grid;
  grid-template-columns: 220px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}
.panel-center-08 {
  position: relative; background: #0a1628; overflow: hidden;
}
.panel-center-08 canvas {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
}

/* ── Modo selector ── */
.modo-group { display: flex; gap: 5px; }
.modo-btn {
  flex: 1; padding: 7px 0; border-radius: var(--rs); cursor: pointer;
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx2); transition: all .15s;
}
.modo-btn:hover  { border-color: var(--accent); color: var(--accent); }
.modo-btn.active { background: rgba(88,166,255,.1); border-color: var(--accent); color: var(--accent); }

/* ── Sliders ── */
.sl-group { display: flex; flex-direction: column; gap: 8px; }
.sl-row-08 { display: flex; align-items: center; gap: 6px; }
.sl-label {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  width: 26px; flex-shrink: 0; text-align: center;
}
.sl-label-white  { color: var(--tx1); }
.sl-label-gold   { color: var(--et); }
.sl-label-purple { color: #a371f7; }
.sl-row-08 input[type=range] {
  flex: 1; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-08 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.sl-val { font-family: var(--mono); font-size: 10px; color: var(--tx2); min-width: 64px; text-align: right; }
.sl-val b { color: var(--tx1); }
.sl-val span { font-size: 9px; }

/* ── Stats ── */
.stat-grid-08 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-cell { background: var(--card); border: 1px solid var(--border); border-radius: var(--rs); padding: 7px 9px; }
.stat-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing:.07em; color: var(--tx3); margin-bottom:3px; }
.stat-val { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--tx1); }
.stat-val.accent-red    { color: #f85149; }
.stat-val.accent-green  { color: #3fb950; }
.stat-val.accent-purple { color: #a371f7; }
.badge-agr-sm { font-size: 8px; color: #a371f7; font-weight: 700; }

/* ── Badge equilibrio ── */
.eq-badge {
  margin-top: 8px;
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  color: var(--accent);
  background: rgba(88,166,255,.06); border: 1px solid rgba(88,166,255,.18);
  border-radius: 4px; padding: 5px 10px; text-align: center;
  transition: color .2s;
}

/* ── Botones ── */
.btn-group-08 { display: flex; flex-direction: column; gap: 5px; }
.btn-ctrl {
  padding: 8px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx1); transition: all .15s;
}
.btn-ctrl:hover     { border-color: var(--accent); color: var(--accent); }
.btn-reset:hover    { border-color: var(--tx2); color: var(--tx2); }

/* ── Leyenda ── */
.legend-box-08 { margin-top: auto; }
.legend-row-08 { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--tx2); margin-bottom: 5px; }
.leg-c { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; display: inline-block; }

/* ── Panel derecho ── */
.res-hint { font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px; }
.step-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--rs); padding: 10px 12px; }
.step-card.accent-red    { border-color: rgba(248,81,73,.2); }
.step-card.accent-green  { border-color: rgba(63,185,80,.2); }
.step-card.accent-purple { border-color: rgba(163,113,247,.2); }
.step-formula { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing:.08em; color: var(--tx3); margin-bottom:5px; }
.step-sust    { font-family: var(--mono); font-size: 10px; color: var(--tx2); margin-bottom:5px; line-height:1.6; }
.step-res     { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent); }
.badge-agr-inline { color: #a371f7; font-size: 8px; font-weight: 700; margin-right: 4px; }

/* ── Ref rápida ── */
.ref-item-08 { margin-bottom: 4px; }
.ref-f-08 {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 7px; border-radius: 4px; display: inline-block;
}
.ref-item-08.agr .ref-f-08 { color: #a371f7; background: rgba(163,113,247,.08); }
</style>

<script>const CFG = <?= $js_cfg ?>;</script>
<script src="js/engine.js"></script>
<script src="js/render.js"></script>
<script src="js/ui.js"></script>
</body>
</html>