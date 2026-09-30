# Grupos: módulo aislado

Ruta: `modules/groups/`. Un hook compartido en los 13 simuladores permite revisar una captura y confirmar su guardado. Por defecto responde 503. Activar únicamente en el entorno deseado con `SIM_GROUPS_ENABLED=1`.

## Instalación
1. Crear una base MariaDB vacía e importar `database/schema.sql` con una cuenta administrativa. El esquema no contiene usuarios ni datos históricos.
2. Crear una cuenta de aplicación dedicada con contraseña independiente y únicamente SELECT, INSERT, UPDATE y DELETE sobre esa base. El módulo rechaza `root` y contraseñas vacías.
3. Definir `SIM_DB_DSN` (mysql con charset=utf8mb4), `SIM_DB_USER`, `SIM_DB_PASSWORD` en el entorno del servidor. Alternativamente copiar `config/database.example.php` a `config/database.php`, ignorado por Git. No publicar variables ni archivos de configuración.
4. Usar HTTPS fuera de localhost; el módulo rechaza HTTP remoto. Configurar HTTPS en el servidor de origen; no se confía en cabeceras forwarded arbitrarias. No se ha desplegado este módulo a producción.

## Funcionalidad y límites
- Registro de cuentas nuevas; password_hash/verify; contraseña de 12–72 bytes. No se importan usuarios ni hashes históricos. Una migración posterior debe usar reset/primer acceso.
- Sesión HttpOnly, SameSite Lax, Secure sobre HTTPS, cookie limitada al módulo; caduca por inactividad de 30 minutos, ID renovado al login. Logout POST destruye sesión y cookie.
- Todas las operaciones mutables son POST JSON con CSRF, incluido registro/login/logout. Prepared statements nativos y mensajes sin detalles SQL.
- Crear grupos genera invitaciones aleatorias de 128 bits. El código permite incorporarse: compartirlo solo con integrantes previstos. Todos los integrantes pueden ver y guardar; el propietario no puede abandonar su propio grupo. Se comprueba pertenencia en cada acceso.
- Se elige un registro local de los simuladores 01–13, se muestra su contenido y solo se transmite al pulsar Guardar en grupo. No se envían frames, sesión ni información personal desde localStorage.
- Capturas: objetos planos, claves hasta 100 bytes, cadenas hasta 4096 bytes, 1100 campos, hasta 32 KiB por objeto y 70 KB por petición. El usuario guardador procede de la sesión. Se muestran las últimas 100 capturas; los valores son aportados por estudiantes, no resultados certificados por recálculo servidor.
- Se usa textContent para nombres/resultados; sin HTML dinámico ni eventos inline. CSP propia. SQL y configuración no deben servirse como archivos estáticos.
- Límite persistente por IP y operación: 10 intentos de login/registro y 20 de código por 15 minutos. Cambiar cookie no lo evita; transacción y bloqueo de fila serializan intentos. Almacena SHA-256 de IP/operación, no IP literal. Limitaciones: NAT comparte cupo, proxy/túnel puede compartir IP, ataques distribuidos requieren control adicional. No se confía en X-Forwarded-For arbitrario.
- `usuarios.activo` bloquea login y acceso a recursos para cuentas desactivadas.
- No se incluye correo verificado, recuperación ni migración real. Si se necesitan, deben prepararse antes del uso público.
- Para demo usar `SIM_DEMO=1`: errores detallados desactivados. MariaDB debe escuchar en loopback y nunca formar parte del túnel. El túnel/servidor debe configurar HTTPS real de forma confiable; no se abre ningún puerto público automáticamente.

## Pruebas
`node tests/groups.cjs`: crea una MariaDB en un directorio temporal y puertos 13379/8781; usuarios y contraseñas aleatorios de prueba, sin acceder a 3306. Destruye exclusivamente ese directorio al finalizar. Variables opcionales MARIADB_BIN, PHP_BIN, SIM_TEST_DB_PORT y SIM_TEST_HTTP_PORT. Requiere herramientas MariaDB de Windows (por defecto XAMPP).
`node tests/groups-ui.cjs`: verifica representación inerte de XSS en nombres y capturas.

Auditoría del donante: se conserva el modelo usuarios/grupos/grupo_miembros/simulaciones y el guardado explícito. Se sustituyen ausencia de CSRF, sesión sin regeneración, validación insuficiente, código de invitación corto y eventos inline con addslashes. No se leyó ni importó el dump histórico.

`node tests/groups-hook.cjs`: prueba confirmación explícita, CSRF, rutas con prefijo y captura independiente.
