"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("../../../core/routes");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const testimonial_1 = require("../../services/controller/testimonial");
class TestimonialRoutes extends routes_1.RoutesApp {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.testimonialController = new testimonial_1.TestimonialController();
        this.setServicesRoutes();
    }
    setServicesRoutes() {
        this.router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.testimonialController.list.bind(this.testimonialController));
        this.router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.testimonialController.create.bind(this.testimonialController));
        this.router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.testimonialController.update.bind(this.testimonialController));
        this.router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.testimonialController.delete.bind(this.testimonialController));
        this.router.patch('/:id/publication', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('superadmin', 'admin_pais', 'editor'), this.testimonialController.togglePublication.bind(this.testimonialController));
    }
}
exports.TestimonialRoutes = TestimonialRoutes;
