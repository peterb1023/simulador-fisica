<?php
// Copiar opcionalmente a database.php (ignorado). No añadir credenciales al repositorio.
return [
 'enabled' => getenv('SIM_GROUPS_ENABLED') === '1',
 'dsn' => getenv('SIM_DB_DSN') ?: '', // mysql:host=127.0.0.1;port=3306;dbname=fisica;charset=utf8mb4
 'user' => getenv('SIM_DB_USER') ?: '',
 'password' => getenv('SIM_DB_PASSWORD') ?: '',
];
