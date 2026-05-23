"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("../../../core/routes");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const portal_1 = require("../../services/controller/portal");
class PortalRoutes extends routes_1.RoutesApp {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.portalController = new portal_1.PortalController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        this.router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin'), this.portalController.list.bind(this.portalController));
    }
}
exports.PortalRoutes = PortalRoutes;
