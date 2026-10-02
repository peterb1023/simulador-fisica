<?php require __DIR__.'/bootstrap.php'; ?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Grupos de estudio — LAB FÍSICA I</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <a href="../../index.php">← Portal</a>
  <strong>LAB FÍSICA I</strong>
</header>
<main>
  <h1>Grupos de estudio</h1>
  <p class="subtitle">Comparte tus capturas de simulación y consulta los resultados de tu equipo.</p>
  <p><a id="return-sim" class="btn-return" hidden>← Volver al simulador</a></p>
  <p id="status" role="status"></p>

  <section id="auth">
    <h2>Iniciar sesión</h2>
    <p>Ingresa con tu correo institucional o tu cuenta demo asignada.</p>
    <form id="account">
      <label>Email
        <input type="email" name="email" required maxlength="254" autocomplete="username">
      </label>
      <label>Contraseña (12–72 bytes)
        <input type="password" name="password" required minlength="12" maxlength="72" autocomplete="current-password">
      </label>
      <button name="login">Iniciar sesión</button>
    </form>
  </section>

  <section id="workspace" hidden>
    <div class="user-header">
      <h2 id="welcome"></h2>
      <button id="logout" type="button">Cerrar sesión</button>
    </div>

    <div class="forms-row">
      <form id="create">
        <h3>Crear nuevo grupo</h3>
        <label>Nombre del grupo
          <input name="nombre" required maxlength="100" placeholder="Ej. Equipo 3 — Mecánica">
        </label>
        <button>Crear grupo</button>
      </form>

      <form id="join">
        <h3>Unirse con código</h3>
        <label>Código de invitación
          <input name="codigo" required minlength="32" maxlength="32" placeholder="Código de 32 caracteres">
        </label>
        <button>Unirse</button>
      </form>
    </div>

    <h2>Mis grupos</h2>
    <ul id="groups"></ul>

    <section id="group" hidden>
      <div class="group-banner">
        <h2 id="group-title"></h2>
        <button id="leave" type="button">Salir del grupo</button>
      </div>

      <div class="invite-card">
        <span class="invite-title">Código de invitación para compañeros:</span>
        <div class="invite-actions">
          <code id="code"></code>
          <button id="copy-code" type="button">Copiar código</button>
        </div>
        <span id="copy-status" role="status"></span>
      </div>

      <div class="sim-actions-bar">
        <a href="../../index.php" class="btn-open-sims">Explorar simuladores</a>
        <a href="../../simuladores/02_vectores/" class="btn-open-sims">Abrir SIM02 — Vectores</a>
      </div>

      <h3>Integrantes</h3>
      <ul id="members" class="members-tags"></ul>

      <h3>Simulaciones guardadas</h3>
      <div id="saved" class="sims-grid"></div>
    </section>
  </section>
</main>
<script src="app.js"></script>
</body>
</html>
