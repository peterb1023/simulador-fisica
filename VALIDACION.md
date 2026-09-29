# Evidencia de validación — 2026-09-29

## Entorno y resultados

Windows; PHP CLI/XAMPP 8.2.12; Node.js 24.19.0. Aplicación servida en `127.0.0.1:8765` mediante PHP CLI. No se conectó ni modificó `fisica_grupos`.

- `php -l`: **39 PHP sin errores**.
- `node --check`: **43 JS sin errores**.
- `node tests/numerical.cjs`: **PASS**, 12 motores reales en contextos VM aislados; casos solicitados, entradas inválidas, ceros, NaN/Infinity, conservación de energía, fricción por tramos, seek determinista, 30/60/120 Hz y Canvas DPR 1/2 mediante dobles de prueba.
- `node tests/http-smoke.cjs`: **PASS**, 15 páginas (portal, 12 simuladores, 2 extras) y 70 páginas/recursos locales; ninguna referencia HTTP local rota.
- `git diff --check`: sin errores de whitespace.
- Búsqueda de TODO/FIXME/console.log en aplicación: sin hallazgos; búsqueda de credenciales/tokens: sin credenciales detectadas. No hay temporales/cachés/logs generados dentro del proyecto.

## Navegador real

Chromium integrado de Codex: portal y SIM 01–12 cargan; se esperó al inicio de renderers y se abrieron/cerraron sus pestañas Fórmulas. Sin errores de consola en los doce simuladores. No quedan inputs/selects sin label o nombre accesible según inspección DOM.

- Móvil 390×844: los 12 simuladores sin desbordamiento horizontal de documento. Canvas con área visible; SIM 03 es calculadora sin Canvas activo.
- Escritorio 1280×800: los 12 simuladores y sus fórmulas cargan sin desbordamiento horizontal.
- Tablet 820×1180: inspección visual de Proyectiles y layout con panel derecho debajo.
- Los siete timelines responden a Home/ArrowRight/End. Proyectiles alcanza el tiempo de vuelo exacto y reproducir desde el final vuelve a cero (corregida tolerancia de redondeo).
- Productos A/B visibles en SIM 02; eficiencia SIM 10 devuelve 50 % para 500/1000 y explica división por cero.
- DPR=1 observado en el navegador real; DPR=2 verificado en prueba del helper. No se afirma una inspección visual real en pantalla DPR=2.

La inspección no sustituye pruebas cruzadas en Firefox/Safari/Edge ni una auditoría completa con lector de pantalla. Headers y bloqueos de `.htaccess` deben comprobarse al instalar en Apache: PHP CLI no los aplica.

## Extras y legado conservados

Los dos extras son idénticos al baseline (`git diff e166ddf -- extras` sin diferencias). ABS carga. Transporte carga pero conserva un error preexistente:

`ReferenceError: bC is not defined`, `extras/simulador_transporte.html:509`, en `buildAugmented`, llamado desde `update` (línea 488) al iniciar (línea 663).

No se corrige por instrucción expresa de no modificar funcionalmente los extras. Se avisa desde el portal. La etiqueta «Probado» se aplica a los doce simuladores y sus pruebas numéricas, no al funcionamiento del extra de transporte.

Archivos de motor/render/UI de la raíz y renderer heredado de SIM 03 no se cargan en las páginas actuales; se documentan como legado y se conservan. `.claude/settings.local.json` conserva su contenido; no hay referencias activas del proyecto a esa configuración. Se mantiene disponible para desarrollo y se excluye de `git archive`.

## Historial

Baseline original: `e166ddf`. Fases 0–7: `0e93e53`, `154390a`, `0b9193d`, `7450f03`, `4126906`, `19d77b7`, `9c2e6b0`, `54e2ad8`. Esta evidencia se incorpora al commit de fase 8, junto con limpieza, README, plan y portal.

Los residuos `files (3).zip` y `Nuevo documento de texto.html` se retiraron únicamente en fase 8; ambos son recuperables desde el baseline.

## Rescate A — registros locales
- Capturas manuales unificadas en los doce simuladores; máximo 100 por simulador. No se guardan frames ni se duplica el historial temporal.
- JSON validado, snapshots independientes, almacenamiento bloqueado/corrupto tolerado, borrado individual y limpieza. Render con textContent.
- GREEN: numerical.cjs, registry.cjs y http-smoke.cjs (15 páginas, 73 recursos). Captura por teclado verificada en los doce simuladores; sin overflow del documento en 390/1024/1440 px.

## Rescate B — SIM 13: llanta compuesta
Integrado tras validar por integración radial independiente I = ∫r²dm. Modelo homogéneo: dos paredes anulares y huella cilíndrica sin solapamiento; no incluye aro, buje ni radios. Entrada SI, radios ordenados, 2tp ≤ w, densidad positiva, rechazo de NaN/Infinity y desbordamientos. La masa se deriva de densidad y volumen; densidad cero/negativa se rechaza. Ri=0 y ω=0 son válidos.
Animación con reloj común, timeline analítica de 20 s y Canvas DPR; corte muestra ambas paredes. Registros locales compartidos. `node tests/sim13.cjs` GREEN; navegador 390/1024/1440 px sin overflow ni errores de consola.

## Rescate C — grupos aislados
`modules/groups/` recupera cuentas nuevas, grupos, invitaciones, membresía y guardado explícito de registros locales. Desactivado por defecto y sin enlaces desde el portal. Configuración y despliegue en `modules/groups/README.md`; esquema limpio en `database/schema.sql`. No se importaron datos ni hashes del donante.
GREEN: `node tests/groups.cjs` contra MariaDB temporal (login, fijación de sesión, logout, CSRF, autorización, JSON/tamaño/simulador, XSS y SQLi), `node tests/groups-ui.cjs` y las suites numerical/registry/sim13/http-smoke. Sintaxis: 44 PHP y 55 JS/CJS sin errores. Portal y 13 simuladores sin errores de consola; 16 páginas y 78 recursos locales sin referencias rotas. Smoke en 390/1024/1440 px; seek compartido no crea registros. Base temporal y procesos de prueba retirados.
Sin regresiones encontradas. Extras sin cambios: persiste el error histórico `bC is not defined` del transporte. Pendiente de decisión: rescate visual del bloque D; despliegue público y migración de usuarios quedan fuera de este módulo aislado.
