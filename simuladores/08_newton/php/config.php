<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 08
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Leyes de Newton',
        'subtitulo' => 'Diagrama de cuerpo libre interactivo — ΣF = ma',
        'sim_num'   => '08',
        'semana'    => '7–8',
        'limites'   => [
            'm_min'   =>  1,
            'm_max'   => 20,
            'F_min'   =>  0,
            'F_max'   => 150,
            'phi_min' =>  0,
            'phi_max' => 60,
            'mu_min'  =>  0,
            'mu_max'  =>  1,
            'g'       =>  9.8,
        ],
    ];
}