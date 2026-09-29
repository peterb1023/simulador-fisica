<?php
// ============================================================
//  formulas.php  —  Tab "Fórmulas" SIM 07: Movimiento Circular
// ============================================================
?>
<div class="formulas-wrap">

  <div class="f-header">
    <div class="f-sim-badge">SIM #07</div>
    <h2 class="f-title">Movimiento Circular — Fórmulas del profesor</h2>
    <p class="f-sub">Movimiento circular · Semana 6 &nbsp;·&nbsp; MCU y MCUV</p>
  </div>

  <!-- ══ SECCIÓN 1: Velocidad en MCU ══ -->
  <section class="f-section">
    <div class="f-section-title">1. Velocidad en MCU (rapidez constante)</div>
    <div class="f-cards">

      <div class="f-card">
        <div class="f-formula accent-blue">v = 2πR / T</div>
        <div class="f-desc">
          La rapidez lineal en movimiento circular uniforme. El objeto recorre la circunferencia completa (2πR) en un período T.
        </div>
        <div class="f-vars">
          <span class="var-item"><b>v</b> — rapidez lineal (m/s)</span>
          <span class="var-item"><b>R</b> — radio de la trayectoria (m)</span>
          <span class="var-item"><b>T</b> — período, tiempo de una vuelta completa (s)</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-formula accent-gold">T = 2πR / v &nbsp;&nbsp; f = 1 / T</div>
        <div class="f-desc">
          Despejando T de la fórmula anterior. La <strong>frecuencia</strong> f indica cuántas vueltas completas ocurren por segundo (Hz).
        </div>
        <div class="f-vars">
          <span class="var-item"><b>T</b> — período (s)</span>
          <span class="var-item"><b>f</b> — frecuencia (Hz = vueltas/s)</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SECCIÓN 2: Aceleración centrípeta ══ -->
  <section class="f-section">
    <div class="f-section-title">2. Aceleración centrípeta (radial)</div>
    <div class="f-cards">

      <div class="f-card f-card-highlight-red">
        <div class="f-formula accent-red">arad = v² / R</div>
        <div class="f-desc">
          Aunque la rapidez sea constante, la <strong>dirección</strong> de la velocidad cambia continuamente. Eso produce una aceleración que siempre apunta hacia el <strong>centro</strong> del círculo.
        </div>
        <div class="f-vars">
          <span class="var-item"><b>arad</b> — aceleración centrípeta (m/s²)</span>
          <span class="var-item"><b>v</b> — rapidez lineal (m/s)</span>
          <span class="var-item"><b>R</b> — radio (m)</span>
          <span class="var-item">Dirección: siempre hacia el centro (−r̂)</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-formula accent-red">arad = 4π²R / T²</div>
        <div class="f-desc">
          La misma aceleración centrípeta expresada en función del período T. Se obtiene sustituyendo v = 2πR/T en arad = v²/R.
        </div>
        <div class="f-derivation">
          <span class="deriv-step">1. v = 2πR/T → v² = 4π²R²/T²</span>
          <span class="deriv-step">2. arad = v²/R = (4π²R²/T²) / R</span>
          <span class="deriv-step">3. arad = 4π²R / T²  ✓</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SECCIÓN 3: Aceleración tangencial ══ -->
  <section class="f-section">
    <div class="f-section-title">3. Aceleración tangencial — MCUV</div>
    <div class="f-cards f-cards-full">

      <div class="f-card f-card-highlight-green">
        <div class="f-formula accent-green">atan = d|v⃗| / dt</div>
        <div class="f-desc">
          En el <strong>movimiento circular uniformemente variado (MCUV)</strong> la rapidez <em>sí cambia</em>. La aceleración tangencial mide esa tasa de cambio. Su dirección es siempre <strong>tangente</strong> al círculo.
          <br><br>
          Cuando <strong>atan = 0</strong> → MCU puro (rapidez constante).<br>
          Cuando <strong>atan ≠ 0</strong> → MCUV (el objeto acelera o desacelera en la trayectoria).
        </div>
        <div class="f-vars">
          <span class="var-item"><b>atan</b> — aceleración tangencial (m/s²)</span>
          <span class="var-item">Dirección: tangente al círculo, mismo sentido que v si acelera</span>
          <span class="var-item">Dirección: tangente al círculo, sentido contrario a v si desacelera</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SECCIÓN 4: Variables angulares (agregadas para el canvas) ══ -->
  <section class="f-section">
    <div class="f-section-title">4. Variables angulares <span class="badge-agr">[enriquecidas]</span></div>
    <div class="f-cards f-cards-3">

      <div class="f-card">
        <div class="f-label">Velocidad angular</div>
        <div class="f-formula accent-blue" style="font-size:14px">ω = v / R</div>
        <div class="f-desc">Rapidez de giro en radianes por segundo. Relaciona la velocidad lineal con el radio.</div>
        <div class="f-vars">
          <span class="var-item"><b>ω</b> — velocidad angular (rad/s)</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-label">Período desde ω</div>
        <div class="f-formula accent-gold" style="font-size:14px">T = 2π / ω</div>
        <div class="f-desc">Una vuelta completa equivale a 2π radianes. El período es el tiempo que tarda en recorrerlos.</div>
      </div>

      <div class="f-card">
        <div class="f-label">Aceleración total</div>
        <div class="f-formula" style="font-size:13px; color:var(--tx1)">|a| = √(arad² + atan²)</div>
        <div class="f-desc">Cuando existe atan, la aceleración total combina la centrípeta y la tangencial (perpendiculares entre sí).</div>
      </div>

    </div>
  </section>

  <!-- ══ Tabla resumen ══ -->
  <section class="f-section">
    <div class="f-section-title">Resumen rápido</div>
    <div class="f-summary-table">
      <div class="fst-row fst-head">
        <span>Variable</span><span>Fórmula</span><span>Notas</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-blue">v</span>
        <span class="fst-f mono">2πR / T</span>
        <span class="fst-n">Rapidez lineal en MCU</span>
      </div>
      <div class="fst-row fst-highlight">
        <span class="fst-var accent-red">arad</span>
        <span class="fst-f mono">v² / R = 4π²R / T²</span>
        <span class="fst-n">Siempre apunta al centro</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-green">atan</span>
        <span class="fst-f mono">d|v| / dt</span>
        <span class="fst-n">0 en MCU · ≠ 0 en MCUV</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-gold">T</span>
        <span class="fst-f mono">2πR / v</span>
        <span class="fst-n">Período (s por vuelta)</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-gold">f</span>
        <span class="fst-f mono">1 / T</span>
        <span class="fst-n">Frecuencia (Hz)</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-blue">ω</span>
        <span class="fst-f mono">v / R = 2π / T</span>
        <span class="fst-n">Velocidad angular (rad/s)</span>
      </div>
    </div>
  </section>

</div>

<style>
.formulas-wrap {
  max-width: 900px; margin: 0 auto;
  padding: 28px 24px 60px; color: var(--tx1);
}
.f-header { margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
.f-sim-badge {
  display: inline-block; font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: .1em; color: var(--accent);
  background: rgba(88,166,255,.1); border: 1px solid rgba(88,166,255,.25);
  border-radius: 4px; padding: 2px 9px; margin-bottom: 8px;
}
.f-title { font-family: var(--font); font-size: 22px; font-weight: 800; color: var(--tx1); margin: 0 0 4px; }
.f-sub   { font-size: 12px; color: var(--tx3); margin: 0; }

.f-section { margin-bottom: 32px; }
.f-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .1em; color: var(--tx3);
  border-left: 3px solid var(--accent); padding-left: 10px; margin-bottom: 14px;
}
.badge-agr {
  font-size: 9px; font-weight: 600; color: var(--et);
  background: rgba(227,179,65,.08); border: 1px solid rgba(227,179,65,.2);
  border-radius: 3px; padding: 1px 6px; text-transform: none; letter-spacing: 0;
  margin-left: 6px;
}

.f-cards      { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f-cards-3    { grid-template-columns: 1fr 1fr 1fr; }
.f-cards-full { grid-template-columns: 1fr; }

.f-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 16px 18px;
}
.f-card-highlight-red   { border-left: 3px solid #f85149; }
.f-card-highlight-green { border-left: 3px solid #3fb950; }

.f-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--tx3); margin-bottom: 8px; }
.f-formula { font-family: var(--mono); font-size: 16px; font-weight: 700; margin-bottom: 10px; line-height: 1.5; }
.f-formula.accent-blue  { color: #58a6ff; }
.f-formula.accent-red   { color: #f85149; }
.f-formula.accent-green { color: #3fb950; }
.f-formula.accent-gold  { color: var(--et); }

.f-desc { font-size: 12px; color: var(--tx2); line-height: 1.6; margin-bottom: 10px; }
.f-desc strong { color: var(--tx1); }
.f-desc em     { color: var(--et); font-style: normal; font-weight: 600; }

.f-vars { display: flex; flex-direction: column; gap: 3px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.var-item { font-family: var(--mono); font-size: 10px; color: var(--tx3); }
.var-item b { color: var(--tx2); }

.f-derivation {
  display: flex; flex-direction: column; gap: 4px;
  background: var(--input); border-radius: 4px; padding: 10px 12px; margin: 10px 0;
}
.deriv-step { font-family: var(--mono); font-size: 10px; color: var(--tx2); line-height: 1.6; }

.f-summary-table { border: 1px solid var(--border); border-radius: var(--rs); overflow: hidden; }
.fst-row {
  display: grid; grid-template-columns: 100px 1fr 1fr; gap: 12px;
  padding: 9px 14px; border-bottom: 1px solid var(--border);
  font-size: 12px; align-items: center;
}
.fst-row:last-child { border-bottom: none; }
.fst-head { background: var(--card); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--tx3); }
.fst-highlight { background: rgba(248,81,73,.04); }
.fst-var { font-family: var(--mono); font-weight: 700; }
.fst-f   { font-family: var(--mono); font-size: 11px; color: var(--tx1); }
.fst-n   { font-size: 11px; color: var(--tx3); }
.mono    { font-family: var(--mono); }

.accent-blue  { color: #58a6ff; }
.accent-red   { color: #f85149; }
.accent-green { color: #3fb950; }
.accent-gold  { color: var(--et); }
</style>
<p class="fp-note">MCUV: v_t=v₀+a_t t es una componente tangencial con signo; puede detenerse y cambiar de sentido. θ=(v₀t+½a_t t²)/R. La rapidez es |v_t| y T=2πR/|v_t| es un período instantáneo; solo es el tiempo de una vuelta completa cuando a_t=0. En reposo T no es finito y f=0.</p>