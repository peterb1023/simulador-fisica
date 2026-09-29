<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 07
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Movimiento Circular',
        'subtitulo' => 'arad y atan en tiempo real — MCU y MCUV',
        'sim_num'   => '07',
        'semana'    => '6',
        'limites'   => [
            'R_min'     =>  1,
            'R_max'     => 10,
            'v_min'     =>  1,
            'v_max'     => 20,
            'atan_min'  =>  0,
            'atan_max'  => 10,
        ],
    ];
}
