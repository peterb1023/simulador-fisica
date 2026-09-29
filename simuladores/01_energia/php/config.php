<?php
// ============================================================
//  config.php  —  Configuración del simulador (server-side)
//  Aquí vive la lógica protegida: fórmulas y constantes
// ============================================================

function getSimConfig(): array {
    return [
        'titulo'    => 'Energía en la Pista',
        'masa_min'  => 5,
        'masa_max'  => 100,
        'h_max'     => 8,
        'g_default' => 9.8,
        // Fórmulas visibles al estudiante (solo texto, no lógica)
        'formulas'  => [
            'Ep' => 'U = m · g · h',
            'Ec' => 'K = ½ · m · v²',
            'Et' => 'E = K + U',
            'Wg' => 'W_grav = −ΔU',
        ],
    ];
}
