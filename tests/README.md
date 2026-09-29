# Pruebas

Desde la raíz: `node tests/numerical.cjs`. Node.js 18 o posterior, sin dependencias.

Carga los motores reales en contextos aislados. Verifica los 12 simuladores, conservación de energía, fricción por tramos, entradas inválidas, casos límite, seek y 30/60/120 Hz. Tolerancia habitual: 1e-7; integración de energía: 1e-5 J.
