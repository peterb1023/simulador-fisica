<?php
// ============================================================
//  formulas.php  —  Tab de referencia SIM 03
// ============================================================
?>
<div class="formulas-page">

  <div class="fp-header">
    <h2>Fórmulas del Curso</h2>
    <p>Conversión de Unidades — Prefijos SI y método de conversión</p>
  </div>

  <div class="fp-grid">

    <div class="fp-card" style="--accent-card:#388bfd">
      <div class="fp-card-tag">Método de conversión estándar</div>
      <div class="fp-eq-sm">valor<sub>destino</sub> = valor<sub>origen</sub> × factor<sub>origen</sub> / factor<sub>destino</sub></div>
      <div class="fp-vars">
        <span><b>factor</b> = cuántas unidades base SI equivale 1 de esa unidad</span>
        <span><b>Paso 1:</b> convertir al origen a la unidad base SI</span>
        <span><b>Paso 2:</b> convertir de la base al destino</span>
      </div>
      <div class="fp-note">Todo pasa por la unidad base. Ejemplo: km → cm pasa por metros.</div>
    </div>

    <div class="fp-card" style="--accent-card:#3fb950">
      <div class="fp-card-tag">Prefijos SI — potencias de 10</div>
      <div class="fp-eq-sm">valor<sub>destino</sub> = valor<sub>origen</sub> × 10<sup>(exp<sub>origen</sub> − exp<sub>destino</sub>)</sup></div>
      <div class="fp-vars">
        <span><b>exp</b> = exponente del prefijo (ej: kilo = 3, mili = −3)</span>
        <span>La diferencia de exponentes da el factor de escala directo</span>
      </div>
      <div class="fp-note">Ejemplo: 5 km → m: 5 × 10<sup>(3−0)</sup> = 5000 m</div>
    </div>

    <div class="fp-card" style="--accent-card:#e3b341">
      <div class="fp-card-tag">Temperatura (caso especial)</div>
      <div class="fp-eq-sm">K = (°C + 273.15)</div>
      <div class="fp-eq-sm">K = (°F + 459.67) × 5/9</div>
      <div class="fp-vars">
        <span><b>Kelvin</b> = unidad base SI de temperatura</span>
        <span>La temperatura requiere offset además del factor</span>
        <span><b>Paso 1:</b> origen → Kelvin &nbsp; <b>Paso 2:</b> Kelvin → destino</span>
      </div>
      <div class="fp-note">Única categoría con suma/resta además de multiplicación.</div>
    </div>

    <div class="fp-card fp-card-tabla" style="--accent-card:#bc8cff">
      <div class="fp-card-tag">Tabla de Prefijos SI</div>
      <table class="pref-ref-table">
        <thead>
          <tr><th>Prefijo</th><th>Símbolo</th><th>Potencia</th></tr>
        </thead>
        <tbody>
          <tr><td>Exa</td>   <td>E</td>  <td>10<sup>18</sup></td></tr>
          <tr><td>Peta</td>  <td>P</td>  <td>10<sup>15</sup></td></tr>
          <tr><td>Tera</td>  <td>T</td>  <td>10<sup>12</sup></td></tr>
          <tr><td>Giga</td>  <td>G</td>  <td>10<sup>9</sup></td></tr>
          <tr><td>Mega</td>  <td>M</td>  <td>10<sup>6</sup></td></tr>
          <tr><td>Kilo</td>  <td>k</td>  <td>10<sup>3</sup></td></tr>
          <tr><td>Hecto</td> <td>h</td>  <td>10<sup>2</sup></td></tr>
          <tr><td>Deca</td>  <td>da</td> <td>10<sup>1</sup></td></tr>
          <tr class="pref-base-row"><td><b>Base</b></td><td>—</td><td>10<sup>0</sup></td></tr>
          <tr><td>Deci</td>  <td>d</td>  <td>10<sup>−1</sup></td></tr>
          <tr><td>Centi</td> <td>c</td>  <td>10<sup>−2</sup></td></tr>
          <tr><td>Mili</td>  <td>m</td>  <td>10<sup>−3</sup></td></tr>
          <tr><td>Micro</td> <td>μ</td>  <td>10<sup>−6</sup></td></tr>
          <tr><td>Nano</td>  <td>n</td>  <td>10<sup>−9</sup></td></tr>
          <tr><td>Pico</td>  <td>p</td>  <td>10<sup>−12</sup></td></tr>
          <tr><td>Femto</td> <td>f</td>  <td>10<sup>−15</sup></td></tr>
          <tr><td>Atto</td>  <td>a</td>  <td>10<sup>−18</sup></td></tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<style>
.pref-ref-table {
  width: 100%; max-width: 100%; overflow-x: auto; display: block;
  border-collapse: collapse; font-family: var(--mono); font-size: 11px; margin-top: 8px;
}
.pref-ref-table th {
  text-align: left; color: var(--tx3);
  font-size: 9px; text-transform: uppercase; letter-spacing: .08em;
  padding: 4px 8px; border-bottom: 1px solid var(--border);
}
.pref-ref-table td {
  padding: 4px 8px; color: var(--tx2);
  border-bottom: 1px solid rgba(48,54,61,0.4);
}
.pref-ref-table td:first-child { color: var(--tx1); }
.pref-ref-table td sup { color: var(--accent); }
.pref-base-row td { color: var(--et) !important; font-weight: 700; background: rgba(227,179,65,0.06); }
</style>
