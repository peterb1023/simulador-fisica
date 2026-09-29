<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
$js_cfg = json_encode($cfg, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
$lim    = $cfg['limites'];
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
      <a href="../../index.php" class="nav-btn">← Portal</a>
    </nav>
  </header>

  <!-- ═══════════════════════════════════════
       TAB: SIMULADOR
  ════════════════════════════════════════ -->
  <div id="tab-sim" class="tab active">
    <div class="sim-layout">

      <!-- PANEL IZQUIERDO: controles -->
      <aside class="panel-left">

        <!-- Modo -->
        <div class="ps">
          <div class="ps-label">Modo</div>
          <div class="modo-btns">
            <button class="modo-btn active" id="btn-modo-fuerza" onclick="setModo('fuerza')">Fuerza</button>
            <button class="modo-btn"        id="btn-modo-resorte" onclick="setModo('resorte')">Resorte: trabajo externo</button>
          </div>
        </div>

        <!-- Sección: Fuerza con ángulo -->
        <div id="sec-fuerza">

          <div class="ps">
            <div class="ps-label">Fuerza aplicada</div>
            <div class="sl-row">
              <label class="sl-label" for="sl-F">F</label>
              <input type="range"
                id="sl-F"
                min="<?= $lim['F_min'] ?>" max="<?= $lim['F_max'] ?>" step="1" value="40"
                oninput="setF(+this.value)">
              <span class="sl-val"><b id="v-F">40</b> N</span>
            </div>
          </div>

          <div class="ps">
            <div class="ps-label">Ángulo φ (F con desplazamiento)</div>
            <div class="sl-row">
              <label class="sl-label" for="sl-phi">φ</label>
              <input type="range"
                id="sl-phi"
                min="<?= $lim['phi_min'] ?>" max="<?= $lim['phi_max'] ?>" step="1" value="30"
                oninput="setPhi(+this.value)">
              <span class="sl-val"><b id="v-phi">30</b>°</span>
            </div>
          </div>

          <div class="ps">
            <div class="ps-label">Desplazamiento</div>
            <div class="sl-row">
              <label class="sl-label" for="sl-s">s</label>
              <input type="range"
                id="sl-s"
                min="<?= $lim['s_min'] ?>" max="<?= $lim['s_max'] ?>" step="1" value="10"
                oninput="setS(+this.value)">
              <span class="sl-val"><b id="v-s">10</b> m</span>
            </div>
          </div>

        </div><!-- /#sec-fuerza -->

        <!-- Sección: Resorte -->
        <div id="sec-resorte" style="display:none">

          <div class="ps">
            <div class="ps-label">Constante del resorte <span class="tag-agr">AGREGADA</span></div>
            <div class="sl-row">
              <label class="sl-label" for="sl-k">k</label>
              <input type="range"
                id="sl-k"
                min="<?= $lim['k_min'] ?>" max="<?= $lim['k_max'] ?>" step="5" value="50"
                oninput="setK(+this.value)">
              <span class="sl-val"><b id="v-k">50</b> N/m</span>
            </div>
          </div>

          <div class="ps">
            <div class="ps-label">Elongación del resorte</div>
            <div class="sl-row">
              <label class="sl-label" for="sl-x">x</label>
              <input type="range"
                id="sl-x"
                min="<?= $lim['x_min'] ?>" max="<?= $lim['x_max'] ?>" step="0.1" value="1.0"
                oninput="setX(+this.value)">
              <span class="sl-val"><b id="v-x">1.0</b> m</span>
            </div>
          </div>

        </div><!-- /#sec-resorte -->

        <!-- Teorema trabajo-energía (siempre visible) -->
        <div class="ps">
          <div class="ps-label">Teorema trabajo-energía</div>
          <div class="sl-row">
            <label class="sl-label" for="sl-m">m</label>
            <input type="range"
              id="sl-m"
              min="<?= $lim['m_min'] ?>" max="<?= $lim['m_max'] ?>" step="1" value="5"
              oninput="setM(+this.value)">
            <span class="sl-val"><b id="v-m">5</b> kg</span>
          </div>
          <div class="sl-row">
            <label class="sl-label" for="sl-v0">v₀</label>
            <input type="range"
              id="sl-v0"
              min="<?= $lim['v0_min'] ?>" max="<?= $lim['v0_max'] ?>" step="0.5" value="3"
              oninput="setV0(+this.value)">
            <span class="sl-val"><b id="v-v0">3</b> m/s</span>
          </div>
        </div>

        <!-- Controles de simulación -->
        <div class="ps btn-row">
          <button class="btn-reset" onclick="resetSim()">↺ Reiniciar</button>
          <button class="btn-pause" id="btn-pause" onclick="togglePause()">⏸ Pausar</button>
        </div>

      </aside><!-- /.panel-left -->

      <!-- CANVAS CENTRAL -->
      <main class="panel-center">
        <div class="temporal-scene"><canvas id="canvasMain"></canvas></div>
<div data-timeline aria-label="Controles de tiempo"><button type="button" data-reset aria-label="Volver al inicio">⏮</button><button type="button" data-play aria-label="Pausar">⏸</button><input type="range" min="0" max="20" step="any" value="0" aria-label="Tiempo de simulación en segundos"><output>0 s</output></div>
        <div class="graph-wrap">
          <div class="graph-label">Gráfica F(s) — Área = Trabajo; 4 s de presentación, no tiempo físico</div>
          <canvas id="canvasGraph"></canvas>
        </div>
      </main>

      <!-- PANEL DERECHO: resolución en vivo -->
      <aside class="panel-right">

        <div class="res-section">
          <div class="res-title">Estado</div>
          <span class="signo-badge pos" id="signo-badge">W > 0 — objeto acelera</span>
        </div>

        <div class="res-section">
          <div class="res-title">Resolución en vivo</div>

          <!-- Bloque 1: componente de la fuerza -->
          <div class="fl-block">
            <div class="fl-name" style="color:var(--et)">Componente</div>
            <div class="fl-formula" id="fl-comp-f">—</div>
            <div class="fl-sust"    id="fl-comp-s">—</div>
            <div class="fl-result"  id="fl-comp-r">—</div>
          </div>

          <!-- Bloque 2: trabajo -->
          <div class="fl-block">
            <div class="fl-name" style="color:var(--ec)">Trabajo</div>
            <div class="fl-formula" id="fl-work-f">—</div>
            <div class="fl-sust"    id="fl-work-s">—</div>
            <div class="fl-result"  id="fl-work-r">—</div>
          </div>

          <!-- Bloque 3: teorema trabajo-energía -->
          <div class="fl-block">
            <div class="fl-name" style="color:var(--accent)">Teorema W-E</div>
            <div class="fl-formula" id="fl-ener-f">—</div>
            <div class="fl-sust"    id="fl-ener-s">—</div>
            <div class="fl-result"  id="fl-ener-r">—</div>
          </div>

        </div><!-- /.res-section -->

      </aside><!-- /.panel-right -->

    </div><!-- /.sim-layout -->
  </div><!-- /#tab-sim -->

  <!-- ═══════════════════════════════════════
       TAB: FÓRMULAS
  ════════════════════════════════════════ -->
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
<script src="../../js/timeline.js"></script>
<link rel="stylesheet" href="../../css/accessibility.css">
<script src="../../js/accessibility.js"></script>
</body>
</html>