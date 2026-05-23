"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("../../../core/routes");
const dashboard_1 = require("../../services/controller/dashboard");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class DashboardRoutes extends routes_1.RoutesApp {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.dashboardController = new dashboard_1.DashboardController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        // authenticate → verifica que el JWT sea válido
        // authorize(roles) → verifica que el rol tenga permiso
        this.router.get('/metrics', auth_middleware_1.authenticate, // primero autenticar
        (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), // luego autorizar
        this.dashboardController.getMetrics.bind(this.dashboardController));
    }
}
exports.DashboardRoutes = DashboardRoutes;
