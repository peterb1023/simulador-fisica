<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 12
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Momento de Inercia',
        'subtitulo' => 'Comparador visual — I, K rotacional, ejes paralelos',
        'sim_num'   => '12',
        'semana'    => '13',
        'limites'   => [
            'M_min'   =>  0.5,
            'M_max'   => 20.0,
            'L_min'   =>  0.1,
            'L_max'   =>  4.0,
            'R_min'   =>  0.1,
            'R_max'   =>  2.0,
            'd_min'   =>  0.0,
            'd_max'   =>  3.0,
            'w_min'   =>  0.0,
            'w_max'   => 10.0,
        ],
    ];
}