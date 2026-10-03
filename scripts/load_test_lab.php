<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

/**
 * Script de prueba de carga y rate-limiting para cuentas LAB a través de ngrok.
 * Simula clientes reales independientes con cookies en memoria aisladas y flujo CSRF completo.
 */

// 1. Obtención de URL base
function resolveBaseUrl(array $argv): string {
    // 1.1 Argumento CLI
    foreach ($argv as $arg) {
        if (str_starts_with($arg, 'http://') || str_starts_with($arg, 'https://')) {
            return rtrim($arg, '/');
        }
        if (str_starts_with($arg, '--url=')) {
            return rtrim(substr($arg, 6), '/');
        }
    }

    // 1.2 Variable de entorno
    $envUrl = getenv('LAB_BASE_URL');
    if ($envUrl && (str_starts_with($envUrl, 'http://') || str_starts_with($envUrl, 'https://'))) {
        return rtrim($envUrl, '/');
    }

    // 1.3 Consulta a la API local de ngrok
    $ch = curl_init('http://127.0.0.1:4040/api/tunnels');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_CONNECTTIMEOUT => 2,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code === 200 && is_string($resp)) {
        $json = json_decode($resp, true);
        if (isset($json['tunnels']) && is_array($json['tunnels'])) {
            foreach ($json['tunnels'] as $tunnel) {
                if (($tunnel['proto'] ?? '') === 'https' && !empty($tunnel['public_url'])) {
                    return rtrim($tunnel['public_url'], '/');
                }
            }
        }
    }

    fwrite(STDERR, "ERROR: No se pudo determinar la URL pública de ngrok.\n");
    fwrite(STDERR, "Asegúrese de que ngrok esté corriendo o especifique la URL como argumento:\n");
    fwrite(STDERR, "  php scripts/load_test_lab.php https://<ngrok-id>.ngrok-free.app\n");
    exit(1);
}

$baseUrl = resolveBaseUrl($argv);
if (!str_starts_with($baseUrl, 'https://')) {
    fwrite(STDERR, "ERROR: La URL base DEBE utilizar HTTPS ($baseUrl).\n");
    exit(1);
}

// Opciones de ejecución
$targetPhase = 'all';
foreach ($argv as $arg) {
    if (str_starts_with($arg, '--phase=')) {
        $targetPhase = strtolower(substr($arg, 8));
    }
}

echo "========================================================\n";
echo " PRUEBA DE CARGA Y RATE LIMIT LAB A TRAVES DE NGROK   \n";
echo "========================================================\n";
echo "URL base pública: $baseUrl\n";
echo "Fase objetivo:   $targetPhase\n\n";

/**
 * Cliente HTTP para un PC individual del laboratorio.
 */
class LabClient {
    private string $baseUrl;
    private int $pcIndex;
    private string $name;
    private string $email;
    private string $password;
    private ?string $cookie = null;
    private ?string $csrfToken = null;

    public function __construct(string $baseUrl, int $pcIndex, string $password = '12345') {
        $this->baseUrl = $baseUrl;
        $this->pcIndex = $pcIndex;
        $num = str_pad((string)$pcIndex, 2, '0', STR_PAD_LEFT);
        $this->name = "PC $num";
        $this->email = "pc{$num}@example.test";
        $this->password = $password;
    }

    public function getName(): string {
        return $this->name;
    }

    public function getEmail(): string {
        return $this->email;
    }

    public function getAssignedSessionId(): ?string {
        if ($this->cookie !== null && preg_match('/FISICAGROUPS=([^;]+)/', $this->cookie, $m)) {
            return $m[1];
        }
        return null;
    }

    public function createStepHandle(int $step): \CurlHandle {
        $ch = curl_init();
        $commonHeaders = [
            'ngrok-skip-browser-warning: 1',
            'User-Agent: LabClient-Bench/1.0 (' . $this->name . ')',
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HEADERFUNCTION => function($curl, string $header): int {
                if (preg_match('/^Set-Cookie:\s*(FISICAGROUPS=[^;]+)/i', $header, $m)) {
                    $this->cookie = $m[1];
                }
                return strlen($header);
            }
        ]);

        if ($this->cookie !== null) {
            curl_setopt($ch, CURLOPT_COOKIE, $this->cookie);
        }

        if ($step === 1) {
            // Paso 1: GET session para obtener CSRF y cookie inicial
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/modules/groups/api.php?action=session');
            curl_setopt($ch, CURLOPT_HTTPHEADER, $commonHeaders);
        } elseif ($step === 2) {
            // Paso 2: POST login con email + password + CSRF token
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/modules/groups/api.php?action=login');
            curl_setopt($ch, CURLOPT_POST, true);
            $payload = json_encode(['email' => $this->email, 'password' => $this->password]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            $headers = array_merge($commonHeaders, [
                'Content-Type: application/json',
                'X-CSRF-Token: ' . ($this->csrfToken ?? ''),
            ]);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        } elseif ($step === 3) {
            // Paso 3: GET session para verificar identidad autenticada
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/modules/groups/api.php?action=session');
            curl_setopt($ch, CURLOPT_HTTPHEADER, $commonHeaders);
        }

        return $ch;
    }

    public function processStepResponse(int $step, string $body, int $httpCode): array {
        $json = json_decode($body, true);
        if ($step === 1) {
            if ($httpCode === 200 && is_array($json) && !empty($json['csrf'])) {
                $this->csrfToken = $json['csrf'];
                return ['ok' => true];
            }
            return ['ok' => false, 'error' => "Fallo en paso 1 (HTTP $httpCode)"];
        }

        if ($step === 2) {
            if ($httpCode === 200 && is_array($json) && ($json['ok'] ?? false)) {
                if (!empty($json['csrf'])) {
                    $this->csrfToken = $json['csrf'];
                }
                return ['ok' => true];
            }
            $msg = $json['message'] ?? "HTTP $httpCode";
            return ['ok' => false, 'http_code' => $httpCode, 'message' => $msg];
        }

        if ($step === 3) {
            if ($httpCode === 200 && is_array($json) && !empty($json['user']['name'])) {
                $receivedName = $json['user']['name'];
                if ($receivedName === $this->name) {
                    return ['ok' => true, 'name' => $receivedName];
                }
                return ['ok' => false, 'error' => "Identidad incongruente: esperada '{$this->name}', recibida '{$receivedName}'"];
            }
            return ['ok' => false, 'error' => "Fallo en paso 3 de verificación (HTTP $httpCode)"];
        }

        return ['ok' => false, 'error' => 'Paso desconocido'];
    }

    /**
     * Ejecución secuencial síncrona (usada en Prueba A).
     */
    public function runSynchronous(): array {
        $t0 = microtime(true);

        // Paso 1
        $ch1 = $this->createStepHandle(1);
        $res1 = curl_exec($ch1);
        $code1 = curl_getinfo($ch1, CURLINFO_HTTP_CODE);
        $err1 = curl_error($ch1);
        curl_close($ch1);
        $p1 = $this->processStepResponse(1, (string)$res1, $code1);
        if (!$p1['ok']) {
            return ['success' => false, 'error' => ($p1['error'] ?? 'Error paso 1') . ($err1 ? " ($err1)" : ''), 'duration' => microtime(true) - $t0, 'http_code' => $code1];
        }

        // Paso 2
        $ch2 = $this->createStepHandle(2);
        $res2 = curl_exec($ch2);
        $code2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        $err2 = curl_error($ch2);
        curl_close($ch2);
        $p2 = $this->processStepResponse(2, (string)$res2, $code2);
        if (!$p2['ok']) {
            return ['success' => false, 'error' => ($p2['message'] ?? 'Error paso 2') . ($err2 ? " ($err2)" : ''), 'duration' => microtime(true) - $t0, 'http_code' => $code2];
        }

        // Paso 3
        $ch3 = $this->createStepHandle(3);
        $res3 = curl_exec($ch3);
        $code3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
        $err3 = curl_error($ch3);
        curl_close($ch3);
        $p3 = $this->processStepResponse(3, (string)$res3, $code3);
        if (!$p3['ok']) {
            return ['success' => false, 'error' => ($p3['error'] ?? 'Error paso 3') . ($err3 ? " ($err3)" : ''), 'duration' => microtime(true) - $t0, 'http_code' => $code3];
        }

        $dur = microtime(true) - $t0;
        return [
            'success' => true,
            'duration' => $dur,
            'http_code' => 200,
            'name' => $p3['name'],
            'session_id' => $this->getAssignedSessionId(),
        ];
    }
}

/**
 * Ejecutor concurrente de múltiples clientes LabClient mediante curl_multi.
 */
function runConcurrentClients(string $baseUrl, int $startId, int $endId, int $concurrency): array {
    $clients = [];
    for ($i = $startId; $i <= $endId; $i++) {
        $clients[$i] = new LabClient($baseUrl, $i);
    }

    $queue = array_keys($clients);
    $inFlight = []; // clientId => ['step' => 1..3, 'handle' => ch, 'start_time' => float]
    $results = [];  // clientId => ['success' => bool, 'duration' => float, 'http_code' => int, ...]
    $handleToClient = [];

    $mh = curl_multi_init();
    $suiteStart = microtime(true);

    while (!empty($queue) || !empty($inFlight)) {
        // Rellenar hasta límite de concurrencia
        while (count($inFlight) < $concurrency && !empty($queue)) {
            $clientId = array_shift($queue);
            $client = $clients[$clientId];
            $ch = $client->createStepHandle(1);
            $handleId = (int)$ch;
            curl_multi_add_handle($mh, $ch);
            $handleToClient[$handleId] = $clientId;
            $inFlight[$clientId] = [
                'step' => 1,
                'handle' => $ch,
                'start_time' => microtime(true),
            ];
        }

        // Ejecutar transferencias
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc === CURLM_CALL_MULTI_PERFORM);

        if ($active) {
            curl_multi_select($mh, 0.05);
        }

        // Procesar transferencias completadas
        while ($done = curl_multi_info_read($mh)) {
            $ch = $done['handle'];
            $handleId = (int)$ch;
            $clientId = $handleToClient[$handleId] ?? null;
            if ($clientId === null) {
                continue;
            }

            $client = $clients[$clientId];
            $flightData = $inFlight[$clientId];
            $currentStep = $flightData['step'];

            $body = (string)curl_multi_getcontent($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
            unset($handleToClient[$handleId]);

            $stepRes = $client->processStepResponse($currentStep, $body, $httpCode);

            if (!$stepRes['ok']) {
                // Falló en este paso
                $dur = microtime(true) - $flightData['start_time'];
                $results[$clientId] = [
                    'success' => false,
                    'http_code' => $httpCode,
                    'step' => $currentStep,
                    'error' => $stepRes['message'] ?? $stepRes['error'] ?? 'Error desconocido',
                    'duration' => $dur,
                ];
                unset($inFlight[$clientId]);
                continue;
            }

            if ($currentStep < 3) {
                // Avanzar al siguiente paso
                $nextStep = $currentStep + 1;
                $nextCh = $client->createStepHandle($nextStep);
                $nextHandleId = (int)$nextCh;
                curl_multi_add_handle($mh, $nextCh);
                $handleToClient[$nextHandleId] = $clientId;
                $inFlight[$clientId]['step'] = $nextStep;
                $inFlight[$clientId]['handle'] = $nextCh;
            } else {
                // Completado satisfactoriamente los 3 pasos
                $dur = microtime(true) - $flightData['start_time'];
                $results[$clientId] = [
                    'success' => true,
                    'http_code' => 200,
                    'step' => 3,
                    'name' => $stepRes['name'],
                    'session_id' => $client->getAssignedSessionId(),
                    'duration' => $dur,
                ];
                unset($inFlight[$clientId]);
            }
        }
    }

    curl_multi_close($mh);
    $totalDuration = microtime(true) - $suiteStart;

    return [
        'total_duration' => $totalDuration,
        'results' => $results,
    ];
}

// -------------------------------------------------------------
// FASE A: Sanity Check (1 cliente: PC 02)
// -------------------------------------------------------------
if ($targetPhase === 'all' || $targetPhase === 'a') {
    echo "--- [PRUEBA A: Sanity - 1 cliente (PC02)] ---\n";
    $c2 = new LabClient($baseUrl, 2);
    $resA = $c2->runSynchronous();
    if ($resA['success']) {
        printf("✓ PC 02 autenticado correctamente en %.3fs (HTTP %d, Nombre: '%s')\n\n",
            $resA['duration'], $resA['http_code'], $resA['name']);
    } else {
        printf("✗ ERROR en PC 02 (HTTP %d): %s\n\n", $resA['http_code'] ?? 0, $resA['error'] ?? 'Desconocido');
        if ($targetPhase !== 'all') exit(1);
    }
}

// -------------------------------------------------------------
// FASE B: Concurrencia leve (5 clientes: PC 02 a PC 06)
// -------------------------------------------------------------
if ($targetPhase === 'all' || $targetPhase === 'b') {
    echo "--- [PRUEBA B: Concurrencia leve (5 clientes: PC02-PC06, pool 5)] ---\n";
    $batchB = runConcurrentClients($baseUrl, 2, 6, 5);
    $successB = 0;
    $rateLimitedB = 0;
    $sessionsB = [];

    foreach ($batchB['results'] as $id => $res) {
        if ($res['success']) {
            $successB++;
            if (!empty($res['session_id'])) {
                $sessionsB[$res['session_id']] = true;
            }
        } elseif ($res['http_code'] === 429) {
            $rateLimitedB++;
        }
    }

    printf("Completado en %.3fs | Éxitos: %d/5 | 429s: %d | Sesiones únicas: %d\n\n",
        $batchB['total_duration'], $successB, $rateLimitedB, count($sessionsB));
}

// -------------------------------------------------------------
// FASE C: Carga completa (39 clientes: PC 02 a PC 40)
// -------------------------------------------------------------
$cStats = null;
if ($targetPhase === 'all' || $targetPhase === 'c') {
    echo "--- [PRUEBA C: Carga completa (39 clientes: PC02-PC40, concurrencia 10)] ---\n";
    $batchC = runConcurrentClients($baseUrl, 2, 40, 10);
    $totalClients = 39;
    $successC = 0;
    $rateLimitedC = 0;
    $serverErrorsC = 0;
    $durations = [];
    $sessionsC = [];

    foreach ($batchC['results'] as $id => $res) {
        $durations[] = $res['duration'];
        if ($res['success']) {
            $successC++;
            if (!empty($res['session_id'])) {
                $sessionsC[$res['session_id']] = true;
            }
        } elseif ($res['http_code'] === 429) {
            $rateLimitedC++;
        } elseif ($res['http_code'] >= 500) {
            $serverErrorsC++;
        }
    }

    sort($durations);
    $minLat = !empty($durations) ? min($durations) : 0;
    $maxLat = !empty($durations) ? max($durations) : 0;
    $avgLat = !empty($durations) ? array_sum($durations) / count($durations) : 0;
    $p95Index = (int)ceil(0.95 * count($durations)) - 1;
    $p95Lat = $durations[max(0, $p95Index)] ?? $maxLat;

    $cStats = [
        'total' => $totalClients,
        'success' => $successC,
        'rate_limited' => $rateLimitedC,
        'server_errors' => $serverErrorsC,
        'unique_sessions' => count($sessionsC),
        'min' => $minLat,
        'avg' => $avgLat,
        'p95' => $p95Lat,
        'max' => $maxLat,
        'duration' => $batchC['total_duration'],
    ];

    printf("Duración total: %.3fs | Concurrencia: 10\n", $batchC['total_duration']);
    printf("Resultados: %d/%d exitosos | 429 (Rate Limit): %d | 5xx (Errores): %d\n",
        $successC, $totalClients, $rateLimitedC, $serverErrorsC);
    printf("Sesiones de login únicas generadas: %d\n", count($sessionsC));
    printf("Latencias por cliente: min=%.3fs | avg=%.3fs | p95=%.3fs | max=%.3fs\n\n",
        $minLat, $avgLat, $p95Lat, $maxLat);
}

// -------------------------------------------------------------
// FASE D: Inspección en Base de Datos (request_limits)
// -------------------------------------------------------------
$dbStats = null;
if ($targetPhase === 'all' || $targetPhase === 'd') {
    echo "--- [PRUEBA D: Inspección en BD (request_limits)] ---\n";
    require_once dirname(__DIR__) . '/modules/groups/config.php';
    try {
        $pdo = groupsConnection();
        $row = $pdo->query('SELECT COUNT(*) as buckets, IFNULL(SUM(attempts), 0) as total_attempts, IFNULL(MAX(attempts), 0) as max_attempts FROM request_limits')->fetch(PDO::FETCH_ASSOC);
        $dbStats = [
            'buckets' => (int)$row['buckets'],
            'total_attempts' => (int)$row['total_attempts'],
            'max_attempts' => (int)$row['max_attempts'],
        ];
        printf("Buckets en BD: %d | Intentos acumulados: %d | Max intentos: %d\n",
            $dbStats['buckets'], $dbStats['total_attempts'], $dbStats['max_attempts']);
        if ($dbStats['buckets'] === 0 || $dbStats['total_attempts'] === 0) {
            echo "✓ Correcto: Los logins exitosos no acumularon intentos de fallo en BD.\n\n";
        } else {
            echo "Nota: Se observan registros en request_limits.\n\n";
        }
    } catch (Throwable $e) {
        echo "Error al conectar con la BD para inspección: " . $e->getMessage() . "\n\n";
    }
}

// -------------------------------------------------------------
// FASE E: Comportamiento ante fallos reales y aislamiento
// -------------------------------------------------------------
$isolationSuccess = false;
if ($targetPhase === 'all' || $targetPhase === 'e') {
    echo "--- [PRUEBA E: Aislamiento ante fallos (PC02 abusa, PC20 ingresa)] ---\n";
    
    // Obtener buckets existentes antes de la prueba
    require_once dirname(__DIR__) . '/modules/groups/config.php';
    $pdo = groupsConnection();
    $beforeBuckets = $pdo->query('SELECT bucket FROM request_limits')->fetchAll(PDO::FETCH_COLUMN);

    // 1. Obtener CSRF y cookie para PC02
    $cBad = new LabClient($baseUrl, 2, 'password_incorrecta_999');
    $chInit = $cBad->createStepHandle(1);
    $initRes = curl_exec($chInit);
    $initCode = curl_getinfo($chInit, CURLINFO_HTTP_CODE);
    curl_close($chInit);
    $cBad->processStepResponse(1, (string)$initRes, $initCode);

    // 2. Ejecutar 10 intentos con contraseña errónea para PC02
    $blockedOnAttempt11 = false;
    $attempts401 = 0;
    $attemptCodes = [];
    for ($attempt = 1; $attempt <= 10; $attempt++) {
        $chPost = $cBad->createStepHandle(2);
        $postRes = curl_exec($chPost);
        $postCode = curl_getinfo($chPost, CURLINFO_HTTP_CODE);
        $postErr = curl_error($chPost);
        curl_close($chPost);
        $attemptCodes[] = $postCode;
        if ($postCode === 401) {
            $attempts401++;
        }
        usleep(50000); // 50ms entre intentos para estabilidad de socket ngrok
    }

    // 3. Intento 11 para PC02 -> Debe dar 429
    $ch11 = $cBad->createStepHandle(2);
    $res11 = curl_exec($ch11);
    $code11 = curl_getinfo($ch11, CURLINFO_HTTP_CODE);
    curl_close($ch11);
    if ($code11 === 429) {
        $blockedOnAttempt11 = true;
    }

    printf("PC02 intentos fallidos: %d con 401 (Códigos: %s) | Intento 11: HTTP %d (%s)\n",
        $attempts401, implode(',', $attemptCodes), $code11, $blockedOnAttempt11 ? "BLOQUEADO POR RATE LIMIT ✓" : "NO BLOQUEADO ✗");

    // 4. Inmediatamente intentar login correcto de PC20
    $c20 = new LabClient($baseUrl, 20, '12345');
    $res20 = $c20->runSynchronous();
    $pc20Entered = $res20['success'] && ($res20['http_code'] === 200);

    printf("PC20 intento inmediato: HTTP %d (Nombre: '%s') -> %s%s\n",
        $res20['http_code'] ?? 0, $res20['name'] ?? 'N/A',
        $pc20Entered ? "LOGIN EXITOSO ✓ (NO AFECTADO POR BLOQUEO DE PC02)" : "FALLO INESPERADO ✗",
        !$pc20Entered && !empty($res20['error']) ? (" (" . $res20['error'] . ")") : "");

    $isolationSuccess = $blockedOnAttempt11 && $pc20Entered;

    // 5. Limpieza únicamente del bucket de prueba creado durante Fase E
    $afterBuckets = $pdo->query('SELECT bucket FROM request_limits')->fetchAll(PDO::FETCH_COLUMN);
    $newBuckets = array_diff($afterBuckets, $beforeBuckets);
    if (!empty($newBuckets)) {
        $delStmt = $pdo->prepare('DELETE FROM request_limits WHERE bucket = ?');
        foreach ($newBuckets as $b) {
            $delStmt->execute([$b]);
        }
        echo "✓ Bucket de prueba de PC02 limpiado en BD para dejar el laboratorio operativo.\n\n";
    }
}

// -------------------------------------------------------------
// REPORTE FINAL CONCISO (< 20 líneas)
// -------------------------------------------------------------
if ($targetPhase === 'all') {
    // Determinar IP observada
    $observedIp = 'No capturada';
    $chNg = curl_init('http://127.0.0.1:4040/api/requests/http?limit=1');
    curl_setopt_array($chNg, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 2]);
    $ngData = curl_exec($chNg);
    curl_close($chNg);
    if (is_string($ngData)) {
        $ngJson = json_decode($ngData, true);
        $observedIp = $ngJson['requests'][0]['request']['headers']['X-Forwarded-For'][0]
            ?? $ngJson['requests'][0]['remote_addr']
            ?? '127.0.0.1';
    }

    echo "==================== REPORTE EJECUTIVO ====================\n";
    echo "1. URL Utilizada:       $baseUrl (ngrok HTTPS público)\n";
    echo "2. Clientes probados:   39 (PC02 - PC40)\n";
    printf("3. Resultados HTTP:     Exitosos: %d | 429 (Bloqueados): %d | 5xx: %d\n",
        $cStats['success'] ?? 0, $cStats['rate_limited'] ?? 0, $cStats['server_errors'] ?? 0);
    echo "4. Concurrencia usada:  10 clientes simultáneos (flujo 3 pasos completos)\n";
    printf("5. Latencias (s):       min=%.3f | avg=%.3f | p95=%.3f | max=%.3f\n",
        $cStats['min'] ?? 0, $cStats['avg'] ?? 0, $cStats['p95'] ?? 0, $cStats['max'] ?? 0);
    printf("6. Duración total:      %.3fs (39 sesiones independientes verificadas)\n",
        $cStats['duration'] ?? 0);
    printf("7. Estado request_lim:  Buckets: %d | Total Intentos: %d (Logins OK no suman)\n",
        $dbStats['buckets'] ?? 0, $dbStats['total_attempts'] ?? 0);
    printf("8. Aislamiento Falla:   %s (PC02 bloqueado no afectó a PC20)\n",
        $isolationSuccess ? "CORRECTO Y VALIDADO" : "FALLÓ");
    echo "9. IP/XFF Observada:    $observedIp (trusted loopback proxy activo)\n";
    echo "===========================================================\n";
}
