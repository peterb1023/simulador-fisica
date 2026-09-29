<?php
// ============================================================
//  formulas.php  —  Tab de referencia de vectores
// ============================================================
?>
<div class="formulas-page">

  <div class="fp-header">
    <h2>Fórmulas del Curso</h2>
    <p>Vectores — Forma cartesiana, polar y operaciones</p>
  </div>

  <div class="fp-grid">

    <div class="fp-card" style="--accent-card:#388bfd">
      <div class="fp-card-tag">Forma Cartesiana</div>
      <div class="fp-eq">V = (Vx, Vy)</div>
      <div class="fp-eq-sm">V = Vx·î + Vy·ĵ</div>
      <div class="fp-vars">
        <span><b>Vx</b> = componente horizontal</span>
        <span><b>Vy</b> = componente vertical</span>
        <span><b>î, ĵ</b> = vectores unitarios</span>
      </div>
      <div class="fp-note">Descomposición del vector en sus componentes ortogonales.</div>
    </div>

    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Polares → Cartesianas</div>
      <div class="fp-eq">Vx = r·cosθ</div>
      <div class="fp-eq">Vy = r·senθ</div>
      <div class="fp-vars">
        <span><b>r</b> = magnitud del vector</span>
        <span><b>θ</b> = ángulo respecto al eje x (°)</span>
      </div>
      <div class="fp-note">Conversión de forma polar a componentes rectangulares.</div>
    </div>

    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Magnitud y Ángulo</div>
      <div class="fp-eq">r = √(Vx²+Vy²)</div>
      <div class="fp-eq">θ = tan⁻¹(Vy/Vx)</div>
      <div class="fp-vars">
        <span><b>r</b> = longitud del vector (siempre ≥ 0)</span>
        <span><b>θ</b> = dirección en grados</span>
      </div>
      <div class="fp-note">Conversión de cartesianas a forma polar. Cuidado con el cuadrante de θ.</div>
    </div>

    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Suma de Vectores</div>
      <div class="fp-eq">Rx = ΣVx</div>
      <div class="fp-eq">Ry = ΣVy</div>
      <div class="fp-eq-sm">R = √(Rx²+Ry²)</div>
      <div class="fp-vars">
        <span><b>Rx</b> = suma de todas las componentes x</span>
        <span><b>Ry</b> = suma de todas las componentes y</span>
        <span><b>R</b> = magnitud de la resultante</span>
      </div>
      <div class="fp-note">Método de componentes: suma por eje y reconstruye la resultante.</div>
    </div>

    <div class="fp-card" style="--accent-card:#f0883e">
      <div class="fp-card-tag">Ley del Coseno</div>
      <div class="fp-eq-sm">R = √(A²+B²+2AB·cosθ)</div>
      <div class="fp-vars">
        <span><b>A, B</b> = magnitudes de los vectores</span>
        <span><b>θ</b> = ángulo entre A y B</span>
        <span><b>R</b> = magnitud de la resultante</span>
      </div>
      <div class="fp-note">Para la suma de exactamente 2 vectores sin descomponer en componentes.</div>
    </div>

    <div class="fp-card" style="--accent-card:#f85149">
      <div class="fp-card-tag">Ley del Seno</div>
      <div class="fp-eq-sm">A/senα = B/senβ = R/senθ</div>
      <div class="fp-vars">
        <span><b>α</b> = ángulo opuesto al vector A</span>
        <span><b>β</b> = ángulo opuesto al vector B</span>
        <span><b>θ</b> = ángulo opuesto a la resultante R</span>
      </div>
      <div class="fp-note">Para encontrar ángulos del triángulo vectorial cuando se conocen lados y ángulos.</div>
    </div>

  </div>
</div>
<section class="fp-card"><h3>Productos en 2D</h3><p>A·B = AxBx + AyBy = |A||B|cos θ (escalar).</p><p>A×B = (0,0,AxBy−AyBx). Se muestra su componente z; orientación según la regla de la mano derecha. Si A y B tienen unidades u, ambos productos tienen unidades u²; en general se multiplican las unidades de cada vector.</p></section>