<?php /* formulas.php — SIM 09 · Trabajo */ ?>

<div class="formulas-page">

  <div class="fp-header">
    <h2>Trabajo</h2>
    <p>Semana 9 · Trabajo, producto punto y teorema trabajo-energía</p>
  </div>

  <div class="fp-grid">

    <!-- W = Fs -->
    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Trabajo (fuerza paralela)</div>
      <div class="fp-eq">W = F·s</div>
      <div class="fp-vars">
        <span><b>W</b> — trabajo (J = N·m)</span>
        <span><b>F</b> — magnitud de la fuerza (N)</span>
        <span><b>s</b> — magnitud del desplazamiento (m)</span>
      </div>
      <div class="fp-note">Caso especial cuando la fuerza es paralela al desplazamiento (φ = 0°). El trabajo es máximo en esta condición.</div>
    </div>

    <!-- W = Fs cosφ -->
    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Trabajo con ángulo</div>
      <div class="fp-eq">W = F·s·cosφ</div>
      <div class="fp-vars">
        <span><b>W</b> — trabajo (J)</span>
        <span><b>F</b> — magnitud de la fuerza (N)</span>
        <span><b>s</b> — desplazamiento (m)</span>
        <span><b>φ</b> — ángulo entre F⃗ y s⃗ (°)</span>
      </div>
      <div class="fp-note">Fórmula general. Solo la componente de la fuerza en la dirección del desplazamiento realiza trabajo. Si φ = 90°, W = 0.</div>
    </div>

    <!-- Producto punto -->
    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Trabajo — producto punto</div>
      <div class="fp-eq">W = F⃗ · s⃗</div>
      <div class="fp-vars">
        <span><b>W</b> — trabajo (J)</span>
        <span><b>F⃗</b> — vector fuerza (N)</span>
        <span><b>s⃗</b> — vector desplazamiento (m)</span>
      </div>
      <div class="fp-note">Notación vectorial. El producto punto es un escalar. Se expande como Fₓ·sₓ + Fy·sy en 2D.</div>
    </div>

    <!-- Teorema trabajo-energía -->
    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Teorema trabajo-energía</div>
      <div class="fp-eq" style="font-size:16px">W<sub>tot</sub> = ΔK = K₂ − K₁</div>
      <div class="fp-vars">
        <span><b>W<sub>tot</sub></b> — trabajo total de todas las fuerzas (J)</span>
        <span><b>K₁</b> — energía cinética inicial = ½mv₀² (J)</span>
        <span><b>K₂</b> — energía cinética final = ½mv² (J)</span>
      </div>
      <div class="fp-note">El trabajo neto realizado sobre un objeto es igual al cambio en su energía cinética. Relaciona fuerzas con cambios de rapidez.</div>
    </div>

    <!-- Energía cinética -->
    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Energía cinética</div>
      <div class="fp-eq">K = ½·m·v²</div>
      <div class="fp-vars">
        <span><b>K</b> — energía cinética (J)</span>
        <span><b>m</b> — masa (kg)</span>
        <span><b>v</b> — rapidez (m/s)</span>
      </div>
      <div class="fp-note">Energía asociada al movimiento de un objeto. Siempre positiva. Se cuadruplica si v se duplica (relación cuadrática).</div>
    </div>

    <!-- Resorte [AGREGADA] -->
    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Trabajo externo sobre el resorte <span style="font-size:9px;background:rgba(227,179,65,.15);padding:2px 6px;border-radius:4px;margin-left:4px">[AGREGADA]</span></div>
      <div class="fp-eq" style="font-size:16px">W_ext = ΔU = ½kx₂² − ½kx₁²</div>
      <div class="fp-vars">
        <span><b>W</b> — trabajo externo cuasiestático (J)</span>
        <span><b>k</b> — constante del resorte (N/m)</span>
        <span><b>x₁, x₂</b> — elongaciones inicial y final (m)</span>
      </div>
      <div class="fp-note">Estiramiento cuasiestático: F_ext=kx y F_resorte=−kx. W_ext=ΔU; W_resorte=−ΔU y ΔK=0. La animación ilustra el desplazamiento, no una aceleración.</div>
    </div>

    <!-- Trabajo de la gravedad [AGREGADA referencia] -->
    <div class="fp-card" style="--accent-card:#f85149; grid-column: span 2">
      <div class="fp-card-tag">Resumen de signos de W</div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px">
        <div>
          <div class="fp-eq-sm" style="color:#3fb950">W &gt; 0</div>
          <div class="fp-note">φ entre 0° y 90°. La fuerza tiene componente en la dirección del movimiento. El objeto <b>acelera</b>.</div>
        </div>
        <div>
          <div class="fp-eq-sm" style="color:#8b949e">W = 0</div>
          <div class="fp-note">φ = 90°. La fuerza es perpendicular al desplazamiento. No hay transferencia de energía (ej: fuerza normal, movimiento circular).</div>
        </div>
        <div>
          <div class="fp-eq-sm" style="color:#f85149">W &lt; 0</div>
          <div class="fp-note">φ entre 90° y 180°. La fuerza se opone al movimiento (ej: fricción, freno). El objeto <b>desacelera</b>.</div>
        </div>
      </div>
    </div>

  </div><!-- /.fp-grid -->

  <!-- Tabla resumen -->
  <div style="margin-top:28px">
    <div class="res-title" style="margin-bottom:14px">Tabla resumen — casos especiales</div>
    <table style="width:100%; border-collapse:collapse; font-size:12px">
      <thead>
        <tr style="border-bottom:1px solid var(--border)">
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Situación</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">φ</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">cosφ</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Resultado</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx2)">Fuerza paralela al movimiento</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--ec)">0°</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--ec)">1</td>
          <td style="padding:8px 12px; color:var(--tx2)">W = F·s (máximo positivo)</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx2)">Fuerza perpendicular (normal)</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--tx2)">90°</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--tx2)">0</td>
          <td style="padding:8px 12px; color:var(--tx2)">W = 0</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx2)">Fuerza contraria al movimiento</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--accent)">180°</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--accent)">−1</td>
          <td style="padding:8px 12px; color:var(--tx2)">W = −F·s (fricción)</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; color:var(--tx2)">Fuerza en ángulo general</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--et)">φ</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--et)">cosφ</td>
          <td style="padding:8px 12px; color:var(--tx2)">W = F·s·cosφ</td>
        </tr>
      </tbody>
    </table>
  </div>

</div><!-- /.formulas-page -->