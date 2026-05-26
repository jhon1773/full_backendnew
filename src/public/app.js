const statusBox = document.getElementById('statusBox');
const metricsBox = document.getElementById('metricsBox');
const tokenBox = document.getElementById('tokenBox');
const roleBox = document.getElementById('roleBox');
const countryBox = document.getElementById('countryBox');
const moduleGrid = document.getElementById('moduleGrid');
const moduleWorkspace = document.getElementById('moduleWorkspace');
const moduleWorkspaceEmpty = document.getElementById('moduleWorkspaceEmpty');
const kpiPending = document.getElementById('kpiPending');
const kpiTestimonials = document.getElementById('kpiTestimonials');
const kpiNews = document.getElementById('kpiNews');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminTab = document.getElementById('adminTab');
const adminCreateForm = document.getElementById('adminCreateForm');
const adminUserList = document.getElementById('adminUserList');
const adminMessage = document.getElementById('adminMessage');
const rolePanel = document.getElementById('rolePanel');
const rolePanelTitle = document.getElementById('rolePanelTitle');
const rolePanelContent = document.getElementById('rolePanelContent');
const accessAside = document.getElementById('accessAside');
const publicArea = document.getElementById('publicArea');
const rolePanelSkeleton = document.getElementById('skeletonCardTemplate');
const homeBtn = document.getElementById('homeBtn');
const loginNavBtn = document.getElementById('loginNavBtn');
const goLoginBtn = document.getElementById('goLoginBtn');
const navTabs = Array.from(document.querySelectorAll('.nav-tab'));
const workspacePanels = Array.from(document.querySelectorAll('#publicArea, #rolePanel, #adminTab, .main-column > section[data-panel]'));
const mainViews = Array.from(document.querySelectorAll('#homeView, #loginView, #dashboardView'));

const API = '';

const modules = [
  {
    id: 'dashboard',
    name: 'Dashboard principal',
    route: '/dashboard',
    roles: ['superadmin', 'admin_pais', 'editor'],
    kind: 'dashboard',
  },
  {
    id: 'paises',
    name: 'Gestion de paises',
    route: '/paises',
    roles: ['superadmin'],
    kind: 'portals',
  },
  {
    id: 'solicitudes',
    name: 'Solicitudes de contacto',
    route: '/solicitudes',
    roles: ['superadmin', 'admin_pais'],
    kind: 'requests',
  },
  {
    id: 'testimonios',
    name: 'Testimonios de exito',
    route: '/testimonios',
    roles: ['superadmin', 'admin_pais', 'editor'],
    kind: 'testimonials',
  },
  {
    id: 'noticias',
    name: 'Noticias',
    route: '/noticias',
    roles: ['superadmin', 'admin_pais', 'editor'],
    kind: 'news',
  },
  {
    id: 'detalle',
    name: 'Detalle / Edicion',
    route: '/detalle/:tipo/:id',
    roles: ['superadmin', 'admin_pais', 'editor'],
    kind: 'detail',
  },
  {
    id: 'perfil',
    name: 'Perfil de usuario',
    route: '/perfil',
    roles: ['superadmin', 'admin_pais', 'editor'],
    kind: 'profile',
  },
];

let currentUser = null;
let currentModules = [];
let currentTab = 'overview';
let currentView = 'home';
let activeModuleId = null;

function setLoadingState(isLoading) {
  const targets = [metricsBox, statusBox, adminMessage];
  for (const target of targets) {
    if (!target) continue;
    target.classList.toggle('loading-state', isLoading);
  }
}

function isAdminRole(role) {
  return role === 'superadmin' || role === 'admin_pais';
}

function canAccessAdminArea(user) {
  return Boolean(user && isAdminRole(user.role));
}

function setActiveTab(tabName) {
  currentTab = tabName;

  navTabs.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  workspacePanels.forEach((panel) => {
    const isVisible = panel.dataset.panel === tabName;
    panel.classList.toggle('is-hidden', !isVisible);
  });

  if (tabName === 'admin' && adminTab) {
    adminTab.style.display = 'block';
  }

  if (tabName !== 'admin' && adminTab) {
    adminTab.style.display = 'none';
  }
}

function setActiveView(viewName) {
  currentView = viewName;

  mainViews.forEach((view) => {
    const viewId = view.id === 'homeView' ? 'home' : view.id === 'loginView' ? 'login' : 'dashboard';
    view.classList.toggle('is-hidden', viewId !== viewName);
  });

  if (viewName === 'dashboard') {
    setActiveTab(currentTab || 'overview');
  }

  if (viewName !== 'dashboard') {
    hideAdminTab();
    hideRolePanel();
  }
}

function mountSkeletons() {
  if (!rolePanel || !rolePanelSkeleton) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 2; index += 1) {
    fragment.appendChild(rolePanelSkeleton.content.cloneNode(true));
  }
  rolePanel.appendChild(fragment);
}

mountSkeletons();

if (homeBtn) {
  homeBtn.addEventListener('click', () => setActiveView('home'));
}

if (loginNavBtn) {
  loginNavBtn.addEventListener('click', () => setActiveView('login'));
}

if (goLoginBtn) {
  goLoginBtn.addEventListener('click', () => setActiveView('login'));
}

navTabs.forEach((button) => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab || 'overview';
    setActiveTab(tabName);
    if (tabName === 'admin') {
      showAdminTab();
    }
    if (tabName === 'modules') {
      document.querySelector('[data-panel="modules"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (tabName === 'overview') {
      document.querySelector('[data-panel="overview"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? '#ff8fa0' : '#edf2ff';
}

function showToast(message, type = 'error', timeout = 4200) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  t.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  t.textContent = message;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-6px)';
    setTimeout(() => t.remove(), 300);
  }, timeout);
}

function showAdminTab() {
  if (!adminTab) return;
  setActiveTab('admin');
  setActiveView('dashboard');
  adminMessage.textContent = 'Panel admin activo.';
  adminTab.scrollIntoView({ behavior: 'smooth' });
}

function hideAdminTab() {
  if (!adminTab) return;
  adminTab.style.display = 'none';
  adminMessage.textContent = 'Panel admin cerrado.';
}

function renderAdminUser(user) {
  const row = document.createElement('div');
  row.className = 'admin-user-row';
  row.innerHTML = `
    <div class="meta">
      <strong>${user.name || user.email}</strong>
      <span class="muted">${user.email} • ${user.role}${user.country?(' • '+user.country):''}</span>
    </div>
    <div class="actions">
      <button class="btn btn-soft" data-id="${user.id || user._id}">Editar</button>
      <button class="btn btn-soft danger" data-id="${user.id || user._id}">Eliminar</button>
    </div>
  `;
  adminUserList.prepend(row);
}

function setSession(token, user, allowedModules = modules) {
  if (token) {
    localStorage.setItem('token', token);
    tokenBox.textContent = token;
  } else {
    localStorage.removeItem('token');
    tokenBox.textContent = 'Sin token';
  }

  currentUser = user || null;
  roleBox.textContent = user?.role ?? '-';
  countryBox.textContent = user?.country ?? '-';
  currentModules = token && user && Array.isArray(allowedModules) ? allowedModules : [];
  renderModules(currentModules);
  if (user) {
    showRolePanel(user.role, user, currentModules);
  }
  if (adminTab) {
    adminTab.style.display = canAccessAdminArea(user) ? 'block' : 'none';
  }
  // hide public UI (login/home) after successful login
  try { if (accessAside) accessAside.style.display = 'none'; } catch(e){}
  try { if (publicArea) publicArea.style.display = 'none'; } catch(e){}
  setActiveView('dashboard');
  if (user && ['superadmin', 'admin_pais'].includes(user.role)) {
    setActiveTab('admin');
  } else {
    setActiveTab('overview');
  }
}

function renderModuleDetail(module) {
  const detailTarget = document.getElementById('roleModuleDetail');
  if (!detailTarget) return;

  if (!module) {
    detailTarget.innerHTML = `
      <div class="module-detail-card empty">
        <span class="panel-kicker">Detalle</span>
        <h3>Selecciona un módulo</h3>
        <p>El panel mostrará aquí la lógica disponible para el rol actual.</p>
      </div>
    `;
    return;
  }

  detailTarget.innerHTML = `
    <div class="module-detail-card">
      <span class="panel-kicker">Detalle del módulo</span>
      <h3>${module.name}</h3>
      <p class="muted">Ruta: ${module.route}</p>
      <p>Acceso permitido para este rol. Aquí debería vivir la lógica real del módulo: listado, filtros, detalle y acciones CRUD según permisos.</p>
      <div class="module-detail-actions">
        <button type="button" class="btn btn-soft" data-open-module="${module.id}">Abrir módulo</button>
        <button type="button" class="btn btn-soft" data-focus-grid="true">Ver accesos</button>
      </div>
    </div>
  `;

  const openButton = detailTarget.querySelector('[data-open-module]');
  if (openButton) {
    openButton.addEventListener('click', () => {
      setActiveTab('modules');
      document.querySelector('[data-panel="modules"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setStatus(`Abriendo ${module.name}.`, false);
      showToast(`Módulo abierto: ${module.name}`, 'success');
    });
  }

  const focusGridButton = detailTarget.querySelector('[data-focus-grid]');
  if (focusGridButton) {
    focusGridButton.addEventListener('click', () => {
      setActiveTab('modules');
      document.querySelector('[data-panel="modules"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function showRolePanel(role, user, allowedModules = currentModules) {
  if (!rolePanel) return;
  rolePanel.style.display = 'block';
  const skeletonCards = rolePanel.querySelectorAll('.skeleton-card');
  skeletonCards.forEach((card) => card.remove());

  const roleLabel = role === 'superadmin' ? 'Superadmin' : role === 'admin_pais' ? 'Admin país' : role === 'editor' ? 'Editor' : 'Usuario';
  const summaryText = role === 'superadmin'
    ? 'Ve métricas globales y todos los módulos permitidos.'
    : role === 'admin_pais'
      ? `Trabaja solo con el país asignado: ${user?.country ?? 'sin país'}.`
      : role === 'editor'
        ? `Gestiona contenido de ${user?.country ?? 'tu país'} con alcance limitado.`
        : 'La sesión está activa, pero el rol no tiene accesos configurados.';

  rolePanelTitle.textContent = `Panel ${roleLabel}`;
  rolePanelContent.innerHTML = `
    <div class="role-summary-grid">
      <article class="role-summary-card">
        <span class="panel-kicker">Resumen</span>
        <h3>${roleLabel}</h3>
        <p>${summaryText}</p>
      </article>
      <article class="role-summary-card">
        <span class="panel-kicker">Contexto</span>
        <h3>${user?.country ?? 'Sin país'}</h3>
        <p>Los módulos visibles abajo vienen del backend y deben cambiar según el rol autenticado.</p>
      </article>
    </div>
    <div class="role-actions-bar">
      <span class="pill">${allowedModules.length} módulos permitidos</span>
      <span class="pill">${roleLabel}</span>
    </div>
    <div id="roleModuleDetail"></div>
  `;

  renderModuleDetail(allowedModules[0] ?? null);

  const detailButtons = rolePanel.querySelectorAll('[data-open-module]');
  detailButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const moduleId = button.getAttribute('data-open-module');
      const selected = allowedModules.find((item) => item.id === moduleId) ?? null;
      renderModuleDetail(selected);
    });
  });

  rolePanel.scrollIntoView({ behavior: 'smooth' });
}

function renderModuleWorkspaceEmpty() {
  if (!moduleWorkspace) return;
  moduleWorkspace.innerHTML = `
    <div class="module-detail-card empty">
      <span class="panel-kicker">Módulo activo</span>
      <h3>Selecciona un módulo</h3>
      <p>Al tocar una tarjeta se cargará aquí la lógica real de ese apartado.</p>
    </div>
  `;
}

function setModuleWorkspaceLoading(title, message) {
  if (!moduleWorkspace) return;
  moduleWorkspace.innerHTML = `
    <div class="module-detail-card">
      <span class="panel-kicker">${title}</span>
      <h3>Cargando</h3>
      <p>${message}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderModuleWorkspace(module, data = {}) {
  if (!moduleWorkspace) return;
  activeModuleId = module.id;

  if (module.kind === 'dashboard') {
    const metrics = data.metrics || {};
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Dashboard</span>
        <h3>Resumen del rol actual</h3>
        <p class="muted">${escapeHtml(currentUser?.role ?? 'usuario')}${currentUser?.country ? ` · ${escapeHtml(currentUser.country)}` : ''}</p>
        <div class="module-summary-grid">
          <article><strong>${escapeHtml(metrics.pendingRequests ?? '-')}</strong><span>Solicitudes pendientes</span></article>
          <article><strong>${escapeHtml(metrics.publishedTestimonials ?? '-')}</strong><span>Testimonios publicados</span></article>
          <article><strong>${escapeHtml(metrics.activeNews ?? '-')}</strong><span>Noticias activas</span></article>
        </div>
      </div>
    `;
    return;
  }

  if (module.kind === 'portals') {
    const portals = Array.isArray(data.portals) ? data.portals : [];
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Portales</span>
        <h3>Gestión de países o portales</h3>
        <p>Visible solo para superadmin.</p>
        <div class="module-list">
          ${portals.map((portal) => `
            <article class="module-row">
              <strong>${escapeHtml(portal.name)}</strong>
              <span>${escapeHtml(portal.country)}</span>
              <span class="module-tag ${portal.status === 'activo' ? '' : 'denied'}">${escapeHtml(portal.status)}</span>
            </article>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  if (module.kind === 'requests') {
    const requests = Array.isArray(data.requests) ? data.requests : [];
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Solicitudes</span>
        <h3>Gestión de solicitudes de contacto</h3>
        <div class="module-list">
          ${requests.map((request) => `
            <article class="module-row stack">
              <div>
                <strong>${escapeHtml(request.name)}</strong>
                <p>${escapeHtml(request.email)} · ${escapeHtml(request.phone)}</p>
                <p>${escapeHtml(request.purpose)}</p>
              </div>
              <div class="row-actions">
                <span class="module-tag">${escapeHtml(request.country)}</span>
                <span class="module-tag denied">${escapeHtml(request.status)}</span>
                <button type="button" class="btn btn-soft" data-request-detail="${escapeHtml(request.id)}">Detalle</button>
                <button type="button" class="btn btn-soft" data-request-next="${escapeHtml(request.id)}">Cambiar estado</button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
    bindRequestActions();
    return;
  }

  if (module.kind === 'testimonials') {
    const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Testimonios</span>
        <h3>Gestión de testimonios de éxito</h3>
        <form id="testimonialForm" class="form-grid compact">
          <input name="name" placeholder="Nombre" required />
          <input name="photo_url" placeholder="URL de foto" required />
          <textarea name="text" rows="4" placeholder="Texto del testimonio" required></textarea>
          <input name="country" placeholder="País" required />
          <input name="instagram_url" placeholder="Instagram (opcional)" />
          <input name="facebook_url" placeholder="Facebook (opcional)" />
          <select name="publication_status">
            <option value="borrador">borrador</option>
            <option value="publicado">publicado</option>
            <option value="despublicado">despublicado</option>
          </select>
          <button class="btn" type="submit">Guardar testimonio</button>
        </form>
        <div class="module-list">
          ${testimonials.map((testimonial) => `
            <article class="module-row stack">
              <div>
                <strong>${escapeHtml(testimonial.name)}</strong>
                <p>${escapeHtml(testimonial.country)} · ${escapeHtml(testimonial.publication_status)}</p>
                <p>${escapeHtml(testimonial.text)}</p>
              </div>
              <div class="row-actions">
                <button type="button" class="btn btn-soft" data-testimonial-edit="${escapeHtml(testimonial.id)}">Editar</button>
                <button type="button" class="btn btn-soft" data-testimonial-toggle="${escapeHtml(testimonial.id)}">Publicar / despublicar</button>
                <button type="button" class="btn btn-soft danger" data-testimonial-delete="${escapeHtml(testimonial.id)}">Eliminar</button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
    bindTestimonialCreateForm();
    bindTestimonialActions(testimonials);
    bindTestimonialEditActions(testimonials);
    return;
  }

  if (module.kind === 'news') {
    const news = Array.isArray(data.news) ? data.news : [];
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Noticias</span>
        <h3>Gestión de noticias</h3>
        <form id="newsForm" class="form-grid compact">
          <input name="title" placeholder="Título" required />
          <input name="summary" placeholder="Resumen" required />
          <textarea name="content" rows="5" placeholder="Contenido completo" required></textarea>
          <input name="country" placeholder="País" required />
          <input name="author" placeholder="Autor" required />
          <input name="image_url" placeholder="URL imagen principal (opcional)" />
          <select name="status">
            <option value="borrador">borrador</option>
            <option value="publicado">publicado</option>
          </select>
          <button class="btn" type="submit">Guardar noticia</button>
        </form>
        <div class="module-list">
          ${news.map((item) => `
            <article class="module-row stack">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.country)} · ${escapeHtml(item.author)}</p>
                <p>${escapeHtml(item.summary)}</p>
                <span class="module-tag">${escapeHtml(item.status)}</span>
              </div>
              <div class="row-actions">
                <button type="button" class="btn btn-soft" data-news-edit="${escapeHtml(item.id)}">Editar</button>
                <button type="button" class="btn btn-soft" data-news-toggle="${escapeHtml(item.id)}">Publicar / despublicar</button>
                <button type="button" class="btn btn-soft danger" data-news-delete="${escapeHtml(item.id)}">Eliminar</button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
    bindNewsCreateForm();
    bindNewsActions(news);
    bindNewsEditActions(news);
    return;
  }

  if (module.kind === 'detail') {
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card">
        <span class="panel-kicker">Detalle</span>
        <h3>Vista de detalle</h3>
        <p>Esta vista debe abrir el detalle de la solicitud, testimonio o noticia seleccionada. Aquí puedes reutilizar la lógica de listados y acciones específicas.</p>
      </div>
    `;
    return;
  }

  moduleWorkspace.innerHTML = `
    <div class="module-detail-card">
      <span class="panel-kicker">Perfil</span>
      <h3>Perfil del usuario</h3>
      <p>${escapeHtml(currentUser?.name ?? 'Usuario')} · ${escapeHtml(currentUser?.email ?? '')}</p>
    </div>
  `;
}

function hideRolePanel() {
  if (!rolePanel) return;
  rolePanel.style.display = 'none';
}

function showPublicUI() {
  try { if (accessAside) accessAside.style.display = 'block'; } catch(e){}
  try { if (publicArea) publicArea.style.display = 'block'; } catch(e){}
  setActiveView('home');
  setActiveTab('overview');
}

function getToken() {
  return localStorage.getItem('token');
}

function clearSessionState(message = 'Sesión cerrada o expirada. Vuelve a iniciar sesión.') {
  setSession(null, null, []);
  paintMetrics(null);
  metricsBox.textContent = message;
  setStatus(message, true);
  hideAdminTab();
  hideRolePanel();
  showPublicUI();
  renderModuleWorkspaceEmpty();
}

function renderModules(availableModules = modules) {
  moduleGrid.innerHTML = '';

  if (!availableModules.length) {
    moduleGrid.innerHTML = '<article class="module-card"><h4>Sin módulos</h4><p>Este rol no tiene módulos asignados.</p></article>';
    return;
  }

  for (const module of availableModules) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'module-card allowed';
    card.innerHTML = `
      <h4>${module.name}</h4>
      <p>${module.route}</p>
      <span class="module-tag">Abrir módulo</span>
    `;
    card.addEventListener('click', () => {
      setStatus(`Abriendo ${module.name} (${module.route})`);
      showToast(`Acceso permitido: ${module.name}`, 'success');
      loadModuleLogic(module);
      setActiveTab('modules');
      moduleWorkspace?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    moduleGrid.appendChild(card);
  }
}

function buildQueryString(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== null);
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

async function loadModuleLogic(module) {
  setModuleWorkspaceLoading(module.name, 'Cargando datos desde el backend...');

  try {
    if (module.kind === 'dashboard') {
      const metrics = await api('/api/v1/dashboard/metrics');
      renderModuleWorkspace(module, { metrics: metrics.metrics });
      return;
    }

    if (module.kind === 'portals') {
      const response = await api('/api/v1/portals');
      renderModuleWorkspace(module, { portals: response.portals || [] });
      return;
    }

    if (module.kind === 'requests') {
      const response = await api(`/api/v1/requests${buildQueryString({ status: 'pendiente' })}`);
      renderModuleWorkspace(module, { requests: response.requests || [] });
      return;
    }

    if (module.kind === 'testimonials') {
      const response = await api(`/api/v1/testimonials${buildQueryString({ country: currentUser?.role === 'superadmin' ? '' : currentUser?.country })}`);
      renderModuleWorkspace(module, { testimonials: response.testimonials || [] });
      return;
    }

    if (module.kind === 'news') {
      const response = await api(`/api/v1/news${buildQueryString({ country: currentUser?.role === 'superadmin' ? '' : currentUser?.country })}`);
      renderModuleWorkspace(module, { news: response.news || [] });
      return;
    }

    renderModuleWorkspace(module, {});
  } catch (error) {
    moduleWorkspace.innerHTML = `
      <div class="module-detail-card empty">
        <span class="panel-kicker">Error</span>
        <h3>No se pudo cargar ${module.name}</h3>
        <p>${error.message}</p>
      </div>
    `;
    showToast(error.message, 'error');
  }
}

function bindRequestActions() {
  if (!moduleWorkspace) return;
  moduleWorkspace.querySelectorAll('[data-request-detail]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestId = button.getAttribute('data-request-detail');
      if (!requestId) return;
      try {
        const response = await api(`/api/v1/requests/${requestId}`);
        const item = response.request;
        moduleWorkspace.innerHTML = `
          <div class="module-detail-card">
            <span class="panel-kicker">Solicitud</span>
            <h3>${item.name}</h3>
            <p>${item.email} · ${item.phone}</p>
            <p>${item.purpose}</p>
            <p class="muted">${item.country} · ${item.status}</p>
            <div class="module-detail-actions">
              <button type="button" class="btn btn-soft" data-request-next="${item.id}">Cambiar estado</button>
            </div>
          </div>
        `;
        bindRequestActions();
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });

  moduleWorkspace.querySelectorAll('[data-request-next]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestId = button.getAttribute('data-request-next');
      if (!requestId) return;
      try {
        const detail = await api(`/api/v1/requests/${requestId}`);
        const current = detail.request;
        const nextStatus = current.status === 'pendiente' ? 'gestionada' : current.status === 'gestionada' ? 'respondida' : 'respondida';
        await api(`/api/v1/requests/${requestId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus }),
        });
        showToast(`Solicitud actualizada a ${nextStatus}`, 'success');
        loadModuleLogic(currentModules.find((item) => item.kind === 'requests') || { kind: 'requests', name: 'Solicitudes' });
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function bindTestimonialCreateForm() {
  const form = document.getElementById('testimonialForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await api('/api/v1/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Testimonio guardado.', 'success');
      loadModuleLogic(currentModules.find((item) => item.kind === 'testimonials') || { kind: 'testimonials', name: 'Testimonios' });
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, { once: true });
}

function bindTestimonialActions() {
  if (!moduleWorkspace) return;
  moduleWorkspace.querySelectorAll('[data-testimonial-toggle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-testimonial-toggle');
      if (!id) return;
      try {
        await api(`/api/v1/testimonials/${id}/publication`, { method: 'PATCH' });
        showToast('Estado de publicación actualizado.', 'success');
        loadModuleLogic(currentModules.find((item) => item.kind === 'testimonials') || { kind: 'testimonials', name: 'Testimonios' });
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });

  moduleWorkspace.querySelectorAll('[data-testimonial-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-testimonial-delete');
      if (!id) return;
      if (!confirm('¿Eliminar este testimonio?')) return;
      try {
        await api(`/api/v1/testimonials/${id}`, { method: 'DELETE' });
        showToast('Testimonio eliminado.', 'success');
        loadModuleLogic(currentModules.find((item) => item.kind === 'testimonials') || { kind: 'testimonials', name: 'Testimonios' });
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function bindTestimonialEditActions(testimonials) {
  if (!moduleWorkspace) return;
  moduleWorkspace.querySelectorAll('[data-testimonial-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-testimonial-edit');
      const testimonial = testimonials.find((item) => item.id === id);
      if (!testimonial) return;

      moduleWorkspace.innerHTML = `
        <div class="module-detail-card">
          <span class="panel-kicker">Testimonios</span>
          <h3>Editar testimonio</h3>
          <form id="testimonialEditForm" class="form-grid compact">
            <input name="name" placeholder="Nombre" value="${escapeHtml(testimonial.name)}" required />
            <input name="photo_url" placeholder="URL de foto" value="${escapeHtml(testimonial.photo_url)}" required />
            <textarea name="text" rows="4" placeholder="Texto del testimonio" required>${escapeHtml(testimonial.text)}</textarea>
            <input name="country" placeholder="País" value="${escapeHtml(testimonial.country)}" required />
            <input name="instagram_url" placeholder="Instagram (opcional)" value="${escapeHtml(testimonial.instagram_url ?? '')}" />
            <input name="facebook_url" placeholder="Facebook (opcional)" value="${escapeHtml(testimonial.facebook_url ?? '')}" />
            <select name="publication_status">
              <option value="borrador" ${testimonial.publication_status === 'borrador' ? 'selected' : ''}>borrador</option>
              <option value="publicado" ${testimonial.publication_status === 'publicado' ? 'selected' : ''}>publicado</option>
              <option value="despublicado" ${testimonial.publication_status === 'despublicado' ? 'selected' : ''}>despublicado</option>
            </select>
            <div class="module-detail-actions">
              <button class="btn" type="submit">Guardar cambios</button>
              <button class="btn btn-soft" type="button" data-edit-cancel="testimonials">Cancelar</button>
            </div>
          </form>
        </div>
      `;

      const form = document.getElementById('testimonialEditForm');
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());
        try {
          await api(`/api/v1/testimonials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          showToast('Testimonio actualizado.', 'success');
          loadModuleLogic(currentModules.find((item) => item.kind === 'testimonials') || { kind: 'testimonials', name: 'Testimonios' });
        } catch (error) {
          showToast(error.message, 'error');
        }
      });

      moduleWorkspace.querySelector('[data-edit-cancel="testimonials"]')?.addEventListener('click', () => {
        loadModuleLogic(currentModules.find((item) => item.kind === 'testimonials') || { kind: 'testimonials', name: 'Testimonios' });
      });
    });
  });
}

function bindNewsCreateForm() {
  const form = document.getElementById('newsForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await api('/api/v1/news', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Noticia guardada.', 'success');
      loadModuleLogic(currentModules.find((item) => item.kind === 'news') || { kind: 'news', name: 'Noticias' });
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, { once: true });
}

function bindNewsActions() {
  if (!moduleWorkspace) return;
  moduleWorkspace.querySelectorAll('[data-news-toggle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-news-toggle');
      if (!id) return;
      try {
        await api(`/api/v1/news/${id}/status`, { method: 'PATCH' });
        showToast('Estado de noticia actualizado.', 'success');
        loadModuleLogic(currentModules.find((item) => item.kind === 'news') || { kind: 'news', name: 'Noticias' });
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });

  moduleWorkspace.querySelectorAll('[data-news-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-news-delete');
      if (!id) return;
      if (!confirm('¿Eliminar esta noticia?')) return;
      try {
        await api(`/api/v1/news/${id}`, { method: 'DELETE' });
        showToast('Noticia eliminada.', 'success');
        loadModuleLogic(currentModules.find((item) => item.kind === 'news') || { kind: 'news', name: 'Noticias' });
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function bindNewsEditActions(newsItems) {
  if (!moduleWorkspace) return;
  moduleWorkspace.querySelectorAll('[data-news-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-news-edit');
      const newsItem = newsItems.find((item) => item.id === id);
      if (!newsItem) return;

      moduleWorkspace.innerHTML = `
        <div class="module-detail-card">
          <span class="panel-kicker">Noticias</span>
          <h3>Editar noticia</h3>
          <form id="newsEditForm" class="form-grid compact">
            <input name="title" placeholder="Título" value="${escapeHtml(newsItem.title)}" required />
            <input name="summary" placeholder="Resumen" value="${escapeHtml(newsItem.summary)}" required />
            <textarea name="content" rows="5" placeholder="Contenido completo" required>${escapeHtml(newsItem.content)}</textarea>
            <input name="country" placeholder="País" value="${escapeHtml(newsItem.country)}" required />
            <input name="author" placeholder="Autor" value="${escapeHtml(newsItem.author)}" required />
            <input name="image_url" placeholder="URL imagen principal (opcional)" value="${escapeHtml(newsItem.image_url ?? '')}" />
            <select name="status">
              <option value="borrador" ${newsItem.status === 'borrador' ? 'selected' : ''}>borrador</option>
              <option value="publicado" ${newsItem.status === 'publicado' ? 'selected' : ''}>publicado</option>
            </select>
            <div class="module-detail-actions">
              <button class="btn" type="submit">Guardar cambios</button>
              <button class="btn btn-soft" type="button" data-edit-cancel="news">Cancelar</button>
            </div>
          </form>
        </div>
      `;

      const form = document.getElementById('newsEditForm');
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());
        try {
          await api(`/api/v1/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          showToast('Noticia actualizada.', 'success');
          loadModuleLogic(currentModules.find((item) => item.kind === 'news') || { kind: 'news', name: 'Noticias' });
        } catch (error) {
          showToast(error.message, 'error');
        }
      });

      moduleWorkspace.querySelector('[data-edit-cancel="news"]')?.addEventListener('click', () => {
        loadModuleLogic(currentModules.find((item) => item.kind === 'news') || { kind: 'news', name: 'Noticias' });
      });
    });
  });
}

function paintMetrics(metrics) {
  kpiPending.textContent = metrics?.pendingRequests ?? '-';
  kpiTestimonials.textContent = metrics?.publishedTestimonials ?? '-';
  kpiNews.textContent = metrics?.activeNews ?? '-';
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      clearSessionState(data.error_message || 'Tu sesión expiró.');
    }
    throw new Error(data.error_message || data.message || 'Error en la petición');
  }

  return data;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    setLoadingState(true);
    const data = await api('/api/v1/user/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSession(data.token, data.user, data.modules);
    setStatus('Sesion iniciada. La vista fue adaptada al rol del usuario.');
    metricsBox.textContent = JSON.stringify(data, null, 2);
    showToast('Sesion iniciada correctamente.', 'success');
  } catch (error) {
    setStatus(error.message, true);
    showToast(error.message, 'error');
  } finally {
    setLoadingState(false);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    setLoadingState(true);
    await api('/api/v1/user/logout', { method: 'POST' });
    setSession(null, null);
    paintMetrics(null);
    metricsBox.textContent = 'Sesión cerrada.';
    setStatus('Logout ejecutado correctamente.');
    showToast('Sesión cerrada.', 'success');
    hideAdminTab();
    hideRolePanel();
    showPublicUI();
    setActiveView('home');
    setActiveTab('overview');
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoadingState(false);
  }
});

const existingToken = getToken();
renderModules(currentModules);

if (existingToken) {
  tokenBox.textContent = existingToken;
  api('/api/v1/user/me')
    .then((data) => {
      setSession(existingToken, data.user, data.modules);
      metricsBox.textContent = JSON.stringify(data, null, 2);
      setStatus('Sesión restaurada correctamente.');
      paintMetrics(null);
    })
    .catch((error) => {
      clearSessionState(error.message || 'Tu sesión expiró.');
    });
}

if (!existingToken) {
  renderModules(currentModules);
}

if (adminCreateForm) {
  adminCreateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(adminCreateForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      setLoadingState(true);
      const data = await api('/api/v1/user/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      adminMessage.textContent = 'Usuario creado desde panel admin.';
      showToast('Usuario creado (admin).', 'success');
      try { renderAdminUser(data.user || data); } catch (e) {}
      adminCreateForm.reset();
    } catch (error) {
      adminMessage.textContent = error.message;
      showToast(error.message, 'error');
    } finally {
      setLoadingState(false);
    }
  });
}

renderModuleWorkspaceEmpty();
