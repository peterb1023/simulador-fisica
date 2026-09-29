<?php
// ============================================================
//  formulas.php  —  Tab "Fórmulas" SIM 10: Potencia
// ============================================================
?>
<div class="formulas-wrap">

  <div class="f-header">
    <div class="f-sim-badge">SIM #10</div>
    <h2 class="f-title">Potencia — Fórmulas del profesor</h2>
    <p class="f-sub">Trabajo y energía · Semanas 9–10</p>
  </div>

  <!-- ══ SECCIÓN 1: Definición ══ -->
  <section class="f-section">
    <div class="f-section-title">1. Definición de potencia</div>
    <div class="f-cards">

      <div class="f-card f-card-highlight">
        <div class="f-formula accent-gold">P = W / t</div>
        <div class="f-desc">
          La potencia es la <strong>tasa a la que se realiza trabajo</strong>. A mayor potencia, más trabajo se hace en menos tiempo. La unidad del SI es el <em>Watt (W = J/s)</em>.
        </div>
        <div class="f-vars">
          <span class="var-item"><b>P</b> — potencia (W = J/s)</span>
          <span class="var-item"><b>W</b> — trabajo realizado (J)</span>
          <span class="var-item"><b>t</b> — tiempo transcurrido (s)</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-formula accent-gold">P = F · v</div>
        <div class="f-desc">
          Cuando una fuerza F actúa sobre un objeto que se mueve a velocidad v en la misma dirección, la potencia instantánea es el producto F·v. Se obtiene directamente de P = W/t = Fs/t.
        </div>
        <div class="f-vars">
          <span class="var-item"><b>F</b> — fuerza aplicada (N)</span>
          <span class="var-item"><b>v</b> — velocidad del objeto (m/s)</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SECCIÓN 2: Formas despejadas ══ -->
  <section class="f-section">
    <div class="f-section-title">2. Formas despejadas</div>
    <div class="f-cards f-cards-3">

      <div class="f-card">
        <div class="f-label">Buscar trabajo</div>
        <div class="f-formula accent-blue" style="font-size:15px">W = P · t</div>
        <div class="f-desc">Si conoces la potencia y el tiempo, el trabajo total realizado es su producto.</div>
        <div class="f-vars">
          <span class="var-item">Despejada de P = W/t</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-label">Buscar tiempo</div>
        <div class="f-formula accent-blue" style="font-size:15px">t = W / P</div>
        <div class="f-desc">Si conoces trabajo y potencia, el tiempo necesario para realizarlo.</div>
        <div class="f-vars">
          <span class="var-item">Despejada de P = W/t</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-label">Buscar fuerza</div>
        <div class="f-formula accent-blue" style="font-size:15px">F = P / v</div>
        <div class="f-desc">Si conoces la potencia y la velocidad, la fuerza que produce ese movimiento.</div>
        <div class="f-vars">
          <span class="var-item">Despejada de P = F·v</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ SECCIÓN 3: Conversiones [AGREGADAS] ══ -->
  <section class="f-section">
    <div class="f-section-title">3. Conversiones de unidades <span class="badge-agr">[AGREGADAS]</span></div>
    <div class="f-cards">

      <div class="f-card f-card-highlight-purple">
        <div class="f-label">Caballo de fuerza</div>
        <div class="f-formula accent-purple">1 hp = 746 W</div>
        <div class="f-desc">
          El <strong>horsepower (hp)</strong> es una unidad de potencia del sistema imperial, aún común en motores y maquinaria.
        </div>
        <div class="f-derivation">
          <span class="deriv-step">W → hp:  dividir entre 746</span>
          <span class="deriv-step">hp → W:  multiplicar por 746</span>
          <span class="deriv-step">Ejemplo: 2 hp = 2 × 746 = 1 492 W</span>
        </div>
      </div>

      <div class="f-card">
        <div class="f-label">Kilowatt y kilowatt-hora</div>
        <div class="f-formula accent-blue" style="font-size:14px">1 kW = 1 000 W<br>1 kWh = 3 600 000 J</div>
        <div class="f-desc">
          El <strong>kilowatt-hora (kWh)</strong> es la unidad de energía usada en facturación eléctrica. Es la energía entregada a 1 kW durante 1 hora.
        </div>
        <div class="f-derivation">
          <span class="deriv-step">1 kWh = 1 000 W × 3 600 s</span>
          <span class="deriv-step">1 kWh = 3 600 000 J = 3.6 MJ</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ Tabla resumen ══ -->
  <section class="f-section">
    <div class="f-section-title">Resumen rápido</div>
    <div class="f-summary-table">
      <div class="fst-row fst-head">
        <span>Buscar</span><span>Fórmula</span><span>Necesitas</span>
      </div>
      <div class="fst-row fst-highlight">
        <span class="fst-var accent-gold">P</span>
        <span class="fst-f mono">W / t</span>
        <span class="fst-n">Trabajo (J) y tiempo (s)</span>
      </div>
      <div class="fst-row fst-highlight">
        <span class="fst-var accent-gold">P</span>
        <span class="fst-f mono">F · v</span>
        <span class="fst-n">Fuerza (N) y velocidad (m/s)</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-blue">W</span>
        <span class="fst-f mono">P · t</span>
        <span class="fst-n">Potencia (W) y tiempo (s)</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-blue">t</span>
        <span class="fst-f mono">W / P</span>
        <span class="fst-n">Trabajo (J) y potencia (W)</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-purple">hp → W</span>
        <span class="fst-f mono">hp × 746</span>
        <span class="fst-n">[AGREGADA]</span>
      </div>
      <div class="fst-row">
        <span class="fst-var accent-purple">kWh → J</span>
        <span class="fst-f mono">kWh × 3 600 000</span>
        <span class="fst-n">[AGREGADA]</span>
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
  font-size: 9px; font-weight: 600; color: #a371f7;
  background: rgba(163,113,247,.08); border: 1px solid rgba(163,113,247,.2);
  border-radius: 3px; padding: 1px 6px; text-transform: none; letter-spacing: 0; margin-left: 6px;
}

.f-cards      { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f-cards-3    { grid-template-columns: 1fr 1fr 1fr; }

.f-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rs); padding: 16px 18px;
}
.f-card-highlight        { border-left: 3px solid var(--et); }
.f-card-highlight-purple { border-left: 3px solid #a371f7; }

.f-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--tx3); margin-bottom: 8px; }
.f-formula { font-family: var(--mono); font-size: 16px; font-weight: 700; margin-bottom: 10px; line-height: 1.6; }
.f-formula.accent-gold   { color: var(--et); }
.f-formula.accent-blue   { color: #58a6ff; }
.f-formula.accent-purple { color: #a371f7; }

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
  display: grid; grid-template-columns: 110px 1fr 1fr; gap: 12px;
  padding: 9px 14px; border-bottom: 1px solid var(--border);
  font-size: 12px; align-items: center;
}
.fst-row:last-child { border-bottom: none; }
.fst-head { background: var(--card); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--tx3); }
.fst-highlight { background: rgba(227,179,65,.04); }
.fst-var { font-family: var(--mono); font-weight: 700; }
.fst-f   { font-family: var(--mono); font-size: 11px; color: var(--tx1); }
.fst-n   { font-size: 11px; color: var(--tx3); }
.mono    { font-family: var(--mono); }

.accent-gold   { color: var(--et); }
.accent-blue   { color: #58a6ff; }
.accent-purple { color: #a371f7; }
</style><section class="fp-card"><h3>Eficiencia</h3><p>η=P_útil/P_entrada=E_útil/E_entrada para el mismo intervalo. 0≤η≤1; porcentaje=100η. La entrada debe ser positiva y la salida no puede excederla.</p></section>