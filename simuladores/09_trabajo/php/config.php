<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 09
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Trabajo',
        'subtitulo' => 'Fuerza, desplazamiento y teorema trabajo-energía',
        'sim_num'   => '09',
        'semana'    => '9',
        'limites'   => [
            'F_min'   =>   0,
            'F_max'   => 100,     // Newtons
            'phi_min' =>   0,
            'phi_max' =>  90,     // grados (ángulo entre F y desplazamiento)
            's_min'   =>   1,
            's_max'   =>  20,     // metros de desplazamiento
            'm_min'   =>   1,
            'm_max'   =>  50,     // kg (para teorema trabajo-energía)
            'v0_min'  =>   0,
            'v0_max'  =>  20,     // m/s velocidad inicial
            'k_min'   =>  10,
            'k_max'   => 200,     // N/m constante de resorte [AGREGADA]
            'x_min'   =>   0,
            'x_max'   =>   2,     // metros estiramiento resorte [AGREGADA]
        ],
    ];
}