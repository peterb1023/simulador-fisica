<?php
require_once 'php/config.php';
$cfg    = getSimConfig();
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
    <div class="sim-layout-03">

      <!-- ══ PANEL IZQUIERDO: modo + selector de categoría ══ -->
      <aside class="panel-left-03">

        <!-- Modo: unidades vs prefijos -->
        <div class="ps">
          <div class="ps-label">Modo</div>
          <div class="modo-group">
            <button class="modo-btn active" onclick="UI.setModo('unidades',this)">Unidades físicas</button>
            <button class="modo-btn" onclick="UI.setModo('prefijos',this)">Prefijos SI</button>
          </div>
        </div>

        <!-- Tabs de categoría (solo en modo unidades) -->
        <div id="panel-cat-nav" class="ps">
          <div class="ps-label">Categoría</div>
          <div id="cat-nav">
            <!-- Generado por ui.js → buildCategoryTabs() -->
          </div>
        </div>

      </aside>

      <!-- ══ PANEL CENTRAL: calculadora ══ -->
      <main class="panel-center-03">

        <!-- ── MODO UNIDADES ── -->
        <div id="panel-unidades">

          <!-- Fila de conversión -->
          <div class="conv-row">
            <div class="conv-field">
              <label class="conv-label">Valor</label>
              <input type="number" id="inp-valor" class="conv-input" value="1" step="any" placeholder="0">
            </div>
            <div class="conv-field">
              <label class="conv-label">Desde</label>
              <select id="sel-origen" class="conv-select"></select>
            </div>
            <button class="btn-swap" onclick="UI.intercambiar()" title="Intercambiar">⇄</button>
            <div class="conv-field">
              <label class="conv-label">Hacia</label>
              <select id="sel-destino" class="conv-select"></select>
            </div>
          </div>

          <!-- Resultado grande -->
          <div class="res-big-block">
            <div class="res-big-de" id="res-de">—</div>
            <div class="res-big-num">
              <span id="res-valor">—</span>
              <span class="res-big-unit" id="res-unidad"></span>
            </div>
          </div>

          <!-- Pasos de resolución -->
          <div class="pasos-section">
            <div class="pasos-title">Resolución paso a paso</div>
            <div id="pasos-container">
              <!-- Generado por ui.js -->
            </div>
          </div>

        </div><!-- /#panel-unidades -->

        <!-- ── MODO PREFIJOS ── -->
        <div id="panel-prefijos" style="display:none">

          <div class="conv-row">
            <div class="conv-field">
              <label class="conv-label">Valor</label>
              <input type="number" id="pref-valor" class="conv-input" value="1" step="any" placeholder="0">
            </div>
            <div class="conv-field">
              <label class="conv-label">Desde</label>
              <select id="pref-origen" class="conv-select"></select>
            </div>
            <div class="conv-swap-placeholder">→</div>
            <div class="conv-field">
              <label class="conv-label">Hacia</label>
              <select id="pref-destino" class="conv-select"></select>
            </div>
          </div>

          <!-- Resultado prefijo -->
          <div class="res-big-block">
            <div class="res-big-num" id="pref-resultado">—</div>
          </div>

          <!-- Pasos prefijo -->
          <div class="pasos-section">
            <div class="pasos-title">Resolución paso a paso</div>
            <div id="pref-pasos"></div>
          </div>

          <!-- Tabla de prefijos completa -->
          <div class="pasos-section">
            <div class="pasos-title">Referencia — todos los prefijos SI</div>
            <table class="full-pref-table">
              <thead>
                <tr><th>Prefijo</th><th>Símbolo</th><th>Potencia</th><th>Factor</th></tr>
              </thead>
              <tbody id="prefijos-tbody">
                <!-- Generado por ui.js → buildPrefijosTabla() -->
              </tbody>
            </table>
          </div>

        </div><!-- /#panel-prefijos -->

      </main>

      <!-- ══ PANEL DERECHO: tabla de equivalencias ══ -->
      <aside class="panel-right-03" id="panel-equiv">
        <div class="ps-label" style="padding:12px 12px 8px">Equivalencias rápidas</div>
        <div class="equiv-hint">Clic en una fila para seleccionarla como destino</div>
        <table class="equiv-tbl">
          <tbody id="equiv-table">
            <!-- Generado por ui.js → buildEquivTable() -->
          </tbody>
        </table>
      </aside>

    </div><!-- /.sim-layout-03 -->
  </div><!-- /#tab-sim -->

  <!-- TAB: FÓRMULAS -->
  <div id="tab-formulas" class="tab" style="display:none">
    <?php include 'php/formulas.php'; ?>
  </div>

</div><!-- /#app -->

<!-- Estilos específicos SIM 03 -->
<style>
/* ── Layout 03 (reemplaza sim-layout de SIM 02) ── */
.sim-layout-03 {
  display: grid;
  grid-template-columns: 200px 1fr 220px;
  height: calc(100vh - 52px);
  overflow: hidden;
}

/* ── Panel izquierdo ── */
.panel-left-03 {
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: 12px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 0;
}

/* Modo buttons */
.modo-group { display: flex; flex-direction: column; gap: 4px; }
.modo-btn {
  width: 100%; padding: 8px 12px; border-radius: var(--rs);
  background: var(--card); border: 1px solid var(--border);
  color: var(--tx2); font-family: var(--font); font-size: 12px;
  cursor: pointer; text-align: left; transition: all .15s;
}
.modo-btn:hover  { border-color: var(--borderL); color: var(--tx1); }
.modo-btn.active { background: rgba(88,166,255,.12); border-color: var(--accent); color: var(--accent); font-weight: 600; }

/* Tabs de categoría */
#cat-nav { display: flex; flex-direction: column; gap: 3px; }
.cat-tab {
  width: 100%; padding: 7px 10px; border-radius: var(--rs);
  background: transparent; border: 1px solid transparent;
  color: var(--tx2); font-family: var(--font); font-size: 12px;
  cursor: pointer; text-align: left; transition: all .15s;
  display: flex; align-items: center; gap: 7px;
}
.cat-tab:hover  { background: var(--card); border-color: var(--border); color: var(--tx1); }
.cat-tab.active { background: var(--card); border-color: var(--border); color: var(--tx1); }
.ct-icon { font-size: 14px; flex-shrink: 0; }
.ct-name { font-size: 11px; }

/* ── Panel central ── */
.panel-center-03 {
  overflow-y: auto;
  padding: 20px 24px;
  background: var(--bg);
  display: flex; flex-direction: column; gap: 0;
}

/* Fila de conversión */
.conv-row {
  display: flex; align-items: flex-end; gap: 10px;
  margin-bottom: 20px; flex-wrap: wrap;
}
.conv-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 120px; }
.conv-label {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx2);
}
.conv-input {
  padding: 10px 12px; border-radius: var(--rs);
  background: var(--input); border: 1px solid var(--border);
  color: var(--tx1); font-family: var(--mono); font-size: 16px;
  outline: none; transition: border-color .15s; width: 100%;
}
.conv-input:focus { border-color: var(--accent); }
.conv-select {
  padding: 10px 12px; border-radius: var(--rs);
  background: var(--input); border: 1px solid var(--border);
  color: var(--tx1); font-family: var(--mono); font-size: 12px;
  outline: none; cursor: pointer; transition: border-color .15s; width: 100%;
}
.conv-select:focus { border-color: var(--accent); }
.btn-swap {
  padding: 10px 14px; border-radius: var(--rs); flex-shrink: 0;
  background: var(--card); border: 1px solid var(--border);
  color: var(--accent); font-size: 18px; cursor: pointer;
  transition: all .15s; align-self: flex-end;
}
.btn-swap:hover { background: rgba(88,166,255,.12); border-color: var(--accent); }
.conv-swap-placeholder {
  padding: 10px 6px; font-size: 18px; color: var(--tx3);
  align-self: flex-end; flex-shrink: 0;
}

/* Resultado grande */
.res-big-block {
  background: var(--panel); border: 1px solid var(--border);
  border-radius: var(--r); padding: 20px 24px;
  margin-bottom: 20px;
}
.res-big-de {
  font-family: var(--mono); font-size: 12px; color: var(--tx2); margin-bottom: 8px;
}
.res-big-num {
  font-family: var(--mono); font-size: 36px; font-weight: 700; color: var(--et);
  display: flex; align-items: baseline; gap: 10px;
}
.res-big-unit {
  font-size: 18px; color: var(--tx2); font-weight: 400;
}

/* Pasos */
.pasos-section { margin-bottom: 20px; }
.pasos-title {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: var(--tx2); margin-bottom: 10px;
}
#pasos-container, #pref-pasos { display: flex; flex-direction: column; gap: 6px; }
.paso-card {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 10px 12px;
}
.paso-card.paso-factor { border-color: rgba(227,179,65,.3); }
.paso-num {
  background: var(--input); color: var(--tx2);
  font-family: var(--mono); font-size: 10px;
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.paso-body { flex: 1; }
.paso-formula {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .06em; color: var(--tx3); margin-bottom: 3px;
}
.paso-expr {
  font-family: var(--mono); font-size: 12px; color: var(--tx2); margin-bottom: 3px;
}
.paso-res {
  font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--accent);
}
.paso-factor .paso-res { color: var(--et); }

/* Tabla de prefijos (modo prefijos) */
.full-pref-table {
  width: 100%; border-collapse: collapse;
  font-family: var(--mono); font-size: 11px;
}
.full-pref-table th {
  text-align: left; color: var(--tx3);
  font-size: 9px; text-transform: uppercase; letter-spacing: .08em;
  padding: 5px 10px; border-bottom: 1px solid var(--border);
}
.full-pref-table td {
  padding: 5px 10px; color: var(--tx2);
  border-bottom: 1px solid rgba(48,54,61,0.4);
}
.full-pref-table td:first-child { color: var(--tx1); }
.pref-base { background: rgba(227,179,65,.06); }
.pref-base td { color: var(--et) !important; font-weight: 700; }

/* ── Panel derecho: equivalencias ── */
.panel-right-03 {
  background: var(--panel);
  border-left: 1px solid var(--border);
  overflow-y: auto;
}
.equiv-hint {
  font-size: 10px; color: var(--tx3); padding: 0 12px 10px;
  line-height: 1.4;
}
.equiv-tbl { width: 100%; border-collapse: collapse; }
.equiv-tbl tr {
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background .1s;
}
.equiv-tbl tr:hover { background: var(--card); }
.eq-sym  { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--accent); padding: 8px 8px 8px 12px; width: 50px; }
.eq-name { font-size: 11px; color: var(--tx2); padding: 8px 4px; }
.eq-val  { font-family: var(--mono); font-size: 12px; color: var(--et); padding: 8px 12px 8px 4px; text-align: right; }
</style>

<script>const CFG = <?= $js_cfg ?>;</script>
<script src="js/engine.js"></script>
<script src="js/ui.js"></script>
</body>
</html>
