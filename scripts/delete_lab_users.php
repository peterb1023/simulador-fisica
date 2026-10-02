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

// Generar lista fija de los 39 correos exclusivos de laboratorio (pc02 a pc40)
$labEmails = [];
for ($i = 2; $i <= 40; $i++) {
    $labEmails[] = sprintf('pc%02d@example.test', $i);
}

// Consultar cuáles de ellos existen actualmente
$inPlaceholders = implode(',', array_fill(0, count($labEmails), '?'));
$stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE email IN ($inPlaceholders)");
$stmt->execute($labEmails);
$usersToDelete = $stmt->fetchAll();

if (empty($usersToDelete)) {
    echo "No se encontraron cuentas de laboratorio (pc02 a pc40) para eliminar." . PHP_EOL;
    exit(0);
}

echo "==================================================" . PHP_EOL;
echo " LIMPIEZA DE CUENTAS TEMPORALES DE LAB (PC02-PC40)" . PHP_EOL;
echo "==================================================" . PHP_EOL;
echo "Se encontraron " . count($usersToDelete) . " cuenta(s) de laboratorio para eliminar:" . PHP_EOL;
foreach ($usersToDelete as $u) {
    echo " - " . $u['nombre'] . " (" . $u['email'] . ")" . PHP_EOL;
}
echo PHP_EOL;

fwrite(STDOUT, "¿Eliminar las " . count($usersToDelete) . " cuentas LAB PC02-PC40? [y/N]: ");
$confirmation = trim((string)fgets(STDIN));

if (strtolower($confirmation) !== 'y' && strtolower($confirmation) !== 'yes') {
    echo "Operación cancelada. No se realizaron cambios." . PHP_EOL;
    exit(0);
}

$userIds = array_map(fn($row) => (int)$row['id'], $usersToDelete);
$idPlaceholders = implode(',', array_fill(0, count($userIds), '?'));

try {
    $pdo->beginTransaction();

    // 1. Limpiar simulaciones guardadas por estos usuarios
    $delSims = $pdo->prepare("DELETE FROM simulaciones WHERE usuario_id IN ($idPlaceholders)");
    $delSims->execute($userIds);

    // 2. Limpiar membresías de grupos de estos usuarios
    $delMembers = $pdo->prepare("DELETE FROM grupo_miembros WHERE usuario_id IN ($idPlaceholders)");
    $delMembers->execute($userIds);

    // 3. Si algún usuario de lab fue líder de grupos creados durante la prueba:
    $groupLeaderStmt = $pdo->prepare("SELECT id FROM grupos WHERE lider_id IN ($idPlaceholders)");
    $groupLeaderStmt->execute($userIds);
    $ownedGroupIds = $groupLeaderStmt->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($ownedGroupIds)) {
        $grpPlaceholders = implode(',', array_fill(0, count($ownedGroupIds), '?'));
        $pdo->prepare("DELETE FROM simulaciones WHERE grupo_id IN ($grpPlaceholders)")->execute($ownedGroupIds);
        $pdo->prepare("DELETE FROM grupo_miembros WHERE grupo_id IN ($grpPlaceholders)")->execute($ownedGroupIds);
        $pdo->prepare("DELETE FROM grupos WHERE id IN ($grpPlaceholders)")->execute($ownedGroupIds);
    }

    // 4. Eliminar los usuarios de laboratorio
    $delUsers = $pdo->prepare("DELETE FROM usuarios WHERE id IN ($idPlaceholders)");
    $delUsers->execute($userIds);

    $pdo->commit();

    echo "==================================================" . PHP_EOL;
    echo "Se eliminaron correctamente " . count($userIds) . " cuenta(s) de laboratorio." . PHP_EOL;
    echo "Los usuarios demo y cuentas regulares se mantienen intactos." . PHP_EOL;
    echo "==================================================" . PHP_EOL;
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fwrite(STDERR, "Error durante la eliminación: " . $e->getMessage() . PHP_EOL);
    exit(1);
}
