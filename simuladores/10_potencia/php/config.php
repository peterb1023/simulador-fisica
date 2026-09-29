<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 10
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Potencia',
        'subtitulo' => 'Calculadora interactiva con resolución paso a paso',
        'sim_num'   => '10',
        'semana'    => '9–10',
        'limites'   => [
            'W_max'   => 100000,   // J
            'P_max'   =>  50000,   // W
            'F_max'   =>  10000,   // N
            'v_max'   =>    200,   // m/s
            't_max'   =>   3600,   // s (1 hora)
            'hp_to_w' =>    746,
        ],
    ];
}