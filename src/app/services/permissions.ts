export type AppRole = 'superadmin' | 'admin_pais' | 'editor';

export interface AppModule {
  id: string;
  name: string;
  route: string;
  roles: AppRole[];
}

export const APP_MODULES: AppModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard principal',
    route: '/dashboard',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
  {
    id: 'portals',
    name: 'Gestión de países o portales',
    route: '/portals',
    roles: ['superadmin'],
  },
  {
    id: 'requests',
    name: 'Gestión de solicitudes',
    route: '/requests',
    roles: ['superadmin', 'admin_pais'],
  },
  {
    id: 'testimonials',
    name: 'Gestión de testimonios',
    route: '/testimonials',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
  {
    id: 'news',
    name: 'Gestión de noticias',
    route: '/news',
    roles: ['superadmin', 'admin_pais', 'editor'],
  },
];

export function getAllowedModules(role: AppRole) {
  return APP_MODULES.filter((module) => module.roles.includes(role)).map((module) => ({
    id: module.id,
    name: module.name,
    route: module.route,
  }));
}