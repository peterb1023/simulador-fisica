<?php
// ============================================================
//  formulas.php  —  Tab "Fórmulas" SIM 08: Leyes de Newton
//  Incluido por index.php con include()
//  Usa las variables CSS de sim.css (--bg, --card, --accent…)
// ============================================================
?>

<div class="formulas-wrap">

  <!-- ══ ENCABEZADO ══ -->
  <div class="fml-header">
    <div class="fml-title">Leyes de Newton</div>
    <div class="fml-subtitle">Semanas 7–8 · Dinámica · ΣF⃗ = ma⃗</div>
  </div>

  <div class="fml-grid">

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   1ª LEY — EQUILIBRIO   ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num">1</span>
        <div>
          <div class="fml-card-title">Primera Ley de Newton</div>
          <div class="fml-card-sub">Condición de equilibrio</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">ΣF⃗ = 0</div>
        <div class="fml-eq-desc">Si la suma de todas las fuerzas es cero, el objeto permanece en reposo o en MRU.</div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   2ª LEY — F = ma       ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card fml-card-accent">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-accent">2</span>
        <div>
          <div class="fml-card-title">Segunda Ley de Newton</div>
          <div class="fml-card-sub">La fuerza neta produce aceleración</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq fml-eq-big">ΣF⃗ = ma⃗</div>
      </div>

      <div class="fml-row-group">
        <div class="fml-row">
          <span class="fml-sym accent-blue">ΣFx</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">m · ax</span>
          <span class="fml-comment">Componente horizontal</span>
        </div>
        <div class="fml-row">
          <span class="fml-sym accent-blue">ΣFy</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">m · ay</span>
          <span class="fml-comment">Componente vertical</span>
        </div>
        <div class="fml-row">
          <span class="fml-sym accent-gold">ax</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">ΣFx / m</span>
          <span class="fml-comment">Despejada</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   PESO                  ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-red">W</span>
        <div>
          <div class="fml-card-title">Peso</div>
          <div class="fml-card-sub">Fuerza gravitacional sobre el objeto</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">w = m · g</div>
      </div>

      <div class="fml-var-table">
        <div class="fml-var-row">
          <span class="fml-var-sym accent-red">w</span>
          <span class="fml-var-name">Peso</span>
          <span class="fml-var-unit">N</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym">m</span>
          <span class="fml-var-name">Masa</span>
          <span class="fml-var-unit">kg</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym">g</span>
          <span class="fml-var-name">Gravedad</span>
          <span class="fml-var-unit">9.8 m/s²</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   TENSIÓN EN ELEVADOR   ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-green">T</span>
        <div>
          <div class="fml-card-title">Tensión en Elevador</div>
          <div class="fml-card-sub">Segunda ley aplicada verticalmente</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">T = m (g + ay)</div>
        <div class="fml-eq-desc">La cuerda debe soportar el peso <em>más</em> la aceleración vertical del sistema.</div>
      </div>

      <div class="fml-scenario-grid">
        <div class="fml-scenario">
          <span class="fml-sc-icon">⇑</span>
          <span class="fml-sc-text">Sube (ay &gt; 0): T &gt; w</span>
        </div>
        <div class="fml-scenario">
          <span class="fml-sc-icon">⚖</span>
          <span class="fml-sc-text">Reposo (ay = 0): T = w</span>
        </div>
        <div class="fml-scenario">
          <span class="fml-sc-icon">⇓</span>
          <span class="fml-sc-text">Baja (ay &lt; 0): T &lt; w</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   TRABAJO CON ÁNGULO    ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-gold">W</span>
        <div>
          <div class="fml-card-title">Trabajo con Ángulo</div>
          <div class="fml-card-sub">Fuerza aplicada con φ respecto a s</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">W = F · s · cos φ</div>
        <div class="fml-eq-desc">Solo la componente de F en la dirección del desplazamiento realiza trabajo.</div>
      </div>

      <div class="fml-row-group">
        <div class="fml-row">
          <span class="fml-sym accent-gold">φ = 0°</span>
          <span class="fml-comment">Fuerza paralela → W = F·s (máximo)</span>
        </div>
        <div class="fml-row">
          <span class="fml-sym accent-gold">φ = 90°</span>
          <span class="fml-comment">Fuerza perpendicular → W = 0</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   FRICCIÓN  [AGREGADA]  ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card fml-card-agr">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-purple">f</span>
        <div>
          <div class="fml-card-title">
            Fricción
            <span class="badge-agr">[AGREGADA]</span>
          </div>
          <div class="fml-card-sub">Unidad 5 del profesor · no incluida en semanas activas</div>
        </div>
      </div>

      <div class="fml-eq-block fml-eq-block-agr">
        <div class="fml-eq fml-eq-agr">fk = μk · n</div>
        <div class="fml-eq-desc">Fricción cinética — aparece cuando el objeto ya está deslizando.</div>
      </div>

      <div class="fml-eq-block fml-eq-block-agr" style="margin-top:8px">
        <div class="fml-eq fml-eq-agr">fs ≤ μs · n</div>
        <div class="fml-eq-desc">Fricción estática — se opone al inicio del movimiento. Puede valer desde 0 hasta μs·n.</div>
      </div>

      <div class="fml-var-table" style="margin-top:10px">
        <div class="fml-var-row">
          <span class="fml-var-sym accent-purple">μk</span>
          <span class="fml-var-name">Coef. cinético</span>
          <span class="fml-var-unit">adimensional</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym accent-purple">μs</span>
          <span class="fml-var-name">Coef. estático</span>
          <span class="fml-var-unit">adimensional</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym accent-green">n</span>
          <span class="fml-var-name">Fuerza normal</span>
          <span class="fml-var-unit">N</span>
        </div>
      </div>

      <div class="fml-note-agr">
        ⚠ Estas fórmulas están marcadas como <strong>[AGREGADA]</strong> porque enriquecen la simulación pero el profesor no las incluyó en el plan de semanas activas.
      </div>
    </div>

  </div><!-- /fml-grid -->


  <!-- ══ TABLA RESUMEN DE VARIABLES ══ -->
  <div class="fml-section-title">Resumen de variables</div>
  <div class="fml-vars-full">

    <div class="fml-vars-row fml-vars-head">
      <span>Símbolo</span>
      <span>Nombre</span>
      <span>Unidad</span>
      <span>Descripción</span>
    </div>

    <div class="fml-vars-row">
      <span class="accent-blue">ΣF⃗</span>
      <span>Fuerza neta</span>
      <span>N</span>
      <span>Suma vectorial de todas las fuerzas sobre el objeto</span>
    </div>
    <div class="fml-vars-row">
      <span>m</span>
      <span>Masa</span>
      <span>kg</span>
      <span>Cantidad de materia del objeto</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-gold">a⃗</span>
      <span>Aceleración</span>
      <span>m/s²</span>
      <span>Cambio de velocidad por unidad de tiempo</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-red">w</span>
      <span>Peso</span>
      <span>N</span>
      <span>Fuerza gravitacional — siempre apunta hacia abajo</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-green">N</span>
      <span>Normal</span>
      <span>N</span>
      <span>Fuerza perpendicular de la superficie sobre el objeto</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-gold">F</span>
      <span>Fuerza aplicada</span>
      <span>N</span>
      <span>Fuerza externa con ángulo φ respecto a la horizontal</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-gold">φ</span>
      <span>Ángulo de F</span>
      <span>°</span>
      <span>Ángulo entre la fuerza aplicada y el desplazamiento</span>
    </div>
    <div class="fml-vars-row">
      <span class="accent-green">T</span>
      <span>Tensión</span>
      <span>N</span>
      <span>Fuerza en la cuerda del elevador</span>
    </div>
    <div class="fml-vars-row">
      <span>g</span>
      <span>Gravedad</span>
      <span>m/s²</span>
      <span>9.8 m/s² en la superficie terrestre</span>
    </div>
    <div class="fml-vars-row fml-vars-row-agr">
      <span class="accent-purple">μk</span>
      <span>Coef. fricción cinética</span>
      <span>—</span>
      <span><span class="badge-agr-sm">[AGREGADA]</span> Relación fk/n cuando hay deslizamiento</span>
    </div>
    <div class="fml-vars-row fml-vars-row-agr">
      <span class="accent-purple">μs</span>
      <span>Coef. fricción estática</span>
      <span>—</span>
      <span><span class="badge-agr-sm">[AGREGADA]</span> Relación fs_max/n antes del deslizamiento</span>
    </div>

  </div>


  <!-- ══ DCL DE REFERENCIA ══ -->
  <div class="fml-section-title">Diagrama de cuerpo libre — Plano</div>
  <div class="fml-dcl-wrap">
    <svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg"
         class="fml-dcl-svg" aria-label="Diagrama de cuerpo libre en plano horizontal">

      <!-- Suelo -->
      <line x1="40" y1="175" x2="380" y2="175" stroke="#58a6ff" stroke-width="2" stroke-opacity="0.4"/>
      <!-- Hatching suelo -->
      <?php for($x = 50; $x < 380; $x += 16): ?>
        <line x1="<?= $x ?>" y1="175" x2="<?= $x - 9 ?>" y2="188"
              stroke="#58a6ff" stroke-width="1" stroke-opacity="0.12"/>
      <?php endfor; ?>

      <!-- Bloque -->
      <rect x="178" y="115" width="64" height="60" rx="5"
            fill="#1c2d4a" stroke="#58a6ff" stroke-width="2"/>
      <text x="210" y="150" fill="#e6edf3" font-family="Syne, sans-serif"
            font-size="12" font-weight="700" text-anchor="middle">m</text>

      <!-- W — Peso (abajo) -->
      <line x1="210" y1="175" x2="210" y2="218" stroke="#f85149" stroke-width="2.5"/>
      <polygon points="210,223 205,212 215,212" fill="#f85149"/>
      <text x="218" y="210" fill="#f85149" font-family="Space Mono, monospace"
            font-size="10" font-weight="700">W = mg</text>

      <!-- N — Normal (arriba) -->
      <line x1="210" y1="115" x2="210" y2="72" stroke="#3fb950" stroke-width="2.5"/>
      <polygon points="210,67 205,78 215,78" fill="#3fb950"/>
      <text x="218" y="96" fill="#3fb950" font-family="Space Mono, monospace"
            font-size="10" font-weight="700">N</text>

      <!-- F — Fuerza (diagonal, ángulo φ ≈ 30°) -->
      <line x1="210" y1="145" x2="290" y2="103" stroke="#e3b341" stroke-width="3"/>
      <polygon points="294,100 280,106 286,118" fill="#e3b341"/>
      <text x="296" y="102" fill="#e3b341" font-family="Space Mono, monospace"
            font-size="10" font-weight="700">F</text>
      <!-- Arco ángulo φ -->
      <path d="M 237 145 A 27 27 0 0 0 222 122"
            fill="none" stroke="#e3b341" stroke-width="1" stroke-opacity="0.6"/>
      <text x="242" y="140" fill="#e3b341" font-family="Space Mono, monospace"
            font-size="9">φ</text>

      <!-- fk — Fricción (izquierda) [AGREGADA] -->
      <line x1="178" y1="145" x2="118" y2="145" stroke="#a371f7" stroke-width="2.5"
            stroke-dasharray="5,3"/>
      <polygon points="113,145 124,140 124,150" fill="#a371f7"/>
      <text x="112" y="136" fill="#a371f7" font-family="Space Mono, monospace"
            font-size="9" font-weight="700" text-anchor="end">fk</text>
      <text x="112" y="148" fill="#a371f7" font-family="Space Mono, monospace"
            font-size="7" text-anchor="end">[AGR]</text>

      <!-- ΣF — Resultante (derecha) -->
      <line x1="242" y1="145" x2="310" y2="145" stroke="#ffffff" stroke-width="3"/>
      <polygon points="315,145 304,140 304,150" fill="#ffffff"/>
      <text x="317" y="149" fill="#ffffff" font-family="Space Mono, monospace"
            font-size="10" font-weight="700">ΣF</text>

    </svg>
  </div>

</div><!-- /formulas-wrap -->


<!-- ══ ESTILOS LOCALES DEL TAB FÓRMULAS ══ -->
<style>
/* Contenedor principal */
.formulas-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px 48px;
  color: var(--tx1);
}

/* Encabezado */
.fml-header { margin-bottom: 28px; }
.fml-title  {
  font-family: var(--font);
  font-size: 26px;
  font-weight: 800;
  color: var(--tx1);
  line-height: 1.1;
}
.fml-subtitle {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--tx3);
  margin-top: 5px;
  letter-spacing: .06em;
}

/* Grid de tarjetas */
.fml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 36px;
}

/* Tarjeta base */
.fml-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
.fml-card-accent {
  border-color: rgba(88,166,255,.28);
  background: rgba(88,166,255,.04);
}
.fml-card-agr {
  border-color: rgba(163,113,247,.25);
  background: rgba(163,113,247,.04);
}

/* Header de tarjeta */
.fml-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 13px;
}
.fml-card-num {
  width: 32px; height: 32px;
  border-radius: 6px;
  background: var(--input);
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--tx2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fml-card-num-accent { color: var(--accent); border-color: rgba(88,166,255,.3); background: rgba(88,166,255,.08); }
.fml-card-num-red    { color: #f85149; border-color: rgba(248,81,73,.3); background: rgba(248,81,73,.07); }
.fml-card-num-green  { color: #3fb950; border-color: rgba(63,185,80,.3); background: rgba(63,185,80,.07); }
.fml-card-num-gold   { color: #e3b341; border-color: rgba(227,179,65,.3); background: rgba(227,179,65,.07); }
.fml-card-num-purple { color: #a371f7; border-color: rgba(163,113,247,.3); background: rgba(163,113,247,.08); }

.fml-card-title {
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  color: var(--tx1);
  display: flex;
  align-items: center;
  gap: 6px;
}
.fml-card-sub {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--tx3);
  margin-top: 2px;
  letter-spacing: .05em;
}

/* Bloque de ecuación */
.fml-eq-block { margin-bottom: 12px; }
.fml-eq {
  font-family: var(--mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  background: rgba(88,166,255,.06);
  border: 1px solid rgba(88,166,255,.12);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 7px;
}
.fml-eq-big { font-size: 20px; }
.fml-eq-agr {
  color: #a371f7;
  background: rgba(163,113,247,.06);
  border-color: rgba(163,113,247,.15);
}
.fml-eq-block-agr .fml-eq { /* ya cubierto por .fml-eq-agr */ }
.fml-eq-desc {
  font-size: 11px;
  color: var(--tx2);
  line-height: 1.55;
}
.fml-eq-desc em { color: var(--tx1); font-style: normal; font-weight: 600; }

/* Filas de fórmulas despejadas */
.fml-row-group { display: flex; flex-direction: column; gap: 6px; }
.fml-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 11px;
}
.fml-sym   { font-weight: 700; min-width: 52px; }
.fml-op    { color: var(--tx3); }
.fml-expr  { color: var(--tx1); }
.fml-comment { color: var(--tx3); font-size: 9px; margin-left: auto; text-align: right; }

/* Tabla de variables dentro de tarjeta */
.fml-var-table { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.fml-var-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  padding: 4px 8px;
  background: var(--input);
  border-radius: 4px;
}
.fml-var-sym  { font-family: var(--mono); font-weight: 700; min-width: 24px; }
.fml-var-name { flex: 1; color: var(--tx2); }
.fml-var-unit { font-family: var(--mono); color: var(--tx3); font-size: 9px; }

/* Escenarios del elevador */
.fml-scenario-grid { display: flex; flex-direction: column; gap: 5px; margin-top: 4px; }
.fml-scenario {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-family: var(--mono);
  color: var(--tx2);
  padding: 4px 8px;
  background: var(--input);
  border-radius: 4px;
}
.fml-sc-icon { font-size: 13px; }
.fml-sc-text { }

/* Nota AGREGADA */
.fml-note-agr {
  margin-top: 10px;
  padding: 8px 10px;
  border-left: 3px solid #a371f7;
  background: rgba(163,113,247,.06);
  border-radius: 0 5px 5px 0;
  font-size: 10px;
  color: var(--tx2);
  line-height: 1.55;
}
.fml-note-agr strong { color: #a371f7; }

/* Badge AGREGADA inline */
.badge-agr {
  font-size: 9px;
  font-weight: 700;
  font-family: var(--mono);
  color: #a371f7;
  background: rgba(163,113,247,.12);
  border: 1px solid rgba(163,113,247,.2);
  border-radius: 3px;
  padding: 1px 5px;
  vertical-align: middle;
}
.badge-agr-sm {
  font-size: 8px;
  font-weight: 700;
  font-family: var(--mono);
  color: #a371f7;
}

/* Colores de acento reutilizados */
.accent-blue   { color: var(--accent); }
.accent-red    { color: #f85149; }
.accent-green  { color: #3fb950; }
.accent-gold   { color: #e3b341; }
.accent-purple { color: #a371f7; }

/* ══ Sección título ══ */
.fml-section-title {
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  color: var(--tx2);
  text-transform: uppercase;
  letter-spacing: .1em;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

/* ══ Tabla resumen de variables ══ */
.fml-vars-full { display: flex; flex-direction: column; gap: 2px; }
.fml-vars-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 2fr;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--tx2);
}
.fml-vars-row:nth-child(even) { background: rgba(48,54,61,.35); }
.fml-vars-head {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--tx3);
  background: transparent !important;
  margin-bottom: 4px;
}
.fml-vars-row-agr { background: rgba(163,113,247,.06) !important; }

/* ══ DCL SVG ══ */
.fml-dcl-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: center;
}
.fml-dcl-svg {
  width: 100%;
  max-width: 480px;
  height: auto;
}
</style><section class="fp-card"><h3>Plano inclinado y transición de fricción</h3><p>Eje x ascendente sobre el plano: mg∥=−mg sen θ; mg⊥=−mg cos θ. φ se mide desde el plano. N=max(0,mg cos θ−F sen φ).</p><p>Desde reposo, D=F cos φ−mg sen θ. Si |D|≤μsN, fs=−D y a=0. Al deslizar: fk=−sign(v)μkN. Al detenerse se evalúa otra vez el umbral estático; puede quedarse en reposo o invertir el sentido.</p><p>ΣFx=D+f; a=ΣFx/m. Se requiere m&gt;0 y 0≤μk≤μs. Si F sen φ&gt;mg cos θ el bloque se separa: N=f=0 y se muestra aceleración normal.</p></section>