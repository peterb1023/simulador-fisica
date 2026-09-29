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
    <div class="sim-layout-12">

      <!-- ══ PANEL IZQUIERDO ══ -->
      <aside class="panel-left">

        <!-- Selector de cuerpo -->
        <div class="ps">
          <div class="ps-label">Cuerpo</div>
          <div id="cuerpo-btns" class="cuerpo-list">
            <!-- Generado por ui.js -->
          </div>
        </div>

        <!-- Parámetros -->
        <div class="ps">
          <div class="ps-label">Parámetros</div>
          <div class="sl-group">

            <div class="sl-row-12">
              <label class="sl-label sl-label-white" for="sl-M">M</label>
              <input type="range" id="sl-M"
                min="<?= $lim['M_min'] ?>" max="<?= $lim['M_max'] ?>"
                step="0.5" value="5">
              <span class="sl-val" id="val-M"><b>5</b> <span>kg</span></span>
            </div>

            <div class="sl-row-12">
              <label class="sl-label sl-label-dyn" id="lbl-dim" for="sl-dim">L</label>
              <input type="range" id="sl-dim"
                min="<?= $lim['L_min'] ?>" max="<?= $lim['L_max'] ?>"
                step="0.1" value="1.5">
              <span class="sl-val" id="val-dim"><b>1.5</b> <span>m</span></span>
            </div>
            <div class="sl-dim-desc" id="desc-dim">L (longitud)</div>

            <div class="sl-row-12">
              <label class="sl-label sl-label-blue" for="sl-omega">ω</label>
              <input type="range" id="sl-omega"
                min="<?= $lim['w_min'] ?>" max="<?= $lim['w_max'] ?>"
                step="0.5" value="3">
              <span class="sl-val" id="val-omega"><b>3</b> <span>rad/s</span></span>
            </div>

            <div class="sl-row-12">
              <label class="sl-label sl-label-gold" for="sl-d">d</label>
              <input type="range" id="sl-d"
                min="<?= $lim['d_min'] ?>" max="<?= $lim['d_max'] ?>"
                step="0.1" value="0">
              <span class="sl-val" id="val-d"><b>0</b> <span>m</span></span>
            </div>
            <div class="sl-dim-desc" style="color:#e3b34188">d — distancia eje paralelo</div>

          </div>
        </div>

        <!-- Resultados -->
        <div class="ps">
          <div class="ps-label">Resultados</div>
          <div class="stat-grid-12">
            <div class="stat-cell" style="grid-column:span 2">
              <div class="stat-label">Fórmula activa</div>
              <div class="stat-val" id="stat-formula" style="font-size:11px">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">I (cm)</div>
              <div class="stat-val accent-dyn" id="stat-I">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">I_P (eje ∥)</div>
              <div class="stat-val accent-gold" id="stat-IP">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">K (cm)</div>
              <div class="stat-val accent-green" id="stat-K">—</div>
            </div>
            <div class="stat-cell">
              <div class="stat-label">K_P (eje ∥)</div>
              <div class="stat-val accent-gold" id="stat-KP">—</div>
            </div>
          </div>
        </div>

        <!-- Controles -->
        <div class="ps">
          <div class="ps-label">Controles</div>
          <div class="btn-group-12">
            <button class="btn-ctrl" id="btn-pause" onclick="togglePause(this)">⏸ Pausar</button>
            <button class="btn-ctrl btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          </div>
        </div>

      </aside>

      <!-- ══ CANVAS CENTRAL ══ -->
      <main class="panel-center-12">
        <div class="temporal-scene"><canvas id="canvasMain"></canvas></div>
      </main>

      <!-- ══ PANEL DERECHO: resolución ══ -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>
          <div class="res-hint">Se actualiza con cada slider</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-dyn" id="sust-inercia">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-gold" id="sust-ejes">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-green" id="sust-energia">—</div>
        </div>

        <div class="res-section">
          <div class="step-card accent-gold-soft" id="sust-energiap">—</div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida-12" style="margin-top:auto">
          <div class="res-title">Referencia rápida</div>
          <div class="ref-item-12"><span class="ref-f-12">I = Σmᵢrᵢ²</span></div>
          <div class="ref-item-12"><span class="ref-f-12">K = ½·I·ω²</span></div>
          <div class="ref-item-12"><span class="ref-f-12">I_P = I_cm + M·d²</span></div>
          <div class="ref-item-12"><span class="ref-f-12">¹⁄₁₂ML² — varilla cm</span></div>
          <div class="ref-item-12"><span class="ref-f-12">¹⁄₃ML² — varilla ext</span></div>
          <div class="ref-item-12 agr"><span class="ref-f-12 agr-f">½MR² — disco [+]</span></div>
          <div class="ref-item-12 agr"><span class="ref-f-12 agr-f">MR² — aro [+]</span></div>
          <div class="ref-item-12 agr"><span class="ref-f-12 agr-f">²⁄₅MR² — esfera [+]</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<style>
/* ── Layout 12 ── */
.sim-layout-12 {
  display: grid;
  grid-template-columns: 230px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}
.panel-center-12 { position: relative; background: #0a1628; overflow: hidden; }
.panel-center-12 canvas { position: absolute; top:0; left:0; width:100%; height:100%; }

/* ── Selector de cuerpo ── */
.cuerpo-list { display: flex; flex-direction: column; gap: 4px; }
.cuerpo-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 10px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx2); transition: all .15s; text-align: left;
}
.cuerpo-btn:hover  { border-color: var(--cc, var(--accent)); color: var(--cc, var(--accent)); }
.cuerpo-btn.active { border-color: var(--cc, var(--accent)); color: var(--cc, var(--accent));
                     background: color-mix(in srgb, var(--cc, var(--accent)) 8%, transparent); }
.cuerpo-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cuerpo-name  { flex: 1; }
.badge-agr-sm { color: #a371f7; font-size: 8px; }

/* ── Sliders ── */
.sl-group { display: flex; flex-direction: column; gap: 8px; }
.sl-row-12 { display: flex; align-items: center; gap: 6px; }
.sl-label {
  font-family: var(--mono); font-size: 12px; font-weight: 700;
  width: 26px; flex-shrink: 0; text-align: center;
}
.sl-label-white { color: var(--tx1); }
.sl-label-blue  { color: var(--accent); }
.sl-label-gold  { color: #e3b341; }
.sl-label-dyn   { color: #58a6ff; }
.sl-dim-desc    { font-size: 9px; color: var(--tx3); margin-top: -4px; padding-left: 32px; }
.sl-row-12 input[type=range] {
  flex: 1; -webkit-appearance: none; height: 3px;
  background: var(--input); border-radius: 2px; outline: none; cursor: pointer;
}
.sl-row-12 input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); cursor: pointer;
  border: 2px solid var(--bg);
}
.sl-val { font-family: var(--mono); font-size: 10px; color: var(--tx2); min-width: 64px; text-align: right; }
.sl-val b { color: var(--tx1); }
.sl-val span { font-size: 9px; }

/* ── Stats ── */
.stat-grid-12 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-cell { background: var(--card); border: 1px solid var(--border); border-radius: var(--rs); padding: 7px 9px; }
.stat-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing:.07em; color: var(--tx3); margin-bottom:3px; }
.stat-val { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--tx1); }
.stat-val.accent-gold  { color: #e3b341; }
.stat-val.accent-green { color: #3fb950; }
.stat-val.accent-dyn   { color: var(--accent); }

/* ── Botones ── */
.btn-group-12 { display: flex; flex-direction: column; gap: 5px; }
.btn-ctrl { padding: 8px; border-radius: var(--rs); cursor: pointer;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx1); transition: all .15s; }
.btn-ctrl:hover  { border-color: var(--accent); color: var(--accent); }
.btn-reset:hover { border-color: var(--tx2); color: var(--tx2); }

/* ── Panel derecho ── */
.res-hint { font-size: 10px; color: var(--tx3); line-height: 1.4; margin-top: -4px; }
.step-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--rs); padding: 10px 12px; }
.step-card.accent-dyn      { border-color: rgba(88,166,255,.22); }
.step-card.accent-gold     { border-color: rgba(227,179,65,.22); }
.step-card.accent-green    { border-color: rgba(63,185,80,.2); }
.step-card.accent-gold-soft{ border-color: rgba(227,179,65,.12); }
.step-formula { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing:.08em; color: var(--tx3); margin-bottom:5px; }
.step-sust    { font-family: var(--mono); font-size: 10px; color: var(--tx2); margin-bottom:5px; line-height:1.6; }
.step-res     { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent); }

/* ── Ref rápida ── */
.ref-item-12 { margin-bottom: 4px; }
.ref-f-12 { font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 7px; border-radius: 4px; display: inline-block; }
.ref-item-12.agr .ref-f-12 { color: #a371f7; background: rgba(163,113,247,.08); }
</style>

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