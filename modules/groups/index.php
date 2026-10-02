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
<header class="app-header">
  <div class="header-left">
    <a href="../../index.php" class="portal-back">← Portal</a>
    <span class="app-brand">LAB FÍSICA I</span>
  </div>
  <div id="user-nav" class="user-nav" hidden>
    <div class="user-pill">
      <span class="user-dot"></span>
      <span id="welcome" class="user-name"></span>
    </div>
    <button id="logout" type="button" class="btn-logout">Cerrar sesión</button>
  </div>
</header>

<main class="groups-app">
  <div class="page-title-row">
    <div>
      <h1>Grupos de estudio</h1>
      <p class="subtitle">Comparte simulaciones y compara resultados con tu equipo.</p>
    </div>
    <a id="return-sim" class="btn-return-sim" hidden>← Volver al simulador</a>
  </div>
  <p id="status" role="status"></p>

  <!-- SECCIÓN ACCESO (sin sesión) -->
  <section id="auth" class="auth-card">
    <h2>Iniciar sesión</h2>
    <p class="auth-desc">Ingresa con tu correo institucional o tu cuenta demo asignada.</p>
    <form id="account">
      <label>Email
        <input type="email" name="email" required maxlength="254" autocomplete="username" placeholder="estudiante@example.test">
      </label>
      <label>Contraseña
        <input type="password" name="password" required minlength="5" maxlength="72" autocomplete="current-password">
      </label>
      <button name="login" class="btn-primary">Iniciar sesión</button>
    </form>
  </section>

  <!-- SECCIÓN WORKSPACE (con sesión) -->
  <section id="workspace" class="workspace-layout" hidden>

    <!-- BARRA LATERAL: MIS GRUPOS -->
    <aside class="sidebar-panel">
      <div class="sidebar-head">
        <h2>Mis grupos</h2>
        <div class="sidebar-actions">
          <button id="btn-toggle-create" type="button" class="btn-action-tab">+ Crear</button>
          <button id="btn-toggle-join" type="button" class="btn-action-tab">🔗 Unirme</button>
        </div>
      </div>

      <!-- Formulario Desplegable: Crear Grupo -->
      <form id="create" class="collapsible-card" hidden>
        <h3>Crear nuevo grupo</h3>
        <label>Nombre del grupo
          <input name="nombre" required maxlength="100" placeholder="Ej. Equipo 3 — Mecánica">
        </label>
        <div class="form-btn-row">
          <button class="btn-primary">Crear</button>
          <button type="button" id="btn-cancel-create" class="btn-secondary">Cancelar</button>
        </div>
      </form>

      <!-- Formulario Desplegable: Unirse a Grupo -->
      <form id="join" class="collapsible-card" hidden>
        <h3>Unirse con código</h3>
        <label>Código de invitación
          <input name="codigo" required minlength="32" maxlength="32" placeholder="Código de 32 caracteres">
        </label>
        <div class="form-btn-row">
          <button class="btn-primary">Unirse</button>
          <button type="button" id="btn-cancel-join" class="btn-secondary">Cancelar</button>
        </div>
      </form>

      <!-- Lista de grupos -->
      <ul id="groups" class="groups-list"></ul>
    </aside>

    <!-- ÁREA PRINCIPAL: GRUPO SELECCIONADO -->
    <section id="group" class="main-group-panel" hidden>
      <div class="group-hero">
        <div class="group-hero-title-area">
          <h2 id="group-title" class="group-title-heading"></h2>
          <span id="group-members-count" class="group-count-tag"></span>
        </div>
        <button id="leave" type="button" class="btn-leave">Salir del grupo</button>
      </div>

      <div class="invite-banner">
        <div class="invite-content">
          <span class="invite-caption">CÓDIGO DE INVITACIÓN PARA COMPAÑEROS</span>
          <code id="code" class="invite-code"></code>
        </div>
        <div class="invite-btn-wrap">
          <button id="copy-code" type="button" class="btn-copy">Copiar código</button>
          <span id="copy-status" class="copy-feedback" role="status"></span>
        </div>
      </div>

      <div class="group-links-bar">
        <a href="../../index.php" class="btn-link-action">Explorar simuladores</a>
        <a href="../../simuladores/02_vectores/" class="btn-link-action">SIM 02 · Vectores</a>
      </div>

      <div class="members-block">
        <h3>Integrantes</h3>
        <ul id="members" class="members-tags"></ul>
      </div>

      <div class="simulations-block">
        <div class="sims-block-head">
          <h3>Simulaciones guardadas</h3>
          <span id="sims-count-badge" class="sims-badge"></span>
        </div>
        <div id="saved" class="sims-feed"></div>
      </div>
    </section>

  </section>
</main>
<script src="app.js"></script>
</body>
</html>
