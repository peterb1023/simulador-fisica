<?php /* Contenido pedagógico; cálculos en js/engine.js. */ ?>
<div class="formulas-page"><div class="fp-header"><h2>Proyectiles</h2></div><div class="fp-grid">
<div class="fp-card"><div class="fp-card-tag">Componentes iniciales</div><div class="fp-eq">v₀x = v₀ cos θ; v₀y = v₀ sen θ</div><div class="fp-note">Velocidades en m/s; θ en grados en los controles.</div></div>
<div class="fp-card"><div class="fp-card-tag">Posición</div><div class="fp-eq">x(t) = x₀ + v₀x t; y(t) = y₀ + v₀y t − ½gt²</div><div class="fp-note">El motor fija x₀=0 m y g=9.8 m/s²; sin resistencia del aire.</div></div>
<div class="fp-card"><div class="fp-card-tag">Velocidad</div><div class="fp-eq">vx = v₀x; vy(t) = v₀y − gt</div><div class="fp-note">Aceleración vertical −g; tiempo en segundos.</div></div>
<div class="fp-card"><div class="fp-card-tag">Punto máximo</div><div class="fp-eq">t_top = v₀y/g; h_max = y₀ + v₀y²/(2g)</div><div class="fp-note">Para lanzamiento ascendente. Si v₀y≤0, el máximo durante el vuelo es y₀ en t=0.</div></div>
<div class="fp-card"><div class="fp-card-tag">Tiempo de vuelo</div><div class="fp-eq">t_v = (v₀y + √(v₀y² + 2gy₀))/g</div><div class="fp-note">Raíz no negativa de y(t)=0; válida también si y₀≠0, con y₀≥0.</div></div>
<div class="fp-card"><div class="fp-card-tag">Alcance</div><div class="fp-eq">R = v₀x t_v</div><div class="fp-note">Desplazamiento horizontal hasta tocar y=0; metros.</div></div>
<div class="fp-card"><div class="fp-card-tag">Trayectoria</div><div class="fp-eq">y(x) = y₀ + (v₀y/v₀x)(x−x₀) − g(x−x₀)²/(2v₀x²)</div><div class="fp-note">Solo si v₀x≠0. Para tiro vertical se usan x(t), y(t).</div></div>
</div></div>
