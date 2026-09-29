# Plan Maestro — Simuladores de Física I
**Proyecto:** Lab virtual de Física I  
**Stack:** PHP + HTML5 Canvas + JS vanilla  
**Servidor:** XAMPP (Apache)  
**Última actualización:** 2026-09-29

---

## Estado actual del proyecto

| # | Nombre | Estado | Timeline | Notas |
|---|--------|--------|----------|-------|
| 01 | Energía en la Pista | Pruebas numéricas GREEN | Sí | RK4 determinista en pista parabólica; calor viscoso |
| 02 | Vectores | Pruebas numéricas GREEN | N/A | Suma, componentes, producto punto y componente z del cruz |
| 03 | Conversión de Unidades | Pruebas numéricas GREEN | N/A | Conversiones y temperatura con validación |
| 04 | Cinemática 1D | Pruebas numéricas GREEN | Sí | Timeline conservado; tiempo real e historial acotado |
| 05 | MRU y MRUA | Pruebas numéricas GREEN | Sí | Timeline conservado; tiempo real e historial acotado |
| 06 | Proyectiles | Pruebas numéricas GREEN | Sí | Vuelo analítico y fórmulas coherentes |
| 07 | Movimiento Circular | Pruebas numéricas GREEN | Sí | Ángulo analítico, velocidad con signo |
| 08 | Leyes de Newton | Pruebas numéricas GREEN | Sí | Plano inclinado, fricción estática/cinética por tramos |
| 09 | Trabajo | Pruebas numéricas GREEN | Sí | Resorte: trabajo externo cuasiestático = ΔU |
| 10 | Potencia | Pruebas numéricas GREEN | N/A | Eficiencia y validación de divisores |
| 11 | Cinemática Rotacional | Pruebas numéricas GREEN | Excluido | Solución analítica sin saturación física |
| 12 | Momento de Inercia | Pruebas numéricas GREEN | Excluido | Fórmulas de cuerpos y ejes paralelos desde Icm |

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
│   ├── 01_energia/            ← Implementado
│   │   ├── index.php
│   │   ├── php/config.php
│   │   ├── php/formulas.php
│   │   ├── css/sim.css
│   │   ├── js/engine.js
│   │   ├── js/render.js
│   │   └── js/ui.js
│   │
│   ├── 02_vectores/           ← Implementado + CORREGIDO
│   │   └── (misma estructura)
│   │
│   ├── 03_unidades/           ← Implementado + CORREGIDO
│   │   └── (misma estructura)
│   │
│   ├── 04_cinematica_1d/      ← Implementado + MEJORADO (timeline ✅)
│   │   └── (misma estructura)
│   │
│   ├── 05_mru_mrua/           ← Implementado y probado
│   ├── 06_proyectiles/        ← Implementado y probado
│   ├── 07_circular/           ← Implementado y probado
│   ├── 08_newton/             ← Implementado y probado
│   ├── 09_trabajo/            ← Implementado y probado
│   ├── 10_potencia/           ← Implementado y probado
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

**Motor:** `seekTo(t)` y `stateAt(t)` (o funciones equivalentes en 04/05) calculan el estado sin depender de frames previos. Las soluciones analíticas se muestrean con `SimCommon.samples`: máximo 242 puntos. SIM 01 no tiene solución elemental en esta pista: usa checkpoints RK4 a 240 Hz durante 20 s (4801 estados), con paso parcial para seek exacto; el cambio de parámetros reconstruye esa caché acotada.

**Controles:** 04/05 conservan sus APIs y bindings. 01/06/07/08/09 usan `js/timeline.js`. Arrastrar pausa; se reanuda con ▶, y reproducir desde el final vuelve a cero. Duraciones: 01/07=20 s, 08=10 s, 09=4 s de presentación, 06=tiempo de vuelo, 04/05=configurable.

Los fragmentos siguientes documentan la API original de 04/05; el código real tiene prioridad:

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
- `θ = atan2(Vy,Vx)`
- `Rx = ΣVx` / `Ry = ΣVy`
- `R = √(Rx²+Ry²)` / `θR = atan2(Ry,Rx)`
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
- `W_ext = ΔU = ½k(x₂² − x₁²)` (resorte cuasiestático); `W_resorte = −ΔU`, `ΔK = 0`

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

## Remediación completada y validación

Fases 0–8 ejecutadas secuencialmente con commits separados. Baseline original: `e166ddf`. Comando de suite: `node tests/numerical.cjs`.

Se mantienen PHP + JavaScript vanilla y la separación engine/render/ui. Utilidades comunes: reloj, muestreo y validación (`js/sim-common.js`), Canvas/DPR (`js/canvas-common.js`), timeline, accesibilidad y estilos compartidos. No se integra `fisica_grupos`: no hay dependencia en el código actual.

Se eliminaron los dos residuos indicados después de conservarlos en el baseline. `.claude/` se conserva para desarrollo y se excluye de `git archive`. Los extras se conservan sin modificaciones funcionales. Smoke detecta `bC is not defined` en transporte (línea 509), conservado fuera de alcance.

Ver README.md, DEPLOYMENT.md y VALIDACION.md para ejecución, evidencia y límites reales. Las pruebas numéricas no equivalen a una auditoría exhaustiva de todas las combinaciones de interfaz ni de todos los navegadores.

## Rescate B — SIM 13: llanta compuesta
Integrado tras validar por integración radial independiente I = ∫r²dm. Modelo homogéneo: dos paredes anulares y huella cilíndrica sin solapamiento; no incluye aro, buje ni radios. Entrada SI, radios ordenados, 2tp ≤ w, densidad positiva, rechazo de NaN/Infinity y desbordamientos. La masa se deriva de densidad y volumen; densidad cero/negativa se rechaza. Ri=0 y ω=0 son válidos.
Animación con reloj común, timeline analítica de 20 s y Canvas DPR; corte muestra ambas paredes. Registros locales compartidos. `node tests/sim13.cjs` GREEN; navegador 390/1024/1440 px sin overflow ni errores de consola.

## Rescate C — grupos aislados
`modules/groups/` recupera cuentas nuevas, grupos, invitaciones, membresía y guardado explícito de registros locales. Desactivado por defecto y sin enlaces desde el portal. Configuración y despliegue en `modules/groups/README.md`; esquema limpio en `database/schema.sql`. No se importaron datos ni hashes del donante.
GREEN: `node tests/groups.cjs` contra MariaDB temporal (login, fijación de sesión, logout, CSRF, autorización, JSON/tamaño/simulador, XSS y SQLi), `node tests/groups-ui.cjs` y las suites numerical/registry/sim13/http-smoke. Sintaxis: 44 PHP y 55 JS/CJS sin errores. Portal y 13 simuladores sin errores de consola; 16 páginas y 78 recursos locales sin referencias rotas. Smoke en 390/1024/1440 px; seek compartido no crea registros. Base temporal y procesos de prueba retirados.
Sin regresiones encontradas. Extras sin cambios: persiste el error histórico `bC is not defined` del transporte. Pendiente de decisión: rescate visual del bloque D; despliegue público y migración de usuarios quedan fuera de este módulo aislado.
