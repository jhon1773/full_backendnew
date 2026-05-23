const statusBox = document.getElementById('statusBox');
const metricsBox = document.getElementById('metricsBox');
const tokenBox = document.getElementById('tokenBox');
const roleBox = document.getElementById('roleBox');
const countryBox = document.getElementById('countryBox');
const moduleGrid = document.getElementById('moduleGrid');
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
  },
  {
    id: 'paises',
    name: 'Gestion de paises',
    route: '/paises',
    roles: ['superadmin'],
  },
  {
    id: 'solicitudes',
    name: 'Solicitudes de contacto',
    route: '/solicitudes',
    roles: ['superadmin', 'admin_pais'],
  },
  {
    id: 'testimonios',
    name: 'Testimonios de exito',
    route: '/testimonios',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
  {
    id: 'noticias',
    name: 'Noticias',
    route: '/noticias',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
  {
    id: 'detalle',
    name: 'Detalle / Edicion',
    route: '/detalle/:tipo/:id',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
  {
    id: 'perfil',
    name: 'Perfil de usuario',
    route: '/perfil',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
];

let currentUser = null;
let currentTab = 'overview';
let currentView = 'home';

function setLoadingState(isLoading) {
  const targets = [metricsBox, statusBox, adminMessage];
  for (const target of targets) {
    if (!target) continue;
    target.classList.toggle('loading-state', isLoading);
  }
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
  statusBox.style.color = isError ? '#b91c1c' : '#0f172a';
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

function setSession(token, user) {
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
  renderModules(user?.role);
  // show role-specific panel when session is set
  if (user) showRolePanel(user.role, user);
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

function showRolePanel(role, user) {
  if (!rolePanel) return;
  rolePanel.style.display = 'block';
  const skeletonCards = rolePanel.querySelectorAll('.skeleton-card');
  skeletonCards.forEach((card) => card.remove());
  if (role === 'editor') {
    rolePanelTitle.textContent = 'Panel Editor';
    rolePanelContent.innerHTML = `
      <p class="placeholder">Herramientas para crear y editar contenido.</p>
      <button id="editorCreateBtn" class="btn btn-soft">Crear contenido</button>
      <div id="editorList">No hay contenido cargado.</div>
    `;
    // attach any editor handlers if necessary
    const btn = document.getElementById('editorCreateBtn');
    if (btn) btn.addEventListener('click', () => showToast('Crear contenido (placeholder)', 'success'));
  } else if (role === 'admin_pais' || role === 'superadmin') {
    rolePanelTitle.textContent = 'Panel Admin Resumen';
    rolePanelContent.innerHTML = `
      <p class="placeholder">Resumen rápido del panel administrativo.</p>
      <button id="openAdminBtn" class="btn">Abrir Panel Admin</button>
    `;
    const openBtn = document.getElementById('openAdminBtn');
    if (openBtn) openBtn.addEventListener('click', () => { showAdminTab(); });
    // also ensure adminTab visible
    showAdminTab();
  } else {
    rolePanelTitle.textContent = 'Panel Usuario';
    rolePanelContent.innerHTML = `
      <p class="placeholder">Vista adaptada al rol: <strong>${role || 'usuario'}</strong></p>
      <p>Puedes ver los módulos disponibles y tus métricas.</p>
    `;
  }
  rolePanel.scrollIntoView({ behavior: 'smooth' });
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

function renderModules(role) {
  moduleGrid.innerHTML = '';

  for (const module of modules) {
    const allowed = role && module.roles.includes(role);
    const card = document.createElement('article');
    card.className = `module-card ${allowed ? '' : 'denied'}`.trim();
    card.innerHTML = `
      <h4>${module.name}</h4>
      <p>${module.route}</p>
      <span class="module-tag ${allowed ? '' : 'denied'}">${allowed ? 'Permitido' : 'Sin acceso'}</span>
    `;
    moduleGrid.appendChild(card);
  }
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

    setSession(data.token, data.user);
    setStatus('Sesion iniciada. La vista fue adaptada al rol del usuario.');
    metricsBox.textContent = JSON.stringify(data, null, 2);
    showToast('Sesion iniciada correctamente.', 'success');
    // Redirect to admin tab for admin roles
    if (data.user && ['superadmin','admin_pais'].includes(data.user.role)) {
      showAdminTab();
    }
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
renderModules(null);

if (existingToken) {
  tokenBox.textContent = existingToken;
  setStatus('Token encontrado en localStorage. Inicia sesion para refrescar rol y permisos.');
  setActiveView('home');
  setActiveTab('overview');
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
