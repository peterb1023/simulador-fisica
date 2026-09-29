<?php /* formulas.php — SIM 04 · Cinemática 1D */ ?>

<div class="formulas-page">

  <div class="fp-header">
    <h2>Cinemática 1D</h2>
    <p>Semana 3 · Movimiento rectilíneo con aceleración constante y caída libre</p>
  </div>

  <div class="fp-grid">

    <!-- Velocidad media -->
    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Velocidad media</div>
      <div class="fp-eq">v<sub>med</sub> = Δx / Δt</div>
      <div class="fp-vars">
        <span><b>v<sub>med</sub></b> — velocidad media (m/s)</span>
        <span><b>Δx</b> — desplazamiento (m)</span>
        <span><b>Δt</b> — intervalo de tiempo (s)</span>
      </div>
      <div class="fp-note">Razón entre el desplazamiento total y el tiempo transcurrido. No depende de la trayectoria.</div>
    </div>

    <!-- Aceleración media -->
    <div class="fp-card" style="--accent-card:#58a6ff">
      <div class="fp-card-tag">Aceleración media</div>
      <div class="fp-eq">a<sub>med</sub> = Δv<sub>x</sub> / Δt</div>
      <div class="fp-vars">
        <span><b>a<sub>med</sub></b> — aceleración media (m/s²)</span>
        <span><b>Δv<sub>x</sub></b> — cambio de velocidad (m/s)</span>
        <span><b>Δt</b> — intervalo de tiempo (s)</span>
      </div>
      <div class="fp-note">Tasa de cambio de la velocidad en el tiempo. Positiva si el objeto acelera en +x.</div>
    </div>

    <!-- vx = v0 + at -->
    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Velocidad en función del tiempo</div>
      <div class="fp-eq">v<sub>x</sub> = v<sub>0x</sub> + a<sub>x</sub>·t</div>
      <div class="fp-vars">
        <span><b>v<sub>x</sub></b> — velocidad en t (m/s)</span>
        <span><b>v<sub>0x</sub></b> — velocidad inicial (m/s)</span>
        <span><b>a<sub>x</sub></b> — aceleración constante (m/s²)</span>
        <span><b>t</b> — tiempo (s)</span>
      </div>
      <div class="fp-note">Primera ecuación del MRUA. La gráfica v(t) es una recta con pendiente a<sub>x</sub>.</div>
    </div>

    <!-- x = x0 + v0t + ½at² -->
    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Posición en función del tiempo</div>
      <div class="fp-eq" style="font-size:16px">x = x<sub>0</sub> + v<sub>0x</sub>·t + ½·a<sub>x</sub>·t²</div>
      <div class="fp-vars">
        <span><b>x</b> — posición en t (m)</span>
        <span><b>x<sub>0</sub></b> — posición inicial (m)</span>
        <span><b>v<sub>0x</sub></b> — velocidad inicial (m/s)</span>
        <span><b>a<sub>x</sub></b> — aceleración (m/s²)</span>
        <span><b>t</b> — tiempo (s)</span>
      </div>
      <div class="fp-note">Segunda ecuación del MRUA. La gráfica x(t) es una parábola cuando a ≠ 0.</div>
    </div>

    <!-- vx² = v0² + 2a(x-x0) -->
    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Velocidad sin tiempo</div>
      <div class="fp-eq" style="font-size:16px">v<sub>x</sub>² = v<sub>0x</sub>² + 2·a<sub>x</sub>·(x − x<sub>0</sub>)</div>
      <div class="fp-vars">
        <span><b>v<sub>x</sub></b> — velocidad en x (m/s)</span>
        <span><b>v<sub>0x</sub></b> — velocidad inicial (m/s)</span>
        <span><b>a<sub>x</sub></b> — aceleración (m/s²)</span>
        <span><b>x − x<sub>0</sub></b> — desplazamiento (m)</span>
      </div>
      <div class="fp-note">Útil cuando no se conoce t. Se obtiene eliminando t entre las dos ecuaciones anteriores.</div>
    </div>

    <!-- x - x0 = ½(v0 + vx)t -->
    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Desplazamiento por velocidades</div>
      <div class="fp-eq" style="font-size:16px">x − x<sub>0</sub> = ½·(v<sub>0x</sub> + v<sub>x</sub>)·t</div>
      <div class="fp-vars">
        <span><b>x − x<sub>0</sub></b> — desplazamiento (m)</span>
        <span><b>v<sub>0x</sub></b> — velocidad inicial (m/s)</span>
        <span><b>v<sub>x</sub></b> — velocidad final (m/s)</span>
        <span><b>t</b> — tiempo (s)</span>
      </div>
      <div class="fp-note">El desplazamiento es el área del trapecio bajo la gráfica v(t). No requiere conocer a.</div>
    </div>

    <!-- Caída libre -->
    <div class="fp-card" style="--accent-card:#f85149; grid-column: span 2">
      <div class="fp-card-tag">Caída libre</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
        <div>
          <div class="fp-eq">g = 9.8 m/s²</div>
          <div class="fp-vars">
            <span><b>g</b> — aceleración gravitacional (hacia abajo)</span>
          </div>
          <div class="fp-note">
            En caída libre a<sub>x</sub> = g = 9.8 m/s². Las mismas cuatro ecuaciones del MRUA aplican
            sustituyendo a → g.<br><br>
            Convención: positivo hacia abajo → a = +9.8 m/s²<br>
            Si positivo hacia arriba → a = −9.8 m/s²
          </div>
        </div>
        <div>
          <div class="fp-eq-sm" style="margin-bottom:10px">Ecuaciones aplicadas:</div>
          <div style="font-family:var(--mono); font-size:11px; color:var(--tx2); line-height:2">
            v<sub>y</sub> = v<sub>0y</sub> + g·t<br>
            y = y<sub>0</sub> + v<sub>0y</sub>·t + ½·g·t²<br>
            v<sub>y</sub>² = v<sub>0y</sub>² + 2·g·(y − y<sub>0</sub>)<br>
            y − y<sub>0</sub> = ½·(v<sub>0y</sub> + v<sub>y</sub>)·t
          </div>
        </div>
      </div>
    </div>

  </div><!-- /.fp-grid -->

  <!-- Tabla resumen -->
  <div style="margin-top:28px">
    <div class="res-title" style="margin-bottom:14px">Tabla resumen — ¿cuándo usar cada ecuación?</div>
    <table style="width:100%; border-collapse:collapse; font-size:12px">
      <thead>
        <tr style="border-bottom:1px solid var(--border)">
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Ecuación</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Conoces</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Encuentras</th>
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Falta</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:var(--accent)">v<sub>x</sub> = v<sub>0</sub> + a·t</td>
          <td style="padding:8px 12px; color:var(--tx2)">v₀, a, t</td>
          <td style="padding:8px 12px; color:var(--ec)">v<sub>x</sub></td>
          <td style="padding:8px 12px; color:var(--tx3)">x</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:var(--accent)">x = x₀ + v₀·t + ½·a·t²</td>
          <td style="padding:8px 12px; color:var(--tx2)">x₀, v₀, a, t</td>
          <td style="padding:8px 12px; color:var(--ec)">x</td>
          <td style="padding:8px 12px; color:var(--tx3)">v<sub>x</sub></td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:var(--et)">v<sub>x</sub>² = v₀² + 2·a·(x−x₀)</td>
          <td style="padding:8px 12px; color:var(--tx2)">v₀, a, x, x₀</td>
          <td style="padding:8px 12px; color:var(--ec)">v<sub>x</sub></td>
          <td style="padding:8px 12px; color:var(--tx3)">t</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:var(--et)">x−x₀ = ½·(v₀+v<sub>x</sub>)·t</td>
          <td style="padding:8px 12px; color:var(--tx2)">v₀, v<sub>x</sub>, t</td>
          <td style="padding:8px 12px; color:var(--ec)">x−x₀</td>
          <td style="padding:8px 12px; color:var(--tx3)">a</td>
        </tr>
      </tbody>
    </table>
  </div>

</div><!-- /.formulas-page -->