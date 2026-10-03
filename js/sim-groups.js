// Shared explicit-save hook. Snapshots stay local until the confirmation button.
const SimGroups = (() => {
  const scriptSrc = (document.currentScript && document.currentScript.src) || (typeof location !== 'undefined' ? location.href : 'http://localhost/');
  const base = new URL('../modules/groups/', scriptSrc);

  const SIMULATOR_NAMES = {
    '01': 'Energía',
    '02': 'Vectores',
    '03': 'Unidades y conversiones',
    '04': 'Cinemática 1D',
    '05': 'MRU y MRUA',
    '06': 'Proyectiles',
    '07': 'Movimiento circular',
    '08': 'Leyes de Newton',
    '09': 'Trabajo',
    '10': 'Potencia y eficiencia',
    '11': 'Movimiento rotacional',
    '12': 'Momento de inercia',
    '13': 'Momento de inercia compuesto'
  };

  function getSimTitle(simId) {
    const norm = String(simId || '').trim();
    const pad = norm.length === 1 ? '0' + norm : norm;
    const name = SIMULATOR_NAMES[pad] || ('Simulador ' + pad);
    return name + ' · SIM ' + pad;
  }

  function formatValue(val) {
    if (typeof val === 'number') {
      if (!Number.isFinite(val)) return '—';
      if (Number.isInteger(val)) return String(val);
      const abs = Math.abs(val);
      if (abs >= 1e6 || (abs < 1e-4 && abs > 0)) {
        return val.toExponential(3);
      }
      return String(Number(val.toFixed(3)));
    }
    if (typeof val === 'boolean') {
      return val ? 'Sí' : 'No';
    }
    if (val === null || val === undefined) {
      return '—';
    }
    if (Array.isArray(val)) {
      return val.map(formatValue).join(', ');
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (!entries.length) return '—';
      return entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join('; ');
    }
    return String(val);
  }

  function renderKVColumn(parent, title, data) {
    const col = document.createElement('div');
    col.className = 'sim-col';
    const h = document.createElement('h5');
    h.className = 'sim-col-title';
    h.textContent = title;
    col.append(h);

    const entries = data && typeof data === 'object' && !Array.isArray(data)
      ? Object.entries(data)
      : [];

    if (!entries.length) {
      const none = document.createElement('p');
      none.className = 'kv-none';
      none.textContent = 'Sin datos';
      col.append(none);
      parent.append(col);
      return;
    }

    const dl = document.createElement('dl');
    dl.className = 'kv-list';

    for (const [k, v] of entries) {
      const row = document.createElement('div');
      row.className = 'kv-row';
      const dt = document.createElement('dt');
      dt.textContent = String(k);
      const dd = document.createElement('dd');
      dd.textContent = formatValue(v);
      row.append(dt, dd);
      dl.append(row);
    }

    col.append(dl);
    parent.append(col);
  }

  function renderPreview(previewContainer, simId, snap) {
    previewContainer.textContent = '';
    previewContainer.replaceChildren();

    const head = document.createElement('div');
    head.className = 'preview-header';

    const caption = document.createElement('span');
    caption.className = 'preview-caption';
    caption.textContent = 'VISTA PREVIA';

    const title = document.createElement('h4');
    title.className = 'preview-sim-title';
    title.textContent = getSimTitle(simId);

    head.append(caption, title);

    const grid = document.createElement('div');
    grid.className = 'sim-card-body';

    renderKVColumn(grid, 'PARÁMETROS', snap?.parameters || {});
    renderKVColumn(grid, 'RESULTADOS', snap?.results || {});

    previewContainer.append(head, grid);
  }

  function bind(capture, id) {
    const nav = document.querySelector('.sim-nav');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-btn nav-btn-group';
    button.textContent = 'Guardar en grupo';
    if (nav) nav.append(button);

    // Toolbar session element
    const userWrap = document.createElement('div');
    userWrap.className = 'nav-user-wrap';

    const userPill = document.createElement('button');
    userPill.type = 'button';
    userPill.className = 'nav-btn nav-user-pill';
    userPill.setAttribute('aria-expanded', 'false');
    userPill.hidden = true;

    const userDot = document.createElement('span');
    userDot.className = 'nav-user-dot';

    const userName = document.createElement('span');
    userName.className = 'nav-user-name';

    const userCaret = document.createElement('span');
    userCaret.className = 'nav-user-caret';
    userCaret.textContent = '▾';

    userPill.append(userDot, userName, userCaret);

    const userMenu = document.createElement('div');
    userMenu.className = 'nav-user-dropdown';
    userMenu.hidden = true;

    const menuGroupsLink = document.createElement('a');
    menuGroupsLink.className = 'nav-user-dropdown-item';
    menuGroupsLink.textContent = '👥 Grupos de estudio';
    menuGroupsLink.href = new URL('?return=' + encodeURIComponent(location.href), base).href;

    const menuLogoutBtn = document.createElement('button');
    menuLogoutBtn.type = 'button';
    menuLogoutBtn.className = 'nav-user-dropdown-item nav-user-dropdown-logout';
    menuLogoutBtn.textContent = 'Cerrar sesión';

    userMenu.append(menuGroupsLink, menuLogoutBtn);

    const loginLink = document.createElement('a');
    loginLink.className = 'nav-btn nav-btn-login';
    loginLink.textContent = 'Iniciar sesión';
    loginLink.href = new URL('?return=' + encodeURIComponent(location.href), base).href;
    loginLink.hidden = true;

    userWrap.append(userPill, userMenu, loginLink);
    if (nav) nav.append(userWrap);

    // Dialog structure (ordered strictly for tests/groups-hook.cjs compatibility: title, status, label, preview, submit, close, login)
    const dialog = document.createElement('dialog');
    dialog.className = 'group-dialog';
    dialog.setAttribute('aria-label', 'Guardar simulación en grupo');

    const title = document.createElement('h2');
    title.textContent = 'Guardar en grupo';

    const status = document.createElement('p');
    status.setAttribute('role', 'status');

    const label = document.createElement('label');
    label.textContent = 'Grupo de destino';
    const select = document.createElement('select');
    label.append(select);

    const preview = document.createElement('div');
    preview.className = 'group-dialog-preview';

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'btn-dialog-submit';
    submit.textContent = 'Confirmar guardado';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-dialog-cancel';
    close.textContent = 'Cancelar';

    const login = document.createElement('a');
    login.className = 'btn-dialog-manage';
    login.textContent = 'Iniciar sesión';
    login.href = new URL('?return=' + encodeURIComponent(location.href), base).href;

    dialog.append(title, status, label, preview, submit, close, login);
    document.body.append(dialog);

    let snapshot, csrf = '', sending = false, closeTimer = null;

    async function request(action, data) {
      const res = await fetch(new URL('api.php?action=' + action, base), {
        method: data ? 'POST' : 'GET',
        headers: data ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {},
        body: data ? JSON.stringify(data) : undefined
      });
      const result = await res.json();
      if (!res.ok) throw Error(result.message);
      return result;
    }

    function closeUserMenu() {
      userMenu.hidden = true;
      userPill.setAttribute('aria-expanded', 'false');
    }

    function openUserMenu() {
      userMenu.hidden = false;
      userPill.setAttribute('aria-expanded', 'true');
    }

    function toggleUserMenu(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (userMenu.hidden) {
        openUserMenu();
      } else {
        closeUserMenu();
      }
    }

    function updateSessionUI(user) {
      closeUserMenu();
      if (user && user.name) {
        userName.textContent = user.name;
        userPill.title = 'Sesión activa: ' + user.name + ' · Opciones de cuenta';
        userPill.hidden = false;
        loginLink.hidden = true;
      } else {
        userPill.hidden = true;
        userMenu.hidden = true;
        loginLink.hidden = false;
      }
    }

    userPill.addEventListener('click', toggleUserMenu);

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('click', (e) => {
        if (userWrap && userWrap.contains && !userWrap.contains(e.target)) {
          closeUserMenu();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !userMenu.hidden) {
          closeUserMenu();
          if (typeof userPill.focus === 'function') userPill.focus();
        }
      });
    }

    if (nav) {
      nav.addEventListener('click', (e) => {
        if (userWrap && !userWrap.contains(e.target)) {
          closeUserMenu();
        }
      });
    }

    menuGroupsLink.addEventListener('click', () => { closeUserMenu(); });

    menuLogoutBtn.addEventListener('click', async () => {
      closeUserMenu();
      try {
        await request('logout', {});
        updateSessionUI(null);
      } catch (e) {
        // Fallback or ignore
      }
    });

    // Check session on initialization in real browser environment
    if (typeof window !== 'undefined' && typeof document.addEventListener === 'function') {
      const fetchSession = async () => {
        try {
          const s = await request('session');
          csrf = s.csrf;
          updateSessionUI(s.user);
        } catch {
          updateSessionUI(null);
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchSession);
      } else {
        fetchSession();
      }
    }

    async function openSaveDialog(customSnapshot = null) {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      dialog.showModal();
      sending = false;
      submit.disabled = true;
      submit.textContent = 'Confirmar guardado';
      select.replaceChildren();
      preview.textContent = '';
      preview.replaceChildren();
      status.textContent = 'Comprobando sesión…';
      status.className = '';
      label.hidden = submit.hidden = preview.hidden = true;
      login.textContent = 'Iniciar sesión';
      try {
        if (customSnapshot) {
          snapshot = JSON.parse(JSON.stringify(customSnapshot));
        } else {
          snapshot = JSON.parse(JSON.stringify(capture()));
        }
        const session = await request('session');
        csrf = session.csrf;
        updateSessionUI(session.user);
        if (!session.user) {
          status.textContent = 'Debes iniciar sesión para guardar simulaciones en un grupo.';
          return;
        }
        login.textContent = 'Gestionar grupos';
        const data = await request('groups');
        for (const group of data.groups) {
          const option = document.createElement('option');
          option.value = group.id;
          option.textContent = group.nombre;
          select.append(option);
        }
        label.hidden = submit.hidden = preview.hidden = !data.groups.length;
        renderPreview(preview, id, snapshot);
        status.textContent = data.groups.length ? 'Revisa la captura y confirma su envío.' : 'Aún no perteneces a ningún grupo.';
        submit.disabled = !data.groups.length;
      } catch (e) {
        status.textContent = e.message;
        status.className = 'status-error';
      }
    }

    button.addEventListener('click', () => openSaveDialog(null));

    submit.addEventListener('click', async () => {
      if (sending) return;
      sending = true;
      submit.disabled = true;
      submit.textContent = 'Guardando…';
      status.textContent = 'Guardando captura en el grupo…';
      status.className = 'status-loading';
      try {
        const selectedOpt = (select.options ? select.options[select.selectedIndex] : select.children?.find?.(c => String(c.value) === String(select.value))) || select.children?.[0];
        const groupName = selectedOpt?.textContent || 'el grupo';
        await request('save', {
          grupo_id: Number(select.value),
          simulador_id: id,
          parametros: snapshot.parameters,
          resultado: snapshot.results
        });
        submit.textContent = '✓ Guardado';
        status.textContent = '✓ Simulación guardada en «' + groupName + '»';
        status.className = 'status-success';
        closeTimer = setTimeout(() => { if (dialog.open) dialog.close(); }, 1600);
      } catch (e) {
        status.textContent = 'Error al guardar: ' + e.message;
        status.className = 'status-error';
        submit.disabled = false;
        submit.textContent = 'Confirmar guardado';
      } finally {
        sending = false;
      }
    });

    close.addEventListener('click', () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      dialog.close();
    });

    SimGroups.openSaveDialog = openSaveDialog;
  }

  return {
    bind,
    getSimTitle,
    SIMULATOR_NAMES,
    formatValue,
    renderPreview,
    openSaveDialog: (s) => (SimGroups.openSaveDialog ? SimGroups.openSaveDialog(s) : null)
  };
})();
