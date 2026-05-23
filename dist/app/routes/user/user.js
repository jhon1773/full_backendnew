"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const user_1 = require("../../services/controller/user");
const routes_1 = require("../../../core/routes");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
class AuthRoutes extends routes_1.RoutesApp {
    constructor() {
        super(); // Llama al constructor de la clase padre (RoutesApp)
        this.router = (0, express_1.Router)();
        this.userController = new user_1.UserController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        this.router.post('/create', this.userController.create),
            this.router.post('/', this.userController.login),
            this.router.post('/logout', auth_middleware_1.authenticate, this.userController.logout.bind(this.userController));
    }
}
exports.AuthRoutes = AuthRoutes;
