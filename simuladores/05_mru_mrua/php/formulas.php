<?php
// ============================================================
//  FORMULAS — Tab con las ecuaciones de MRU y MRUA
// ============================================================
?>
<div class="formulas-tab">

  <section class="formula-section">
    <h2 class="formula-heading" style="color:#58a6ff">MRU — Movimiento Rectilíneo Uniforme</h2>
    <p class="formula-desc">La aceleración es cero. La velocidad permanece constante en el tiempo.</p>

    <div class="formula-card">
      <div class="formula-name">Posición</div>
      <div class="formula-eq">x(t) = x₀ + v · t</div>
      <div class="formula-vars">
        <span><b>x(t)</b> posición en el instante t [m]</span>
        <span><b>x₀</b> posición inicial [m]</span>
        <span><b>v</b> velocidad constante [m/s]</span>
        <span><b>t</b> tiempo [s]</span>
      </div>
    </div>

    <div class="formula-card">
      <div class="formula-name">Velocidad</div>
      <div class="formula-eq">v(t) = v = constante &nbsp;(a = 0)</div>
    </div>
  </section>

  <section class="formula-section">
    <h2 class="formula-heading" style="color:#f0883e">MRUA — Movimiento Rectilíneo Uniformemente Acelerado</h2>
    <p class="formula-desc">La aceleración es constante y distinta de cero. La velocidad cambia linealmente.</p>

    <div class="formula-card">
      <div class="formula-name">Velocidad</div>
      <div class="formula-eq">v(t) = v₀ + a · t</div>
      <div class="formula-vars">
        <span><b>v(t)</b> velocidad en el instante t [m/s]</span>
        <span><b>v₀</b> velocidad inicial [m/s]</span>
        <span><b>a</b> aceleración constante [m/s²]</span>
      </div>
    </div>

    <div class="formula-card">
      <div class="formula-name">Posición</div>
      <div class="formula-eq">x(t) = x₀ + v₀ · t + ½ · a · t²</div>
    </div>

    <div class="formula-card">
      <div class="formula-name">Relación v² (sin tiempo)</div>
      <div class="formula-eq">v² = v₀² + 2 · a · (x − x₀)</div>
    </div>
  </section>

  <section class="formula-section">
    <h2 class="formula-heading">Caída libre</h2>
    <p class="formula-desc">Caso especial de MRUA con a = g = <?= GRAVITY ?> m/s² (hacia abajo).</p>
    <div class="formula-card">
      <div class="formula-eq">y(t) = y₀ + v₀ · t + ½ · g · t²</div>
    </div>
  </section>

</div>

<style>
.formulas-tab{padding:16px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;height:100%}
.formula-section{display:flex;flex-direction:column;gap:8px}
.formula-heading{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.formula-desc{font-size:11px;color:var(--tx2);line-height:1.5}
.formula-card{background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px;display:flex;flex-direction:column;gap:4px}
.formula-name{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tx3)}
.formula-eq{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--tx1)}
.formula-vars{display:flex;flex-direction:column;gap:2px;margin-top:4px}
.formula-vars span{font-size:10px;color:var(--tx2)}
.formula-vars b{color:var(--tx1)}
</style>


