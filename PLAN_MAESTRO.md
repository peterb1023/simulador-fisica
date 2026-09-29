# Plan Maestro — Simuladores de Física I
**Proyecto:** Lab virtual de Física I  
**Stack:** PHP + HTML5 Canvas + JS vanilla  
**Servidor:** XAMPP (Apache)  
**Última actualización:** 2026-04-23

---

## Estado actual del proyecto

| # | Nombre | Estado | Timeline | Notas |
|---|--------|--------|----------|-------|
| 01 | Energía en la Pista | ✅ Construido | 🔲 Pendiente | Base original del proyecto |
| 02 | Vectores | ✅ Construido + corregido | N/A | No aplica (interactivo, no temporal) |
| 03 | Conversión de Unidades | ✅ Construido + corregido | N/A | No aplica (calculadora) |
| 04 | Cinemática 1D | ✅ Construido + mejorado | ✅ Implementado | Timeline completo + cámara seguimiento |
| 05 | MRU y MRUA | 📋 Pendiente | 🔲 Pendiente | |
| 06 | Proyectiles | 📋 Pendiente | 🔲 Pendiente | |
| 07 | Mov. Circular | 📋 Pendiente | 🔲 Pendiente | |
| 08 | Leyes de Newton | 📋 Pendiente | 🔲 Pendiente | |
| 09 | Trabajo | 📋 Pendiente | 🔲 Pendiente | |
| 10 | Potencia | 📋 Pendiente | N/A | No aplica (calculadora) |
| 11 | Cinemática Rotacional | ✅ Funcional | ❌ Excluido | Ya funciona bien sin timeline |
| 12 | Momento de Inercia | ✅ Funcional | ❌ Excluido | Ya funciona bien sin timeline |

---

## Árbol del proyecto

```
simuladores_fisica/
│
├── index.php                  ← Menú principal (portal de todos los simuladores)
├── PLAN_MAESTRO.md            ← Este archivo
│
├── php/
│   └── config.php             ← Configuración global, server-side
│
├── css/
│   └── global.css             ← Estilos compartidos (header, nav, cards)
│
├── simuladores/
│   │
│   ├── 01_energia/            ← ✅ CONSTRUIDO
│   │   ├── index.php
│   │   ├── php/config.php
│   │   ├── php/formulas.php
│   │   ├── css/sim.css
│   │   ├── js/engine.js
│   │   ├── js/render.js
│   │   └── js/ui.js
│   │
│   ├── 02_vectores/           ← ✅ CONSTRUIDO + CORREGIDO
│   │   └── (misma estructura)
│   │
│   ├── 03_unidades/           ← ✅ CONSTRUIDO + CORREGIDO
│   │   └── (misma estructura)
│   │
│   ├── 04_cinematica_1d/      ← ✅ CONSTRUIDO + MEJORADO (timeline ✅)
│   │   └── (misma estructura)
│   │
│   ├── 05_mru_mrua/           ← 📋 Pendiente
│   ├── 06_proyectiles/        ← 📋 Pendiente
│   ├── 07_circular/           ← 📋 Pendiente
│   ├── 08_newton/             ← 📋 Pendiente
│   ├── 09_trabajo/            ← 📋 Pendiente
│   ├── 10_potencia/           ← 📋 Pendiente
│   ├── 11_rotacional/         ← ✅ Funcional (sin timeline)
│   └── 12_inercia/            ← ✅ Funcional (sin timeline)
│
├── extras/                    ← Menciones honoríficas (NO SE MODIFICAN)
│   ├── simulador_ABS.html     ← Transformada de Laplace
│   └── simulador_transporte.html ← Rutas de transporte
│
└── assets/
    └── prefijos_si.png        ← Tabla de prefijos del profesor
```

---

## Estándar: Barra de línea de tiempo (Video Scrubber)

> **Todo simulador con animación temporal lleva esta barra, salvo los rotacionales (11 y 12) que ya son funcionales sin ella.**

### ¿Qué es?
Una barra de control estilo reproductor de video ubicada entre la pista/canvas principal y las gráficas, que permite al estudiante **navegar por la simulación como si fuera un video**: pausar, reanudar, retroceder y avanzar libremente sin tener que reiniciar.

### Comportamiento esperado
| Acción | Resultado |
|--------|-----------|
| ⏮ (reset) | Regresa al instante t = 0 |
| ⏸ (pausa) | Detiene la animación en el frame actual |
| ▶ (play) | Reanuda desde el punto actual |
| Arrastrar el scrubber | Pausa y salta a cualquier t ∈ [0, tMax] |
| Scrubber en tMax y presionar ▶ | Reinicia automáticamente desde t = 0 |
| Cambiar un parámetro (slider x₀, v₀…) | Reinicia la simulación al t = 0 |

### Implementación técnica (basada en SIM 04 — referencia)

**`engine.js`** — agregar función `seekTo(t)`:
```js
function seekTo(targetT) {
  const t     = Math.max(0, Math.min(targetT, state.tMax));
  state.t     = t;
  state.x     = xAt(t);   // función que calcula posición en t sin mutar estado
  state.v     = vAt(t);   // ídem para velocidad
  state.ended = (t >= state.tMax);
  // Reconstruir historial muestreando a 60 muestras/s
  const RATE  = 60;
  const steps = Math.floor(t * RATE);
  state.histX = [];
  state.histV = [];
  for (let i = 0; i <= steps; i++) {
    const ti = i / RATE;
    state.histX.push({ t: ti, x: xAt(ti) });
    state.histV.push({ t: ti, v: vAt(ti) });
  }
  if (steps / RATE < t - 1e-9) {
    state.histX.push({ t, x: state.x });
    state.histV.push({ t, v: state.v });
  }
}
```
> Clave: el engine debe tener funciones `xAt(t)` y `vAt(t)` (o equivalentes) que calculen el estado en cualquier instante usando las fórmulas analíticas, sin depender del loop de animación.

**`render.js`** — sincronizar scrubber en cada frame:
```js
function syncTimeline(st) {
  const tl = document.getElementById('timeline');
  if (tl && !tl._dragging) tl.value = st.t;          // no sobreescribir si el usuario está arrastrando
  const tlTime = document.getElementById('tl-time');
  if (tlTime) tlTime.textContent = st.t.toFixed(2);
  if (st.ended) {
    const btn = document.getElementById('btn-tl-play');
    if (btn && btn.textContent === '⏸') btn.textContent = '▶';
  }
}
```

**`ui.js`** — binding del scrubber:
```js
function bindTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  tl.addEventListener('pointerdown', () => { tl._dragging = true; });
  window.addEventListener('pointerup', () => { tl._dragging = false; });
  tl.addEventListener('input', e => {
    if (!Engine.getState().paused) {
      Engine.togglePause();
      syncPlayBtn();
    }
    Engine.seekTo(+e.target.value);
  });
}
```

**`index.php`** — HTML de la barra (va entre pista y gráficas):
```html
<div class="timeline-bar">
  <button id="btn-tl-reset" onclick="resetSim()" class="tl-btn" title="Reiniciar">⏮</button>
  <button id="btn-tl-play"  onclick="togglePause()" class="tl-btn">⏸</button>
  <div class="tl-track-wrap">
    <input type="range" id="timeline" min="0" max="8" step="0.02" value="0">
  </div>
  <span class="tl-cur" id="tl-time">0.00</span>
  <span class="tl-sep">/</span>
  <span class="tl-end" id="tl-max">8 s</span>
</div>
```

### Duración configurable (tMax)
El campo de duración se implementa como `<input type="number">` sin límite superior (no un range slider), para que el estudiante pueda escribir cualquier número de segundos:
```html
<input type="number" id="sl-t" min="1" step="1" value="8">
```

### Simuladores que llevan timeline

| # | Simulador | ¿Timeline? | Razón |
|---|-----------|-----------|-------|
| 01 | Energía en la Pista | ✅ Sí | Animación temporal |
| 02 | Vectores | ❌ No | Interactivo (drag), sin dimensión temporal |
| 03 | Unidades | ❌ No | Calculadora estática |
| 04 | Cinemática 1D | ✅ Sí (**ya implementado**) | Animación temporal |
| 05 | MRU y MRUA | ✅ Sí | Animación temporal |
| 06 | Proyectiles | ✅ Sí | Animación temporal |
| 07 | Mov. Circular | ✅ Sí | Animación temporal |
| 08 | Leyes de Newton | ✅ Sí | Animación de aceleración |
| 09 | Trabajo | ✅ Sí | Animación temporal |
| 10 | Potencia | ❌ No | Calculadora |
| 11 | Cin. Rotacional | ❌ No | Ya funcional sin él |
| 12 | Mom. de Inercia | ❌ No | Ya funcional sin él |

---

## Correcciones y mejoras realizadas

### SIM 02 — Vectores
- **Zoom** con rueda del mouse y botones: dirección estaba invertida (corregido)
- **Pan** del plano: los eventos `mousemove`/`mouseup` estaban en el canvas; al salir del canvas se perdía el arrastre (movidos a `window`)
- **Sliders** (`vc-sust`): las fórmulas Vx= y Vy= aparecían en una sola línea larga fuera de la tarjeta (separadas en dos `<div>`)
- **Panel izquierdo** ampliado: 240px → 280px
- **Límite de vectores**: máximo artificial eliminado, ahora admite hasta 999

### SIM 03 — Conversión de Unidades / Prefijos SI
- **Columna Factor**: para exponentes grandes (±9 a ±18), el número decimal era ilegible (20+ caracteres). Ahora muestra `10^n` con superíndice
- **Tabs de categoría**: al cambiar a "Prefijos SI", las pestañas de categoría (Longitud, Masa…) permanecían visibles. Ahora se ocultan
- La lógica de conversión (`engine.js`) estaba correcta; los arreglos fueron exclusivamente de UX

### SIM 04 — Cinemática 1D
- **Objeto se iba de pantalla** en caída libre: implementada cámara de seguimiento (follow camera). El objeto siempre aparece al 45% del ancho; el riel y las marcas se deslizan detrás
- **Barra de línea de tiempo** implementada (ver sección estándar arriba)
- **Marcador x₀**: línea dorada en el riel para visualizar el desplazamiento (x − x₀)
- **Fórmulas del panel derecho**: texto monoespaciado largo desbordaba el panel (añadido `overflow-wrap: anywhere`)
- **Duración**: cambiada de slider (max=10s) a número libre sin límite superior
- **Panel izquierdo** ampliado: 210px → 250px; panel derecho: 230px → 260px

---

## Categorías de simuladores

### Vista por SEMANA
| # | Semana(s) | Nombre | Tipo |
|---|-----------|--------|------|
| 01 | 9–11 | Energía en la Pista | Canvas animado |
| 02 | 1–2 | Vectores | Plano cartesiano interactivo |
| 03 | 2 | Conversión de Unidades | Calculadora |
| 04 | 3 | Cinemática 1D | Gráficas animadas |
| 05 | 4 | MRU y MRUA | Canvas animado |
| 06 | 5 | Proyectiles | Canvas animado |
| 07 | 6 | Movimiento Circular | Canvas animado |
| 08 | 7–8 | Leyes de Newton | DCL interactivo |
| 09 | 9 | Trabajo | Fuerza + desplazamiento |
| 10 | 9–10 | Potencia | Calculadora + visual |
| 11 | 12 | Cinemática Rotacional | Canvas giratorio |
| 12 | 13 | Momento de Inercia | Comparador visual |

### Vista por CATEGORÍA
| Categoría | Simuladores |
|-----------|-------------|
| Vectores y unidades | 02, 03 |
| Cinemática lineal | 04, 05, 06 |
| Dinámica (Newton) | 08 |
| Trabajo y energía | 01, 09, 10 |
| Movimiento circular | 07 |
| Rotacional | 11, 12 |

---

## Fórmulas por simulador

### SIM 01 — Energía en la Pista ✅
**Fórmulas del profesor:**
- `U = m · g · h`
- `K = ½ · m · v²`
- `E = K + U`
- `K₁ + U₁ = K₂ + U₂`
- `W_grav = −ΔU`
- `K₁ + U₁ + W_otras = K₂ + U₂`

**Agregadas:** `v = √(2K/m)` · `E_total = K + U + E_térmica` (con fricción)

---

### SIM 02 — Vectores ✅
**Fórmulas del profesor:**
- `Vx = r·cosθ` / `Vy = r·senθ`
- `r = √(Vx²+Vy²)`
- `θ = tan⁻¹(Vy/Vx)`
- `Rx = ΣVx` / `Ry = ΣVy`
- `R = √(Rx²+Ry²)` / `θR = tan⁻¹(Ry/Rx)`
- `R = √(A²+B²+2AB·cosθ)` — Ley del coseno
- `A/senα = B/senβ = R/senθ` — Ley del seno

---

### SIM 03 — Conversión de Unidades ✅
**Prefijos SI:** Exa (10¹⁸) → Atto (10⁻¹⁸)  
**Método:** valor × 10^(exp_origen − exp_destino). Temperatura con offsets (°C, K, °F).

---

### SIM 04 — Cinemática 1D ✅
**Fórmulas del profesor:**
- `v_med = Δx/Δt`
- `a_med = Δvₓ/Δt`
- `vₓ = v₀ₓ + aₓt`
- `x = x₀ + v₀ₓt + ½aₓt²`
- `vₓ² = v₀ₓ² + 2aₓ(x−x₀)`
- `x−x₀ = ½(v₀ₓ+vₓ)t`
- `g = 9.8 m/s²`

---

### SIM 05 — MRU y MRUA
**Fórmulas:** Las mismas del SIM 04 aplicadas visualmente. Diferencia visual entre `a = 0` (MRU) y `a ≠ 0` (MRUA).

---

### SIM 06 — Proyectiles
- `v₀ₓ = v₀·cosα₀` / `v₀y = v₀·senα₀`
- `x = (v₀cosα₀)t`
- `y = y₀ + v₀yt − ½gt²`
- `vₓ = v₀ₓ` (constante) / `vy = v₀senα₀ − gt`
- `y = (tanα₀)x − [g/(2v₀²cos²α₀)]·x²`

---

### SIM 07 — Movimiento Circular
- `arad = v²/R`
- `v = 2πR/T`
- `arad = 4π²R/T²`
- `atan = d|v⃗|/dt`

---

### SIM 08 — Leyes de Newton
- `ΣF⃗ = 0` (1ª ley)
- `ΣF⃗ = ma⃗` (2ª ley) — `ΣFₓ = maₓ` / `ΣFy = may`
- `w = mg`
- `fk = μk·n` `[AGREGADA]` / `fs ≤ μs·n` `[AGREGADA]`
- `T = m(g+ay)` — Tensión en elevador

---

### SIM 09 — Trabajo
- `W = Fs`
- `W = Fs·cosφ`
- `W = F⃗·s⃗`
- `W_tot = ΔK = K₂ − K₁`
- `W = ½kx²₂ − ½kx²₁` (resorte) `[AGREGADA]`

---

### SIM 10 — Potencia
- `P = W/t` / `P = F·v`
- `W = P·t` / `t = W/P`
- `1 hp = 746 W` `[AGREGADA]`

---

### SIM 11 — Cinemática Rotacional ✅ (funcional)
- `s = rθ` / `ω = Δθ/Δt` / `α = Δω/Δt`
- `v = rω` / `a_tan = rα` / `a_rad = ω²r`
- Ecuaciones con α constante (análogas a MRUA)

---

### SIM 12 — Momento de Inercia ✅ (funcional)
- `I = Σmᵢrᵢ²` / `I = ∫r²dm`
- `K = ½Iω²`
- `I_P = I_cm + Md²`
- `I = ¹⁄₁₂ML²` (varilla, centro) / `I = ¹⁄₃ML²` (varilla, extremo)

---

## Arquitectura estándar de cada simulador

```
NNN_nombre/
├── index.php        ← Sirve el HTML + pasa CFG al JS vía json_encode()
│
├── php/
│   ├── config.php   ← getSimConfig(): límites, textos, parámetros
│   └── formulas.php ← HTML del tab "Fórmulas" (incluido con include())
│
├── css/sim.css      ← Dark theme, variables CSS, layout Grid 3 columnas
│
├── js/engine.js     ← Física PURA. Sin DOM. Expone: init(), step(dt),
│                       seekTo(t), getState(), getSustitucion(), setters…
│
├── js/render.js     ← Canvas. Lee Engine. Loop requestAnimationFrame.
│                       Llama syncTimeline(st) al final de cada frame.
│
└── js/ui.js         ← Conecta HTML ↔ Engine ↔ Renderer.
                        bindControls(), bindTimeline(), syncAll()…
```

**Layout CSS Grid estándar:**
```
┌─────────────┬──────────────────────┬─────────────┐
│ Panel izq.  │  Canvas / Pista      │ Panel der.  │
│ ~250px      │  (flex: 1)           │ ~260px      │
│ Parámetros  ├──────────────────────┤ Resolución  │
│ sliders     │  ── TIMELINE BAR ──  │ en vivo     │
│             ├──────────────────────┤             │
│             │  Gráficas x(t) v(t)  │             │
└─────────────┴──────────────────────┴─────────────┘
```

---

## Extras — Menciones Honoríficas
*(Archivos independientes, NO se modifican)*

| Archivo | Tema |
|---------|------|
| `simulador_ABS.html` | Transformada de Laplace |
| `simulador_transporte.html` | Rutas de transporte (grafos) |

Se muestran en el portal con sección especial **"Otros proyectos"**.

---

## Próximos pasos

1. **Añadir timeline a SIM 01** (Energía en la Pista) — único animado ya construido sin ella
2. **SIM 05 — MRU y MRUA** — siguiente en la secuencia, incluye timeline desde el inicio
3. **SIM 06 — Proyectiles** — cinemática 2D, timeline + vista 2D del canvas
4. **SIM 07, 08, 09** — completar cinemática circular, Newton y trabajo
5. **SIM 10** — potencia (calculadora, sin timeline)
6. **Portal `index.php`** — si aún no está refinado, vistas por semana y categoría
