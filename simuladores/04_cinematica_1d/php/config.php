<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 04
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Cinemática 1D',
        'subtitulo' => 'Gráficas x(t) y v(t) animadas en tiempo real',
        'sim_num'   => '04',
        'semana'    => '3',
        'limites'   => [
            'x0_min'  => -50,
            'x0_max'  =>  50,
            'v0_min'  => -20,
            'v0_max'  =>  20,
            'a_min'   => -10,
            'a_max'   =>  10,
            't_max'   =>  10,   // segundos máximos de simulación
            'g'       =>   9.8,
        ],
    ];
}