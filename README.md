# Simuladores de Física I

Laboratorio de 12 simuladores en PHP, JavaScript vanilla y Canvas. Sin base de datos ni dependencias npm para ejecutar la aplicación.

## Requisitos e instalación

- PHP **7.3 mínimo** (JSON_THROW_ON_ERROR); validado localmente con la versión de XAMPP indicada en VALIDACION.md.
- XAMPP con Apache 2.4, o PHP CLI para desarrollo local.
- Node.js 18+ para la suite numérica.

Copiar esta carpeta a `C:/xampp/htdocs/simulador_fisica`, iniciar Apache y abrir `http://localhost/simulador_fisica/`. No iniciar MySQL: `fisica_grupos` no está integrada.

Alternativa local, desde la raíz: `php -S 127.0.0.1:8765 -t .`; abrir `http://127.0.0.1:8765/`. Este servidor ignora `.htaccess`; usar únicamente para desarrollo local. Recomendaciones Apache en DEPLOYMENT.md.

## Estructura

- `index.php`: portal por semana/categoría; «Probado» indica que pasa la suite numérica.
- `simuladores/01_energia` … `12_inercia`: cada módulo mantiene `engine.js`, `render.js`, `ui.js`, configuración y contenido pedagógico PHP.
- `js/sim-common.js`, `canvas-common.js`, `timeline.js`, `accessibility.js`: utilidades pequeñas compartidas.
- `css/`: bases compartidas, timeline y responsive/accesibilidad.
- `tests/`: pruebas sin frameworks ni instalación de paquetes.
- `extras/`: proyectos históricos independientes, conservados intactos.
- `.claude/`: configuración de desarrollo preexistente; excluida de la distribución.

Los archivos originales `js/engine.js`, `js/render.js`, `js/ui.js` y `php/formulas.php` de la raíz son legado no cargado por el portal actual; no constituyen otro simulador activo. SIM 03 tampoco carga su renderer vectorial heredado.

## Pruebas

`node tests/numerical.cjs`

Cubre los doce motores, casos físicos conocidos, conservación de energía, fricción, entradas inválidas, ceros, NaN/Infinity, determinismo temporal y comparación 30/60/120 Hz. Tolerancias y detalles en tests/README.md. La comprobación de recursos HTTP locales se ejecuta con el servidor activo: `node tests/http-smoke.cjs`.

Para revisar sintaxis en PowerShell:

```powershell
Get-ChildItem -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Navegadores y accesibilidad

Objetivo: versiones actuales de Chrome, Edge, Firefox y Safari con Canvas 2D, ResizeObserver y CSS :has(). Smoke real en Chromium integrado; no se afirma prueba cruzada en los otros motores. Controles nativos por teclado, focus visible, labels y resúmenes textuales del Canvas. Layout móvil/tablet/escritorio y backing store adaptado a DPR.

Google Fonts es opcional; sin Internet se usan sans-serif/monospace. No cambia el motor físico.

## Modelos y limitaciones

- 01: pista física x=5q, y=h₀q²; una sola velocidad. Integración RK4 a 240 Hz y checkpoints de 20 s. Fricción viscosa F=−0.35mv, no Coulomb.
- 04/05: duración configurable; gráficas con máximo 242 puntos. 06: gravedad fija 9.8 m/s², sin aire, suelo y=0. Trayectoria y(x) no definida para lanzamiento vertical.
- 07: componente tangencial con signo; T instantáneo cuando hay aceleración. 08: fricción de Coulomb por tramos con μs≥μk; reinicio al variar parámetros, cámara de seguimiento. Se permite desprendimiento cuando N=0.
- 09: cuatro segundos de presentación del área bajo F(s), no tiempo físico de una trayectoria. Resorte cuasiestático: W_ext=ΔU, W_resorte=−ΔU, ΔK=0. Si el trabajo negativo excede la energía cinética inicial se indica desplazamiento no alcanzable.
- 11/12: sin timeline por alcance del proyecto. Límites de longitud de flechas son exclusivamente visuales.
- Extras: se verifica carga; transporte conserva el fallo preexistente `bC is not defined` en su línea 509. No se modificó por instrucción expresa. Sus modelos y accesibilidad no forman parte de esta remediación.
- No incluye autenticación ni integración de la base histórica. CSP restrictiva pendiente de migrar handlers inline; ver DEPLOYMENT.md.

Distribución sin configuración de desarrollo: `git archive --format=zip --output=../simulador_fisica.zip HEAD`. La copia original de residuos queda recuperable desde el baseline.

## Rescate B — SIM 13: llanta compuesta
Integrado tras validar por integración radial independiente I = ∫r²dm. Modelo homogéneo: dos paredes anulares y huella cilíndrica sin solapamiento; no incluye aro, buje ni radios. Entrada SI, radios ordenados, 2tp ≤ w, densidad positiva, rechazo de NaN/Infinity y desbordamientos. La masa se deriva de densidad y volumen; densidad cero/negativa se rechaza. Ri=0 y ω=0 son válidos.
Animación con reloj común, timeline analítica de 20 s y Canvas DPR; corte muestra ambas paredes. Registros locales compartidos. `node tests/sim13.cjs` GREEN; navegador 390/1024/1440 px sin overflow ni errores de consola.

## Rescate C — grupos aislados
`modules/groups/` recupera cuentas nuevas, grupos, invitaciones, membresía y guardado explícito de registros locales. Desactivado por defecto y sin enlaces desde el portal. Configuración y despliegue en `modules/groups/README.md`; esquema limpio en `database/schema.sql`. No se importaron datos ni hashes del donante.
GREEN: `node tests/groups.cjs` contra MariaDB temporal (login, fijación de sesión, logout, CSRF, autorización, JSON/tamaño/simulador, XSS y SQLi), `node tests/groups-ui.cjs` y las suites numerical/registry/sim13/http-smoke. Sintaxis: 44 PHP y 55 JS/CJS sin errores. Portal y 13 simuladores sin errores de consola; 16 páginas y 78 recursos locales sin referencias rotas. Smoke en 390/1024/1440 px; seek compartido no crea registros. Base temporal y procesos de prueba retirados.
Sin regresiones encontradas. Extras sin cambios: persiste el error histórico `bC is not defined` del transporte. Pendiente de decisión: rescate visual del bloque D; despliegue público y migración de usuarios quedan fuera de este módulo aislado.
