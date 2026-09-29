// ============================================================
//  ui.js  —  Controles + resolución en vivo (SIM 10)
// ============================================================

const UI = (() => {

  function boot() {
    setTimeout(() => {
      Renderer.init();
      Engine.calcular();
      bindControls();
      setModo('P');
      Renderer.start();
    }, 80);
  }

  // ── Modo activo ───────────────────────────────────────────
  function setModo(modo) {
    Engine.setModo(modo);

    // Resaltar botón activo
    document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('modo-' + modo);
    if (btn) btn.classList.add('active');

    // Mostrar/ocultar grupos de inputs según modo
    const grupos = {
      'P':  ['grp-W', 'grp-t'],
      'W':  ['grp-P', 'grp-t'],
      't':  ['grp-W', 'grp-P'],
      'Fv': ['grp-F', 'grp-v'],
    };
    ['grp-W', 'grp-t', 'grp-P', 'grp-F', 'grp-v'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    (grupos[modo] || []).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });

    // Actualizar label del resultado
    const labels = { 'P': 'Potencia', 'W': 'Trabajo', 't': 'Tiempo', 'Fv': 'Potencia (F·v)' };
    setHTML('res-label', labels[modo] || '');

    renderPasos();
  }

  // ── Bind inputs numéricos ─────────────────────────────────
  function bindControls() {
    bindNum('inp-W', v => Engine.setW(v));
    bindNum('inp-P', v => Engine.setP(v));
    bindNum('inp-t', v => Engine.setT(v));
    bindNum('inp-F', v => Engine.setF(v));
    bindNum('inp-v', v => Engine.setV(v));

    // Inputs disparan re-render
    ['inp-W','inp-P','inp-t','inp-F','inp-v'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => renderPasos());
    });
  }

  function bindNum(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v >= 0) fn(v);
    });
  }

  // ── Renderizar resolución ─────────────────────────────────
  function renderPasos() {
    const st = Engine.getState();

    // Resultado principal
    let resStr = '—';
    let resUnit = '';
    if (st.resultado !== null) {
      resStr = Engine.fmt(st.resultado);
      resUnit = { P: 'W', W: 'J', t: 's', Fv: 'W' }[st.modo] || '';
    }
    setHTML('res-valor', `${resStr} <span class="res-unit">${resUnit}</span>`);

    // Pasos
    const container = document.getElementById('pasos-container');
    if (!container) return;
    container.innerHTML = '';
    st.pasos.forEach(paso => {
      const sustHtml = paso.sust.replace(/\n/g, '<br>');
      const div = document.createElement('div');
      div.className = 'step-card';
      div.innerHTML = `
        <div class="step-formula">${paso.formula}</div>
        <div class="step-sust">${sustHtml}</div>
        <div class="step-res">${paso.res}</div>`;
      container.appendChild(div);
    });
  }

  function setHTML(id, html) {
    const el = document.getElementById(id); if (el) el.innerHTML = html;
  }

  return { boot, setModo, renderPasos };

})();

// ── Globales ──────────────────────────────────────────────────
function setModo(m)  { UI.setModo(m); }
function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
document.addEventListener('DOMContentLoaded', () => UI.boot());
document.addEventListener('DOMContentLoaded',()=>{
 const output=document.getElementById('eff-result');
 const update=()=>{const unit=document.getElementById('eff-kind').value;
 const eta=Engine.efficiency(parseFloat(document.getElementById('eff-out').value),parseFloat(document.getElementById('eff-in').value));
 output.textContent=eta===null?'Entrada > 0; salida útil entre 0 y entrada.':`η = salida/entrada = ${(eta*100).toFixed(1)} % (ambas en ${unit})`;};
 for(const id of ['eff-kind','eff-in','eff-out'])document.getElementById(id).addEventListener('input',update);update();
});
