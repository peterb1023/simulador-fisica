<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/modules/groups/config.php';

try {
    $pdo = groupsConnection();
} catch (Throwable $e) {
    fwrite(STDERR, "Error al conectar con la base de datos: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

$commonPassword = '12345';
$total = 0;
$created = 0;
$skipped = 0;

echo "==================================================" . PHP_EOL;
echo " PROVISIONAMIENTO DE CUENTAS TEMPORALES DE LAB    " . PHP_EOL;
echo "==================================================" . PHP_EOL;

$checkStmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
$insertStmt = $pdo->prepare('INSERT INTO usuarios (nombre, email, password_hash, activo) VALUES (?, ?, ?, 1)');

for ($i = 2; $i <= 40; $i++) {
    $total++;
    $num = str_pad((string)$i, 2, '0', STR_PAD_LEFT);
    $name = "PC $num";
    $email = "pc{$num}@example.test";

    $checkStmt->execute([$email]);
    $existing = $checkStmt->fetchColumn();

    if ($existing !== false) {
        $skipped++;
        printf(" - [%s] %-18s -> YA EXISTÍA\n", $name, $email);
        continue;
    }

    try {
        $hash = password_hash($commonPassword, PASSWORD_DEFAULT);
        $insertStmt->execute([$name, $email, $hash]);
        $created++;
        printf(" - [%s] %-18s -> CREADA\n", $name, $email);
    } catch (Throwable $e) {
        fwrite(STDERR, sprintf("Error al crear la cuenta %s (%s): %s\n", $name, $email, $e->getMessage()));
        exit(1);
    }
}

echo "==================================================" . PHP_EOL;
echo "RESUMEN FINAL:" . PHP_EOL;
echo " Total procesadas: $total" . PHP_EOL;
echo " Creadas:          $created" . PHP_EOL;
echo " Omitidas:         $skipped" . PHP_EOL;
echo "==================================================" . PHP_EOL;
