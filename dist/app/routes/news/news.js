"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("../../../core/routes");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const news_1 = require("../../services/controller/news");
class NewsRoutes extends routes_1.RoutesApp {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.newsController = new news_1.NewsController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        this.router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.newsController.list.bind(this.newsController));
        this.router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.newsController.create.bind(this.newsController));
        this.router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.newsController.update.bind(this.newsController));
        this.router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.newsController.delete.bind(this.newsController));
        this.router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.newsController.toggleStatus.bind(this.newsController));
    }
}
exports.NewsRoutes = NewsRoutes;
