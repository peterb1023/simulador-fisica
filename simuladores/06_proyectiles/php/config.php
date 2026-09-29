<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 06
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Proyectiles',
        'subtitulo' => 'Trayectoria parabólica con componentes vx y vy en tiempo real',
        'sim_num'   => '06',
        'semana'    => '4',
        'limites'   => [
            'v0_min'    =>  5,
            'v0_max'    => 40,
            'alpha_min' =>  0,
            'alpha_max' => 90,
            'y0_min'    =>  0,
            'y0_max'    => 30,
            'g'         =>  9.8,
        ],
    ];
}