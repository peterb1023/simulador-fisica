# Pruebas

Desde la raíz: `node tests/numerical.cjs`. Node.js 18 o posterior, sin dependencias.

Carga los motores reales en contextos aislados. Verifica los 12 simuladores, conservación de energía, fricción por tramos, entradas inválidas, casos límite, seek y 30/60/120 Hz. Tolerancia habitual: 1e-7; integración de energía: 1e-5 J.

## Rescate C/A/B/D
Ejecutar desde VERSION DE CODEX (PowerShell):
```powershell
node tests/numerical.cjs
node tests/sim13.cjs
node tests/registry.cjs
node tests/records-ui.cjs
node tests/groups-ui.cjs
node tests/groups-hook.cjs
node tests/selected-ui.cjs
node tests/groups.cjs
$env:SIM_BASE_URL='http://127.0.0.1:8770/'
node tests/http-smoke.cjs
node tests/privacy.cjs
```
HTTP requiere un servidor local: `C:\xampp\php\php.exe -S 127.0.0.1:8770 -t .` en otra terminal.
Grupos crea MariaDB temporal aislada; véase modules/groups/README.md. Privacy inspecciona el staging antes del commit y no sustituye revisar la procedencia de datos.

Sintaxis completa:
```powershell
Get-ChildItem -Recurse -Filter *.php | ForEach-Object { & C:\xampp\php\php.exe -l $_.FullName }
Get-ChildItem -Recurse -File | Where-Object Extension -in '.js','.cjs' | ForEach-Object { node --check $_.FullName }
```
`selected-ui.cjs` verifica entradas, sincronización y renderers reales 06/12 a DPR 1/2 en lienzos estrechos/medianos/anchos. `records-ui.cjs` carga los 13 motores y comprueba captura manual, borrado, limpieza, recarga, corrupción y aislamiento de seek. `sim13.cjs` usa referencias independientes, integral radial y límites analíticos.
