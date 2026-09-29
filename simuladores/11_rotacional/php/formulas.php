<?php
// ============================================================
//  formulas.php  —  Tab "Fórmulas" SIM 11: Cinemática Rotacional
//  Incluido por index.php con include()
// ============================================================
?>

<div class="formulas-wrap">

  <!-- ══ ENCABEZADO ══ -->
  <div class="fml-header">
    <div class="fml-title">Cinemática Rotacional</div>
    <div class="fml-subtitle">Semana 12 · Movimiento circular y rotacional · Tipo A — Canvas animado</div>
  </div>

  <div class="fml-grid">

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   ARCO Y ÁNGULO         ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num">s</span>
        <div>
          <div class="fml-card-title">Arco y ángulo</div>
          <div class="fml-card-sub">Relación entre desplazamiento lineal y angular</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">s = r · θ</div>
        <div class="fml-eq-desc">El arco recorrido por un punto a distancia <em>r</em> del centro cuando el disco gira un ángulo <em>θ</em> (en radianes).</div>
      </div>

      <div class="fml-var-table">
        <div class="fml-var-row">
          <span class="fml-var-sym">s</span>
          <span class="fml-var-name">Longitud de arco</span>
          <span class="fml-var-unit">m</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym">r</span>
          <span class="fml-var-name">Radio</span>
          <span class="fml-var-unit">m</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym accent-blue">θ</span>
          <span class="fml-var-name">Ángulo</span>
          <span class="fml-var-unit">rad</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   VELOCIDAD ANGULAR     ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card fml-card-accent">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-accent">ω</span>
        <div>
          <div class="fml-card-title">Velocidad angular</div>
          <div class="fml-card-sub">Tasa de cambio del ángulo</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq fml-eq-big">ω = Δθ / Δt</div>
        <div class="fml-eq-desc">Cuántos radianes rota el disco por segundo. Positivo = sentido antihorario.</div>
      </div>

      <div class="fml-row-group">
        <div class="fml-row">
          <span class="fml-sym accent-blue">ω</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">2π / T</span>
          <span class="fml-comment">MCU (período T)</span>
        </div>
        <div class="fml-row">
          <span class="fml-sym accent-blue">ω</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">2π · f</span>
          <span class="fml-comment">MCU (frecuencia f)</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   ACELERACIÓN ANGULAR   ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-gold">α</span>
        <div>
          <div class="fml-card-title">Aceleración angular</div>
          <div class="fml-card-sub">Tasa de cambio de ω</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">α = Δω / Δt</div>
        <div class="fml-eq-desc">Si α y ω tienen el mismo signo → giro acelera. Si tienen signos opuestos → giro desacelera.</div>
      </div>
    </div>

    <!-- ╔══════════════════════════╗ -->
    <!-- ║   VELOCIDAD TANGENCIAL  ║ -->
    <!-- ╚══════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-green">v</span>
        <div>
          <div class="fml-card-title">Rapidez lineal (tangencial)</div>
          <div class="fml-card-sub">Velocidad del punto en el borde</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">v = r · ω</div>
        <div class="fml-eq-desc">Un punto más alejado del centro tiene mayor velocidad tangencial aunque comparta la misma ω.</div>
      </div>

      <div class="fml-var-table">
        <div class="fml-var-row">
          <span class="fml-var-sym accent-green">v</span>
          <span class="fml-var-name">Vel. tangencial</span>
          <span class="fml-var-unit">m/s</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym">r</span>
          <span class="fml-var-name">Radio del punto</span>
          <span class="fml-var-unit">m</span>
        </div>
        <div class="fml-var-row">
          <span class="fml-var-sym accent-blue">ω</span>
          <span class="fml-var-name">Vel. angular</span>
          <span class="fml-var-unit">rad/s</span>
        </div>
      </div>
    </div>

    <!-- ╔══════════════════════════════╗ -->
    <!-- ║   ACELERACIÓN TANGENCIAL    ║ -->
    <!-- ╚══════════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-gold">aₜ</span>
        <div>
          <div class="fml-card-title">Aceleración tangencial</div>
          <div class="fml-card-sub">Cambio en la rapidez del punto (MCUV)</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">aₜ = r · α</div>
        <div class="fml-eq-desc">Solo existe cuando α ≠ 0. Apunta en la dirección tangencial (igual o contraria a v según α).</div>
      </div>
    </div>

    <!-- ╔══════════════════════════════╗ -->
    <!-- ║   ACELERACIÓN CENTRÍPETA    ║ -->
    <!-- ╚══════════════════════════════╝ -->
    <div class="fml-card">
      <div class="fml-card-header">
        <span class="fml-card-num fml-card-num-red">aᵣ</span>
        <div>
          <div class="fml-card-title">Aceleración centrípeta (radial)</div>
          <div class="fml-card-sub">Siempre apunta hacia el centro</div>
        </div>
      </div>

      <div class="fml-eq-block">
        <div class="fml-eq">aᵣ = ω² · r</div>
        <div class="fml-eq-desc">Existe incluso en MCU (α = 0). Cuadra con la fórmula v²/r del SIM 07 al sustituir v = r·ω.</div>
      </div>

      <div class="fml-row-group">
        <div class="fml-row">
          <span class="fml-sym accent-red">aᵣ</span>
          <span class="fml-op">=</span>
          <span class="fml-expr">v² / r</span>
          <span class="fml-comment">Equivalente</span>
        </div>
      </div>
    </div>

  </div><!-- /fml-grid -->


  <!-- ══ ECUACIONES CON α CONSTANTE (MRUA rotacional) ══ -->
  <div class="fml-section-title">Ecuaciones con α constante — análogas al MRUA</div>

  <div class="fml-mrua-wrap">

    <div class="fml-mrua-pair">
      <div class="fml-mrua-lineal">
        <div class="fml-mrua-tag">Lineal (SIM 04)</div>
        <div class="fml-mrua-eq">vₓ = v₀ₓ + aₓ · t</div>
      </div>
      <div class="fml-mrua-arrow">⟶</div>
      <div class="fml-mrua-rot">
        <div class="fml-mrua-tag fml-mrua-tag-rot">Rotacional</div>
        <div class="fml-mrua-eq fml-mrua-eq-rot">ω = ω₀ + α · t</div>
      </div>
    </div>

    <div class="fml-mrua-pair">
      <div class="fml-mrua-lineal">
        <div class="fml-mrua-tag">Lineal</div>
        <div class="fml-mrua-eq">x = x₀ + v₀t + ½aₓt²</div>
      </div>
      <div class="fml-mrua-arrow">⟶</div>
      <div class="fml-mrua-rot">
        <div class="fml-mrua-tag fml-mrua-tag-rot">Rotacional</div>
        <div class="fml-mrua-eq fml-mrua-eq-rot">θ = θ₀ + ω₀t + ½αt²</div>
      </div>
    </div>

    <div class="fml-mrua-pair">
      <div class="fml-mrua-lineal">
        <div class="fml-mrua-tag">Lineal</div>
        <div class="fml-mrua-eq">vₓ² = v₀ₓ² + 2aₓ(x−x₀)</div>
      </div>
      <div class="fml-mrua-arrow">⟶</div>
      <div class="fml-mrua-rot">
        <div class="fml-mrua-tag fml-mrua-tag-rot">Rotacional</div>
        <div class="fml-mrua-eq fml-mrua-eq-rot">ω² = ω₀² + 2α(θ−θ₀)</div>
      </div>
    </div>

    <div class="fml-mrua-pair">
      <div class="fml-mrua-lineal">
        <div class="fml-mrua-tag">Lineal</div>
        <div class="fml-mrua-eq">x−x₀ = ½(v₀ₓ + vₓ)t</div>
      </div>
      <div class="fml-mrua-arrow">⟶</div>
      <div class="fml-mrua-rot">
        <div class="fml-mrua-tag fml-mrua-tag-rot">Rotacional</div>
        <div class="fml-mrua-eq fml-mrua-eq-rot">θ−θ₀ = ½(ω₀ + ω)t</div>
      </div>
    </div>

  </div>


  <!-- ══ TABLA DE ANALOGÍAS LINEAL–ROTACIONAL ══ -->
  <div class="fml-section-title">Tabla de analogías</div>
  <div class="fml-analogy-wrap">

    <div class="fml-analogy-row fml-analogy-head">
      <span>Magnitud lineal</span>
      <span>Símbolo</span>
      <span>Magnitud rotacional</span>
      <span>Símbolo</span>
    </div>
    <div class="fml-analogy-row">
      <span>Posición</span>
      <span class="accent-tx">x</span>
      <span>Ángulo</span>
      <span class="accent-blue">θ</span>
    </div>
    <div class="fml-analogy-row">
      <span>Velocidad</span>
      <span class="accent-tx">v</span>
      <span>Vel. angular</span>
      <span class="accent-blue">ω</span>
    </div>
    <div class="fml-analogy-row">
      <span>Aceleración</span>
      <span class="accent-tx">a</span>
      <span>Acel. angular</span>
      <span class="accent-gold">α</span>
    </div>
    <div class="fml-analogy-row">
      <span>Masa</span>
      <span class="accent-tx">m</span>
      <span>Momento de inercia</span>
      <span class="accent-tx">I &nbsp; <span style="font-size:9px;color:#484f58">(SIM 12)</span></span>
    </div>
    <div class="fml-analogy-row">
      <span>Fuerza</span>
      <span class="accent-tx">F</span>
      <span>Torque</span>
      <span class="accent-tx">τ</span>
    </div>

  </div>


  <!-- ══ DIAGRAMA SVG: disco con vectores ══ -->
  <div class="fml-section-title">Vectores en el punto del borde</div>
  <div class="fml-dcl-wrap">
    <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg"
         class="fml-dcl-svg" aria-label="Disco con vectores de velocidad y aceleraciones">

      <!-- Círculo / disco -->
      <circle cx="210" cy="150" r="100" fill="#1c2d4a" stroke="#58a6ff" stroke-width="2"/>

      <!-- Sector θ (aprox 80°) -->
      <path d="M 210 150 L 210 50 A 100 100 0 0 1 308 111 Z"
            fill="rgba(88,166,255,0.1)" stroke="rgba(88,166,255,0.3)" stroke-width="1"/>
      <text x="244" y="90" fill="#58a6ff" font-family="Space Mono,monospace"
            font-size="11" font-weight="700">θ</text>

      <!-- Radio al punto (arriba a la derecha, ~60° desde vertical) -->
      <line x1="210" y1="150" x2="298" y2="58"
            stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-dasharray="5,4"/>

      <!-- Punto marcador en el borde -->
      <circle cx="298" cy="58" r="7" fill="#ffffff"/>

      <!-- v_tan (verde, tangente al punto, hacia arriba-izquierda aquí) -->
      <line x1="298" y1="58" x2="230" y2="18" stroke="#3fb950" stroke-width="2.5"/>
      <polygon points="226,14 238,22 230,32" fill="#3fb950"/>
      <text x="216" y="14" fill="#3fb950" font-family="Space Mono,monospace"
            font-size="11" font-weight="700" text-anchor="middle">v</text>

      <!-- a_tan (dorado, misma dirección que v en MCUV acelerado) -->
      <line x1="298" y1="58" x2="258" y2="24" stroke="#e3b341" stroke-width="2.5"
            stroke-dasharray="0"/>
      <polygon points="255,20 262,30 270,22" fill="#e3b341"/>
      <text x="280" y="20" fill="#e3b341" font-family="Space Mono,monospace"
            font-size="10" font-weight="700">aₜ</text>

      <!-- a_rad (rojo, hacia el centro) -->
      <line x1="298" y1="58" x2="240" y2="108" stroke="#f85149" stroke-width="2.5"/>
      <polygon points="237,112 245,100 254,108" fill="#f85149"/>
      <text x="318" y="70" fill="#f85149" font-family="Space Mono,monospace"
            font-size="10" font-weight="700">aᵣ</text>

      <!-- Flecha ω (arco curvo en el exterior del disco) -->
      <path d="M 210 35 A 115 115 0 0 1 340 182"
            fill="none" stroke="#58a6ff" stroke-width="2"/>
      <polygon points="343,186 330,180 337,169" fill="#58a6ff"/>
      <text x="352" y="148" fill="#58a6ff" font-family="Space Mono,monospace"
            font-size="11" font-weight="700">ω</text>

      <!-- Centro -->
      <circle cx="210" cy="150" r="5" fill="#58a6ff"/>

      <!-- Label R -->
      <text x="240" y="120" fill="#8b949e" font-family="Space Mono,monospace"
            font-size="10" font-style="italic">R</text>

    </svg>
  </div>

</div><!-- /formulas-wrap -->


<!-- ══ ESTILOS LOCALES DEL TAB FÓRMULAS SIM 11 ══ -->
<style>
.formulas-wrap {
  max-width: 960px; margin: 0 auto;
  padding: 28px 24px 48px; color: var(--tx1);
}
.fml-header { margin-bottom: 28px; }
.fml-title  { font-family: var(--font); font-size: 26px; font-weight: 800; color: var(--tx1); line-height: 1.1; }
.fml-subtitle { font-family: var(--mono); font-size: 11px; color: var(--tx3); margin-top: 5px; letter-spacing: .06em; }

.fml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px; margin-bottom: 36px;
}

.fml-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; padding: 16px;
}
.fml-card-accent { border-color: rgba(88,166,255,.28); background: rgba(88,166,255,.04); }

.fml-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 13px; }
.fml-card-num {
  width: 36px; height: 36px; border-radius: 6px; background: var(--input);
  border: 1px solid var(--border); font-family: var(--mono); font-size: 13px;
  font-weight: 700; color: var(--tx2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fml-card-num-accent { color: var(--accent); border-color: rgba(88,166,255,.3); background: rgba(88,166,255,.08); }
.fml-card-num-gold   { color: #e3b341; border-color: rgba(227,179,65,.3); background: rgba(227,179,65,.07); }
.fml-card-num-green  { color: #3fb950; border-color: rgba(63,185,80,.3); background: rgba(63,185,80,.07); }
.fml-card-num-red    { color: #f85149; border-color: rgba(248,81,73,.3); background: rgba(248,81,73,.07); }

.fml-card-title { font-family: var(--font); font-size: 13px; font-weight: 700; color: var(--tx1); }
.fml-card-sub   { font-family: var(--mono); font-size: 9px; color: var(--tx3); margin-top: 2px; letter-spacing: .05em; }

.fml-eq-block { margin-bottom: 12px; }
.fml-eq {
  font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--accent);
  background: rgba(88,166,255,.06); border: 1px solid rgba(88,166,255,.12);
  border-radius: 6px; padding: 8px 12px; margin-bottom: 7px;
}
.fml-eq-big   { font-size: 20px; }
.fml-eq-desc  { font-size: 11px; color: var(--tx2); line-height: 1.55; }
.fml-eq-desc em { color: var(--tx1); font-style: normal; font-weight: 600; }

.fml-row-group { display: flex; flex-direction: column; gap: 6px; }
.fml-row { display: flex; align-items: center; gap: 7px; font-family: var(--mono); font-size: 11px; }
.fml-sym     { font-weight: 700; min-width: 52px; }
.fml-op      { color: var(--tx3); }
.fml-expr    { color: var(--tx1); }
.fml-comment { color: var(--tx3); font-size: 9px; margin-left: auto; text-align: right; }

.fml-var-table { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.fml-var-row   { display: flex; align-items: center; gap: 8px; font-size: 10px; padding: 4px 8px; background: var(--input); border-radius: 4px; }
.fml-var-sym   { font-family: var(--mono); font-weight: 700; min-width: 24px; }
.fml-var-name  { flex: 1; color: var(--tx2); }
.fml-var-unit  { font-family: var(--mono); color: var(--tx3); font-size: 9px; }

.fml-section-title {
  font-family: var(--font); font-size: 13px; font-weight: 700;
  color: var(--tx2); text-transform: uppercase; letter-spacing: .1em;
  margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border);
}

/* ── Pares MRUA ── */
.fml-mrua-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.fml-mrua-pair {
  display: flex; align-items: center; gap: 10px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 6px; padding: 10px 14px;
}
.fml-mrua-lineal, .fml-mrua-rot { flex: 1; }
.fml-mrua-arrow { color: var(--tx3); font-size: 16px; flex-shrink: 0; }
.fml-mrua-tag   {
  font-family: var(--mono); font-size: 8px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em; color: var(--tx3); margin-bottom: 3px;
}
.fml-mrua-tag-rot { color: var(--accent); }
.fml-mrua-eq     { font-family: var(--mono); font-size: 11px; color: var(--tx2); }
.fml-mrua-eq-rot { color: var(--accent); font-weight: 700; }

/* ── Tabla analogías ── */
.fml-analogy-wrap { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.fml-analogy-row {
  display: grid; grid-template-columns: 1fr 60px 1fr 60px;
  gap: 8px; padding: 6px 12px; border-radius: 4px;
  font-size: 11px; font-family: var(--mono); color: var(--tx2);
}
.fml-analogy-row:nth-child(even) { background: rgba(48,54,61,.35); }
.fml-analogy-head {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: var(--tx3); background: transparent !important;
  margin-bottom: 4px;
}

/* Colores */
.accent-blue { color: var(--accent); }
.accent-gold { color: #e3b341; }
.accent-green{ color: #3fb950; }
.accent-red  { color: #f85149; }
.accent-tx   { color: var(--tx1); }

/* ── DCL SVG ── */
.fml-dcl-wrap {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; padding: 16px;
  display: flex; justify-content: center;
}
.fml-dcl-svg { width: 100%; max-width: 460px; height: auto; }
</style>