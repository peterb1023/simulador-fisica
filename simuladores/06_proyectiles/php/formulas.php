<?php /* formulas.php — SIM 05 · MRU y MRUA */ ?>

<div class="formulas-page">

  <div class="fp-header">
    <h2>MRU y MRUA</h2>
    <p>Semana 3 · Movimiento Rectilíneo Uniforme y Movimiento Rectilíneo Uniformemente Acelerado</p>
  </div>

  <!-- Comparación lado a lado -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px">

    <!-- MRU -->
    <div style="border:1px solid #30363d; border-top:3px solid #58a6ff; border-radius:8px; padding:20px">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#58a6ff; margin-bottom:14px">MRU — Movimiento Rectilíneo Uniforme</div>
      <div style="font-family:var(--mono); font-size:22px; font-weight:700; margin-bottom:8px">a = 0</div>
      <div style="font-size:12px; color:var(--tx2); margin-bottom:16px">La aceleración es cero. La velocidad no cambia.</div>

      <div style="font-family:var(--mono); font-size:17px; font-weight:700; margin-bottom:6px">x = x₀ + v·t</div>
      <div style="display:flex; flex-direction:column; gap:3px; margin-bottom:12px">
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">x</b> — posición en t (m)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">x₀</b> — posición inicial (m)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">v</b> — velocidad constante (m/s)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">t</b> — tiempo (s)</span>
      </div>

      <div style="font-family:var(--mono); font-size:13px; color:var(--tx2); margin-bottom:4px">v = constante → a = 0</div>

      <div style="padding-top:12px; border-top:1px solid var(--border); margin-top:12px">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--tx3); margin-bottom:6px">Gráficas características</div>
        <div style="font-size:11px; color:var(--tx2); line-height:1.9">
          x(t) → <b style="color:#58a6ff">línea recta</b> con pendiente v<br>
          v(t) → <b style="color:#3fb950">línea horizontal</b> (v = cte)<br>
          a(t) → línea en cero
        </div>
      </div>
    </div>

    <!-- MRUA -->
    <div style="border:1px solid #30363d; border-top:3px solid #f0883e; border-radius:8px; padding:20px">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#f0883e; margin-bottom:14px">MRUA — Movimiento Rectilíneo Uniformemente Acelerado</div>
      <div style="font-family:var(--mono); font-size:22px; font-weight:700; margin-bottom:8px">a = constante ≠ 0</div>
      <div style="font-size:12px; color:var(--tx2); margin-bottom:16px">La aceleración es constante. La velocidad cambia linealmente.</div>

      <div style="font-family:var(--mono); font-size:15px; font-weight:700; margin-bottom:6px">x = x₀ + v₀·t + ½·a·t²</div>
      <div style="display:flex; flex-direction:column; gap:3px; margin-bottom:12px">
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">x₀</b> — posición inicial (m)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">v₀</b> — velocidad inicial (m/s)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">a</b> — aceleración constante (m/s²)</span>
        <span style="font-size:12px; color:var(--tx2)"><b style="color:var(--tx1)">t</b> — tiempo (s)</span>
      </div>

      <div style="padding-top:12px; border-top:1px solid var(--border); margin-top:12px">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--tx3); margin-bottom:6px">Gráficas características</div>
        <div style="font-size:11px; color:var(--tx2); line-height:1.9">
          x(t) → <b style="color:#f0883e">parábola</b> (término t²)<br>
          v(t) → <b style="color:#e3b341">línea recta</b> con pendiente a<br>
          a(t) → línea horizontal (a = cte)
        </div>
      </div>
    </div>

  </div>

  <!-- Las 4 ecuaciones del MRUA -->
  <div style="margin-bottom:16px">
    <div class="res-title" style="margin-bottom:14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--tx2)">
      Cuatro ecuaciones del MRUA (mismas del SIM 04)
    </div>
  </div>

  <div class="fp-grid">

    <div class="fp-card" style="--accent-card:#f0883e">
      <div class="fp-card-tag">Velocidad en función del tiempo</div>
      <div class="fp-eq">vx = v₀ + a·t</div>
      <div class="fp-vars">
        <span><b>vx</b> — velocidad en t (m/s)</span>
        <span><b>v₀</b> — velocidad inicial (m/s)</span>
        <span><b>a</b> — aceleración (m/s²)</span>
      </div>
      <div class="fp-note">En MRU esta ecuación da v = v₀ porque a = 0.</div>
    </div>

    <div class="fp-card" style="--accent-card:#f0883e">
      <div class="fp-card-tag">Posición en función del tiempo</div>
      <div class="fp-eq" style="font-size:15px">x = x₀ + v₀·t + ½·a·t²</div>
      <div class="fp-vars">
        <span><b>x</b> — posición en t (m)</span>
        <span><b>x₀</b> — posición inicial (m)</span>
      </div>
      <div class="fp-note">Con a = 0 se reduce a x = x₀ + v·t (MRU).</div>
    </div>

    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Velocidad sin tiempo</div>
      <div class="fp-eq" style="font-size:14px">vx² = v₀² + 2·a·(x−x₀)</div>
      <div class="fp-vars">
        <span><b>vx²</b> — velocidad al cuadrado (m²/s²)</span>
        <span><b>x − x₀</b> — desplazamiento (m)</span>
      </div>
      <div class="fp-note">No depende de t. Útil cuando no se conoce el tiempo.</div>
    </div>

    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Desplazamiento por velocidades</div>
      <div class="fp-eq" style="font-size:14px">x − x₀ = ½·(v₀ + vx)·t</div>
      <div class="fp-vars">
        <span><b>v₀ + vx</b> — suma velocidades (m/s)</span>
        <span><b>t</b> — tiempo (s)</span>
      </div>
      <div class="fp-note">No depende de a. El desplazamiento es el área del trapecio en v(t).</div>
    </div>

    <!-- Caída libre -->
    <div class="fp-card" style="--accent-card:#f85149; grid-column: span 2">
      <div class="fp-card-tag">Caída libre — MRUA con a = g</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
        <div>
          <div class="fp-eq">g = 9.8 m/s²</div>
          <div class="fp-note">
            La caída libre es un caso especial de MRUA donde la aceleración es la gravedad.<br><br>
            Las mismas 4 ecuaciones aplican sustituyendo <b>a → g</b>.<br><br>
            Objeto en caída: parte del reposo (v₀ = 0), cae con a = 9.8 m/s² hacia abajo.
          </div>
        </div>
        <div>
          <div class="fp-eq-sm" style="margin-bottom:10px">Aplicadas a caída libre:</div>
          <div style="font-family:var(--mono); font-size:11px; color:var(--tx2); line-height:2.1">
            vy = v₀y + g·t<br>
            y = y₀ + v₀y·t + ½·g·t²<br>
            vy² = v₀y² + 2·g·(y − y₀)<br>
            y − y₀ = ½·(v₀y + vy)·t
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Tabla resumen MRU vs MRUA -->
  <div style="margin-top:28px">
    <div class="res-title" style="margin-bottom:14px">Tabla comparativa MRU vs MRUA</div>
    <table style="width:100%; border-collapse:collapse; font-size:12px">
      <thead>
        <tr style="border-bottom:1px solid var(--border)">
          <th style="padding:8px 12px; text-align:left; color:var(--tx2); font-weight:600">Característica</th>
          <th style="padding:8px 12px; text-align:left; color:#58a6ff; font-weight:600">MRU</th>
          <th style="padding:8px 12px; text-align:left; color:#f0883e; font-weight:600">MRUA</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx3)">Aceleración</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:#58a6ff">a = 0</td>
          <td style="padding:8px 12px; font-family:var(--mono); color:#f0883e">a = cte ≠ 0</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx3)">Velocidad</td>
          <td style="padding:8px 12px; color:var(--tx2)">Constante</td>
          <td style="padding:8px 12px; color:var(--tx2)">Varía linealmente</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx3)">Gráfica x(t)</td>
          <td style="padding:8px 12px; color:var(--tx2)">Línea recta</td>
          <td style="padding:8px 12px; color:var(--tx2)">Parábola</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px; color:var(--tx3)">Gráfica v(t)</td>
          <td style="padding:8px 12px; color:var(--tx2)">Línea horizontal</td>
          <td style="padding:8px 12px; color:var(--tx2)">Línea con pendiente a</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; color:var(--tx3)">Ecuación posición</td>
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:#58a6ff">x = x₀ + v·t</td>
          <td style="padding:8px 12px; font-family:var(--mono); font-size:11px; color:#f0883e">x = x₀ + v₀t + ½at²</td>
        </tr>
      </tbody>
    </table>
  </div>

</div>
