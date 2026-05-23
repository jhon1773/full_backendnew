"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesApi = void 0;
const user_1 = require("./user/user");
const dashboard_1 = require("./dashboard/dashboard");
const portal_1 = require("./portal/portal");
const request_1 = require("./request/request");
const testimonial_1 = require("./testimonial/testimonial");
const news_1 = require("./news/news");
class RoutesApi {
    constructor(app) {
        this._app = app;
        this.authRouter = new user_1.AuthRoutes();
        this.dashboardRouter = new dashboard_1.DashboardRoutes();
        this.portalRouter = new portal_1.PortalRoutes();
        this.requestRouter = new request_1.RequestRoutes();
        this.testimonialRouter = new testimonial_1.TestimonialRoutes();
        this.newsRouter = new news_1.NewsRoutes();
        this.initRoutes();
    }
    initRoutes() {
        this._app.use('/api/v1/user', this.authRouter.router);
        this._app.use('/api/v1/dashboard', this.dashboardRouter.router);
        this._app.use('/api/v1/portals', this.portalRouter.router);
        this._app.use('/api/v1/requests', this.requestRouter.router);
        this._app.use('/api/v1/testimonials', this.testimonialRouter.router);
        this._app.use('/api/v1/news', this.newsRouter.router);
    }
}
exports.RoutesApi = RoutesApi;
//localhost:3000/api/v1/user/create
