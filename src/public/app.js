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
const createForm = document.getElementById('createForm');
const logoutBtn = document.getElementById('logoutBtn');
const metricsBtn = document.getElementById('metricsBtn');
const adminTab = document.getElementById('adminTab');
const adminCreateForm = document.getElementById('adminCreateForm');
const adminUserList = document.getElementById('adminUserList');
const adminMessage = document.getElementById('adminMessage');
const rolePanel = document.getElementById('rolePanel');
const rolePanelTitle = document.getElementById('rolePanelTitle');
const rolePanelContent = document.getElementById('rolePanelContent');
const accessAside = document.getElementById('accessAside');
const publicArea = document.getElementById('publicArea');

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
  adminTab.style.display = 'block';
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
  // hide public UI (login/create/dashboard) after successful login
  try { if (accessAside) accessAside.style.display = 'none'; } catch(e){}
  try { if (publicArea) publicArea.style.display = 'none'; } catch(e){}
}

function showRolePanel(role, user) {
  if (!rolePanel) return;
  rolePanel.style.display = 'block';
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

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(createForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await api('/api/v1/user/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setStatus('Usuario creado correctamente. Ya puedes iniciar sesión.');
    showToast('Usuario creado correctamente.', 'success');
    metricsBox.textContent = JSON.stringify(data, null, 2);
    // If admin panel is open, add user to list
    try { renderAdminUser(data.user || data); } catch(e){}
  } catch (error) {
    setStatus(error.message, true);
    showToast(error.message, 'error');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
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
  }
});

metricsBtn.addEventListener('click', async () => {
  try {
    const data = await api('/api/v1/dashboard/metrics', { method: 'GET' });
    metricsBox.textContent = JSON.stringify(data, null, 2);
    paintMetrics(data.metrics);
    setStatus('Dashboard cargado correctamente.');
  } catch (error) {
    setStatus(error.message, true);
    metricsBox.textContent = 'No se pudieron cargar las métricas.';
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await api('/api/v1/user/logout', { method: 'POST' });
    setSession(null, null);
    paintMetrics(null);
    metricsBox.textContent = 'Sesión cerrada.';
    setStatus('Logout ejecutado correctamente.');
    showToast('Sesión cerrada.', 'success');
    hideAdminTab();
    hideRolePanel();
    showPublicUI();
  } catch (error) {
    setStatus(error.message, true);
  }
});

const existingToken = getToken();
renderModules(null);

if (existingToken) {
  tokenBox.textContent = existingToken;
  setStatus('Token encontrado en localStorage. Inicia sesion para refrescar rol y permisos.');
}

// Admin create handler
if (adminCreateForm) {
  adminCreateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(adminCreateForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      const data = await api('/api/v1/user/create', { method: 'POST', body: JSON.stringify(payload) });
      adminMessage.textContent = 'Usuario creado desde panel admin.';
      showToast('Usuario creado (admin).', 'success');
      try { renderAdminUser(data.user || data); } catch(e){}
    } catch (err) {
      adminMessage.textContent = err.message;
      showToast(err.message, 'error');
    }
  });
}
