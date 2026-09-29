<?php
// ============================================================
//  config.php  —  Configuración server-side SIM 02
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'       => 'Vectores',
        'subtitulo'    => 'Plano Cartesiano Interactivo',
        'sim_num'      => '02',
        'max_vectores' => 999,
        'formulas'     => [
            'cartesiana' => 'V = (Vx, Vy)',
            'unitarios'  => 'V = Vx·î + Vy·ĵ',
            'polares_x'  => 'Vx = r·cosθ',
            'polares_y'  => 'Vy = r·senθ',
            'magnitud'   => 'r = √(Vx²+Vy²)',
            'angulo'     => 'θ = tan⁻¹(Vy/Vx)',
            'resultante' => 'R = √(Rx²+Ry²)',
            'suma_x'     => 'Rx = ΣVx',
            'suma_y'     => 'Ry = ΣVy',
            'ley_coseno' => 'R = √(A²+B²+2AB·cosθ)',
            'ley_seno'   => 'A/senα = B/senβ = R/senθ',
        ],
    ];
}
