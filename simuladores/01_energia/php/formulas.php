<?php
// ============================================================
//  formulas.php  —  Tab de referencia de fórmulas del profesor
// ============================================================
?>
<div class="formulas-page">

  <div class="fp-header">
    <h2>Fórmulas del Curso</h2>
    <p>Trabajo, Potencia y Energía — solo las fórmulas de tu profesor</p>
  </div>

  <div class="fp-grid">

    <div class="fp-card" style="--accent-card: #388bfd">
      <div class="fp-card-tag">Energía Potencial</div>
      <div class="fp-eq">U = m · g · h</div>
      <div class="fp-vars">
        <span><b>U</b> = Energía potencial (J)</span>
        <span><b>m</b> = Masa (kg)</span>
        <span><b>g</b> = Gravedad (m/s²)</span>
        <span><b>h</b> = Altura (m)</span>
      </div>
      <div class="fp-note">La energía almacenada por la posición del objeto.</div>
    </div>

    <div class="fp-card" style="--accent-card: #3fb950">
      <div class="fp-card-tag">Energía Cinética</div>
      <div class="fp-eq">K = ½ · m · v²</div>
      <div class="fp-vars">
        <span><b>K</b> = Energía cinética (J)</span>
        <span><b>m</b> = Masa (kg)</span>
        <span><b>v</b> = Velocidad (m/s)</span>
      </div>
      <div class="fp-note">La energía del objeto por estar en movimiento.</div>
    </div>

    <div class="fp-card" style="--accent-card: #e3b341">
      <div class="fp-card-tag">Conservación de Energía</div>
      <div class="fp-eq">E = K + U</div>
      <div class="fp-vars">
        <span><b>E</b> = Energía total (J)</span>
        <span><b>K</b> = Energía cinética (J)</span>
        <span><b>U</b> = Energía potencial (J)</span>
      </div>
      <div class="fp-eq-alt">K₁ + U₁ = K₂ + U₂</div>
      <div class="fp-note">Sin fricción, la energía total no cambia.</div>
    </div>

    <div class="fp-card" style="--accent-card: #f0883e">
      <div class="fp-card-tag">Potencia</div>
      <div class="fp-eq">P = W / t</div>
      <div class="fp-vars">
        <span><b>P</b> = Potencia (W)</span>
        <span><b>W</b> = Trabajo (J)</span>
        <span><b>t</b> = Tiempo (s)</span>
      </div>
      <div class="fp-eq-alt">P = F · v</div>
      <div class="fp-note">Rapidez con que se realiza el trabajo.</div>
    </div>

    <div class="fp-card" style="--accent-card: #f85149">
      <div class="fp-card-tag">Trabajo de la Gravedad</div>
      <div class="fp-eq">W_grav = −ΔU</div>
      <div class="fp-vars">
        <span><b>W_grav</b> = Trabajo de la gravedad (J)</span>
        <span><b>ΔU</b> = Cambio en energía potencial (J)</span>
      </div>
      <div class="fp-note">Si el objeto baja, W_grav &gt; 0. Si sube, W_grav &lt; 0.</div>
    </div>

    <div class="fp-card" style="--accent-card: #bc8cff">
      <div class="fp-card-tag">Con otras fuerzas</div>
      <div class="fp-eq-sm">K₁ + U₁ + W_otras = K₂ + U₂</div>
      <div class="fp-vars">
        <span><b>W_otras</b> = Trabajo de fuerzas externas (J)</span>
      </div>
      <div class="fp-note">Cuando actúa fricción u otras fuerzas.</div>
    </div>

  </div>
</div>
