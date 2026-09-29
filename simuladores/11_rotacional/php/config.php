<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 11
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Cinemática Rotacional',
        'subtitulo' => 'Disco girando — ω, α, v_tan, a_rad en tiempo real',
        'sim_num'   => '11',
        'semana'    => '12',
        'limites'   => [
            'R_min'     => 0.1,
            'R_max'     => 3.0,
            'alpha_min' => -8.0,
            'alpha_max' =>  8.0,
            'w0_min'    =>  0.0,
            'w0_max'    => 10.0,
        ],
    ];
}