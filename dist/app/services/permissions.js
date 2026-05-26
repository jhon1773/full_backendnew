"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedModules = exports.APP_MODULES = void 0;
exports.APP_MODULES = [
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
function getAllowedModules(role) {
    return exports.APP_MODULES.filter((module) => module.roles.includes(role)).map((module) => ({
        id: module.id,
        name: module.name,
        route: module.route,
    }));
}
exports.getAllowedModules = getAllowedModules;
