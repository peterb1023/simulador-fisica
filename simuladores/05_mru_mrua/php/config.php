<?php
// ============================================================
//  CONFIG — Configuración y límites de la simulación
// ============================================================

define('SIM_VERSION', '05');
define('SIM_TITLE',   'MRU y MRUA');
define('SIM_SUBTITLE','Comparación visual: velocidad constante vs aceleración constante');

// Límites de los parámetros
define('MRU_X0_MIN',  -40);
define('MRU_X0_MAX',   40);
define('MRU_V_MIN',   -20);
define('MRU_V_MAX',    20);

define('MRUA_X0_MIN', -40);
define('MRUA_X0_MAX',  40);
define('MRUA_V0_MIN', -20);
define('MRUA_V0_MAX',  20);
define('MRUA_A_MIN',  -10);
define('MRUA_A_MAX',   10);

define('T_MAX_MIN',    1);
define('T_MAX_DEFAULT',8);

define('GRAVITY',      9.8);

// Valores por defecto
$defaults = [
  'mru_x0'  => 0,
  'mru_v'   => 8,
  'mrua_x0' => 0,
  'mrua_v0' => 8,
  'mrua_a'  => -2,
  't_max'   => T_MAX_DEFAULT,
];
