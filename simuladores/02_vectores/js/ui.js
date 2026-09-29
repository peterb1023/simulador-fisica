// ============================================================
//  ui.js  —  Controles y panel de resultados (SIM 02)
// ============================================================

const UI = (() => {

  // ── Arrancar ─────────────────────────────────────────────
  function boot() {
    setTimeout(() => {
      Renderer.init();
      Engine.createVector(4,  3);
      Engine.createVector(-2, 5);
      renderAllControls();
      Renderer.start();
    }, 100);
  }

  // ── Renderizar todos los controles en el panel izq ───────
  function renderAllControls() {
    const container = document.getElementById('vec-controls');
    container.innerHTML = '';
    Engine.getVectors().forEach(v => {
      container.appendChild(buildCard(v));
    });
    updateAddBtn();
  }

  // ── Construir tarjeta de un vector ───────────────────────
  function buildCard(v) {
    const card = document.createElement('div');
    card.className = 'vec-card';
    card.id = `vc-${v.id}`;
    card.style.setProperty('--vc', v.color);

    card.innerHTML = `
      <div class="vc-head">
        <span class="vc-badge" style="background:${v.color}22;color:${v.color};border:1px solid ${v.color}44">${v.name}</span>
        <span class="vc-mag" id="vc-mag-${v.id}">|${v.name}| = ${fmt(v.r)}</span>
        <button class="vc-del" onclick="removeVec(${v.id})" title="Eliminar">✕</button>
      </div>

      <div class="vc-section">
        <div class="vc-label">Componentes</div>
        <div class="sl-row">
          <span class="sl-axis" style="color:${v.color}">Vx</span>
          <input type="range" id="sl-vx-${v.id}" min="-10" max="10" step="0.5" value="${fmt(v.vx)}"
            oninput="onSlide(${v.id},'vx',+this.value)">
          <span class="sl-val" id="vx-val-${v.id}"><b>${fmt(v.vx)}</b></span>
        </div>
        <div class="sl-row">
          <span class="sl-axis" style="color:${v.color}">Vy</span>
          <input type="range" id="sl-vy-${v.id}" min="-10" max="10" step="0.5" value="${fmt(v.vy)}"
            oninput="onSlide(${v.id},'vy',+this.value)">
          <span class="sl-val" id="vy-val-${v.id}"><b>${fmt(v.vy)}</b></span>
        </div>
      </div>

      <div class="vc-section">
        <div class="vc-label">Polares</div>
        <div class="sl-row">
          <span class="sl-axis" style="color:${v.color}">r</span>
          <input type="range" id="sl-r-${v.id}" min="0" max="14" step="0.5" value="${fmt(v.r)}"
            oninput="onSlide(${v.id},'r',+this.value)">
          <span class="sl-val" id="r-val-${v.id}"><b>${fmt(v.r)}</b></span>
        </div>
        <div class="sl-row">
          <span class="sl-axis" style="color:${v.color}">θ</span>
          <input type="range" id="sl-t-${v.id}" min="0" max="360" step="1" value="${fmt(v.theta)}"
            oninput="onSlide(${v.id},'theta',+this.value)">
          <span class="sl-val" id="t-val-${v.id}"><b>${fmt(v.theta)}°</b></span>
        </div>
      </div>

      <div class="vc-sust" id="vc-sust-${v.id}">
        <div><span style="color:var(--tx3)">Vx =</span> ${fmt(v.r)}·cos(${fmt(v.theta)}°) = <b style="color:${v.color}">${fmt(v.vx)}</b></div>
        <div><span style="color:var(--tx3)">Vy =</span> ${fmt(v.r)}·sen(${fmt(v.theta)}°) = <b style="color:${v.color}">${fmt(v.vy)}</b></div>
      </div>
    `;
    return card;
  }

  // ── Sincronizar controles desde engine (drag → sliders) ──
  function syncControls(id) {
    const v = Engine.getVector(id);
    if (!v) return;

    setVal(`sl-vx-${id}`, fmt(v.vx));
    setVal(`sl-vy-${id}`, fmt(v.vy));
    setVal(`sl-r-${id}`,  fmt(v.r));
    setVal(`sl-t-${id}`,  fmt(v.theta));

    setTxt(`vx-val-${id}`, `<b>${fmt(v.vx)}</b>`);
    setTxt(`vy-val-${id}`, `<b>${fmt(v.vy)}</b>`);
    setTxt(`r-val-${id}`,  `<b>${fmt(v.r)}</b>`);
    setTxt(`t-val-${id}`,  `<b>${fmt(v.theta)}°</b>`);
    setTxt(`vc-mag-${id}`, `|${v.name}| = ${fmt(v.r)}`);
    setTxt(`vc-sust-${id}`,
      `<div><span style="color:var(--tx3)">Vx =</span> ${fmt(v.r)}·cos(${fmt(v.theta)}°) = <b style="color:${v.color}">${fmt(v.vx)}</b></div>
       <div><span style="color:var(--tx3)">Vy =</span> ${fmt(v.r)}·sen(${fmt(v.theta)}°) = <b style="color:${v.color}">${fmt(v.vy)}</b></div>`
    );
  }

  // ── Actualizar panel derecho de resultados ────────────────
  function updatePanel(vecs, res) {
    const products=Engine.products();
    setTxt('vector-products',products?`A·B = ${fmt(products.dot)} u²; (A×B)z = ${fmt(products.crossZ)} u²`:'Añade dos vectores.');
    // Resultante
    setTxt('res-rx',  fmt(res.Rx));
    setTxt('res-ry',  fmt(res.Ry));
    setTxt('res-r',   fmt(res.R));
    setTxt('res-ang', fmt(res.thetaR) + '°');

    // Resolución paso a paso
    const rxParts = vecs.map(v => `${fmt(v.vx)}`).join(' + ');
    const ryParts = vecs.map(v => `${fmt(v.vy)}`).join(' + ');
    setTxt('res-rx-sust', `Rx = ${rxParts} = ${fmt(res.Rx)}`);
    setTxt('res-ry-sust', `Ry = ${ryParts} = ${fmt(res.Ry)}`);
    setTxt('res-r-sust',  `R = √(${fmt(res.Rx)}² + ${fmt(res.Ry)}²) = ${fmt(res.R)}`);
    setTxt('res-ang-sust',`θ = atan2(${fmt(res.Ry)}, ${fmt(res.Rx)}) = ${fmt(res.thetaR)}°`);

    // Ley del coseno (solo si hay 2 vectores)
    const lcBlock = document.getElementById('ley-coseno-block');
    if (res.leyCoseno && vecs.length === 2) {
      lcBlock.style.display = 'block';
      const lc = res.leyCoseno;
      setTxt('lc-sust', `R = √(${fmt(lc.A)}² + ${fmt(lc.B)}² + 2·${fmt(lc.A)}·${fmt(lc.B)}·cos(${fmt(lc.angle)}°))`);
      setTxt('lc-res',  `R = ${fmt(lc.R)}`);
    } else {
      lcBlock.style.display = 'none';
    }
  }

  // ── Control de botón Agregar ──────────────────────────────
  function updateAddBtn() {
    const btn = document.getElementById('btn-add-vec');
    if (!btn) return;
    btn.disabled = !Engine.canAdd();
    btn.textContent = Engine.canAdd()
      ? `+ Agregar vector (${Engine.getVectors().length})`
      : 'No se pueden agregar más';
  }

  // ── Helpers ──────────────────────────────────────────────
  function fmt(n)       { return Math.round(n * 100) / 100; }
  function setTxt(id, t){ const el = document.getElementById(id); if (el) el.innerHTML = t; }
  function setVal(id, v){ const el = document.getElementById(id); if (el) el.value = v; }

  return { boot, renderAllControls, syncControls, updatePanel, updateAddBtn, fmt };

})();

// ── Funciones globales ────────────────────────────────────────

function onSlide(id, axis, val) {
  const v = Engine.getVector(id);
  if (!v) return;

  if (axis === 'vx')    Engine.setCartesian(id, val, v.vy);
  if (axis === 'vy')    Engine.setCartesian(id, v.vx, val);
  if (axis === 'r')     Engine.setPolar(id, val, v.theta);
  if (axis === 'theta') Engine.setPolar(id, v.r, val);

  UI.syncControls(id);
}

function addVec() {
  if (!Engine.canAdd()) return;
  // Nuevo vector con valores aleatorios suaves
  const vx = (Math.random() * 8 - 4).toFixed(1) * 1;
  const vy = (Math.random() * 8 - 4).toFixed(1) * 1;
  Engine.createVector(vx, vy);
  UI.renderAllControls();
}

function removeVec(id) {
  if (Engine.getVectors().length <= 1) return; // mínimo 1
  Engine.removeVector(id);
  UI.renderAllControls();
}

function resetSim() {
  // Limpiar todos los vectores y crear 2 frescos
  const vecs = Engine.getVectors();
  vecs.forEach(v => Engine.removeVector(v.id));
  Engine.createVector(4, 3);
  Engine.createVector(-2, 5);
  UI.renderAllControls();
}

function resetCamera() {
  Renderer.resetCamera();
}

function setTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab-' + name).style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => UI.boot());
