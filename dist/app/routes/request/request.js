"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("../../../core/routes");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const contact_request_1 = require("../../services/controller/contact-request");
class RequestRoutes extends routes_1.RoutesApp {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.requestController = new contact_request_1.ContactRequestController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        this.router.post('/public', this.requestController.createPublic.bind(this.requestController));
        this.router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais'), this.requestController.list.bind(this.requestController));
        this.router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais'), this.requestController.detail.bind(this.requestController));
        this.router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais'), this.requestController.updateStatus.bind(this.requestController));
        this.router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais'), this.requestController.delete.bind(this.requestController));
    }
}
exports.RequestRoutes = RequestRoutes;
