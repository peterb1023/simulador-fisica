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
<body data-sim-id="10">

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
    <div class="sim-layout-10">

      <!-- ══ PANEL IZQUIERDO: selector de modo + inputs ══ -->
      <aside class="panel-left">

        <!-- Selector de modo -->
        <div class="ps">
          <div class="ps-label">¿Qué querés calcular?</div>
          <div class="modo-group">
            <button class="modo-btn active" id="modo-P"  onclick="setModo('P')">
              <span class="modo-icon">⚡</span>
              <span class="modo-texto">
                <b>Potencia</b>
                <small>P = W / t</small>
              </span>
            </button>
            <button class="modo-btn" id="modo-W"  onclick="setModo('W')">
              <span class="modo-icon">🔧</span>
              <span class="modo-texto">
                <b>Trabajo</b>
                <small>W = P · t</small>
              </span>
            </button>
            <button class="modo-btn" id="modo-t"  onclick="setModo('t')">
              <span class="modo-icon">⏱</span>
              <span class="modo-texto">
                <b>Tiempo</b>
                <small>t = W / P</small>
              </span>
            </button>
            <button class="modo-btn" id="modo-Fv" onclick="setModo('Fv')">
              <span class="modo-icon">🚀</span>
              <span class="modo-texto">
                <b>Potencia F·v</b>
                <small>P = F · v</small>
              </span>
            </button>
          </div>
        </div>

        <!-- Inputs (se muestran/ocultan según modo) -->
        <div class="ps">
          <div class="ps-label">Valores conocidos</div>

          <div class="inp-group" id="grp-W">
            <label class="inp-label">Trabajo <span class="inp-unit">W (J)</span></label>
            <input type="number" id="inp-W" class="inp-num"
              min="0" max="<?= $lim['W_max'] ?>" step="100" value="5000"
              oninput="Engine.setW(this.value); UI.renderPasos()">
            <div class="inp-hint">0 a <?= number_format($lim['W_max']) ?> J</div>
          </div>

          <div class="inp-group" id="grp-P" style="display:none">
            <label class="inp-label">Potencia <span class="inp-unit">P (W)</span></label>
            <input type="number" id="inp-P" class="inp-num"
              min="0" max="<?= $lim['P_max'] ?>" step="50" value="500"
              oninput="Engine.setP(this.value); UI.renderPasos()">
            <div class="inp-hint">0 a <?= number_format($lim['P_max']) ?> W</div>
          </div>

          <div class="inp-group" id="grp-t">
            <label class="inp-label">Tiempo <span class="inp-unit">t (s)</span></label>
            <input type="number" id="inp-t" class="inp-num"
              min="0" max="<?= $lim['t_max'] ?>" step="1" value="10"
              oninput="Engine.setT(this.value); UI.renderPasos()">
            <div class="inp-hint">0 a <?= number_format($lim['t_max']) ?> s (1 hora)</div>
          </div>

          <div class="inp-group" id="grp-F" style="display:none">
            <label class="inp-label">Fuerza <span class="inp-unit">F (N)</span></label>
            <input type="number" id="inp-F" class="inp-num"
              min="0" max="<?= $lim['F_max'] ?>" step="10" value="200"
              oninput="Engine.setF(this.value); UI.renderPasos()">
            <div class="inp-hint">0 a <?= number_format($lim['F_max']) ?> N</div>
          </div>

          <div class="inp-group" id="grp-v" style="display:none">
            <label class="inp-label">Velocidad <span class="inp-unit">v (m/s)</span></label>
            <input type="number" id="inp-v" class="inp-num"
              min="0" max="<?= $lim['v_max'] ?>" step="1" value="25"
              oninput="Engine.setV(this.value); UI.renderPasos()">
            <div class="inp-hint">0 a <?= $lim['v_max'] ?> m/s</div>
          </div>
        </div>

        <section class="ps"><h3>Eficiencia</h3><label for="eff-kind">Magnitud</label><select id="eff-kind"><option value="W">Potencia (W)</option><option value="J">Energía (J, mismo intervalo)</option></select><label for="eff-in">Entrada</label><input id="eff-in" type="number" min="0" value="1000"><label for="eff-out">Salida útil</label><input id="eff-out" type="number" min="0" value="800"><output id="eff-result" aria-live="polite"></output></section>
        <!-- Conversiones rápidas de referencia -->
        <div class="ps conv-ref">
          <div class="ps-label">Conversiones</div>
          <div class="conv-ref-row"><span>1 hp</span><span>=</span><span><?= $lim['hp_to_w'] ?> W</span></div>
          <div class="conv-ref-row"><span>1 kW</span><span>=</span><span>1 000 W</span></div>
          <div class="conv-ref-row"><span>1 kWh</span><span>=</span><span>3 600 000 J</span></div>
        </div>

      </aside>

      <!-- ══ PANEL CENTRAL: canvas visualización ══ -->
      <main class="panel-center-10">
        <div class="canvas-wrap-10">
          <canvas id="canvasVis"></canvas>
        </div>
      </main>

      <!-- ══ PANEL DERECHO: resultado + pasos ══ -->
      <aside class="panel-right">

        <!-- Resultado grande -->
        <div class="res-section">
          <div class="res-title">Resultado</div>
          <div class="res-label-txt" id="res-label">Potencia</div>
          <div class="res-big-10" id="res-valor">—</div>
        </div>

        <!-- Resolución paso a paso -->
        <div class="res-section">
          <div class="res-title">Resolución paso a paso</div>
          <div id="pasos-container">
            <!-- Generado por ui.js → renderPasos() -->
          </div>
        </div>

        <!-- Referencia rápida -->
        <div class="res-section ref-rapida-10">
          <div class="res-title">Fórmulas</div>
          <div class="ref-item-10"><span class="ref-f-10">P = W / t</span></div>
          <div class="ref-item-10"><span class="ref-f-10">P = F · v</span></div>
          <div class="ref-item-10"><span class="ref-f-10">W = P · t</span></div>
          <div class="ref-item-10"><span class="ref-f-10">t = W / P</span></div>
          <div class="ref-item-10"><span class="ref-f-10">1 hp = 746 W</span></div>
        </div>

      </aside>

    </div>
  </div>

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div>

<!-- Estilos específicos SIM 10 -->
<style>
/* ── Layout 10 ── */
.sim-layout-10 {
  display: grid;
  grid-template-columns: 230px 1fr 240px;
  height: calc(100vh - 52px);
  overflow: hidden;
}

/* ── Panel izquierdo ── */
.panel-left {
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: 12px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 0;
}

/* Modo buttons */
.modo-group { display: flex; flex-direction: column; gap: 5px; }
.modo-btn {
  width: 100%; padding: 9px 12px; border-radius: var(--rs);
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx2); font-family: var(--font); font-size: 12px;
  cursor: pointer; text-align: left; transition: all .15s;
  display: flex; align-items: center; gap: 10px;
}
.modo-btn:hover  { border-color: var(--borderL); color: var(--tx1); }
.modo-btn.active { background: rgba(88,166,255,.1); border-color: var(--accent); color: var(--tx1); }
.modo-icon { font-size: 16px; flex-shrink: 0; }
.modo-texto { display: flex; flex-direction: column; gap: 1px; }
.modo-texto b { font-size: 12px; color: var(--tx1); }
.modo-texto small { font-size: 10px; font-family: var(--mono); color: var(--tx3); }
.modo-btn.active .modo-texto small { color: var(--accent); }

/* Inputs numéricos */
.inp-group { margin-bottom: 10px; }
.inp-label {
  display: block; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--tx2); margin-bottom: 5px;
}
.inp-unit { color: var(--accent); font-weight: 400; }
.inp-num {
  width: 100%; padding: 9px 12px; border-radius: var(--rs);
  background: var(--input); border: 1px solid var(--border);
  color: var(--tx1); font-family: var(--mono); font-size: 16px;
  outline: none; transition: border-color .15s;
}
.inp-num:focus { border-color: var(--accent); }
.inp-hint { font-size: 9px; color: var(--tx3); margin-top: 3px; }

/* Conversiones de referencia */
.conv-ref { margin-top: auto; }
.conv-ref-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 0; border-bottom: 1px solid var(--border);
  font-family: var(--mono); font-size: 11px;
}
.conv-ref-row span:first-child { color: var(--accent); font-weight: 700; }
.conv-ref-row span:last-child  { color: var(--et); }
.conv-ref-row span:nth-child(2){ color: var(--tx3); }
.conv-ref-row:last-child { border-bottom: none; }

/* ── Panel central canvas ── */
.panel-center-10 {
  background: #0a1628;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.canvas-wrap-10 {
  width: 100%; height: 100%;
  position: relative;
}
#canvasVis {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}

/* ── Panel derecho ── */
.panel-right {
  background: var(--panel);
  border-left: 1px solid var(--border);
  padding: 12px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 0;
}

.res-label-txt {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx3); margin-bottom: 6px;
}
.res-big-10 {
  font-family: var(--mono); font-size: 32px; font-weight: 700;
  color: var(--et); line-height: 1.1;
}
.res-unit { font-size: 16px; color: var(--tx2); font-weight: 400; margin-left: 4px; }

/* Step cards */
#pasos-container { display: flex; flex-direction: column; gap: 6px; }
.step-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 10px 12px;
}
.step-formula {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx3); margin-bottom: 4px;
}
.step-sust {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  margin-bottom: 4px; line-height: 1.7;
}
.step-res {
  font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent);
}

/* Referencia rápida */
.ref-rapida-10 { margin-top: auto; }
.ref-item-10 { margin-bottom: 4px; }
.ref-f-10 {
  font-family: var(--mono); font-size: 10px; color: var(--tx2);
  background: var(--input); padding: 3px 8px; border-radius: 4px;
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
<script src="../../js/sim-records-ui.js"></script>
</body>
</html>