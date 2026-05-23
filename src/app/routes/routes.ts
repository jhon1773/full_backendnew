import { Express } from "express";
import { AuthRoutes } from "./user/user";
import { DashboardRoutes } from "./dashboard/dashboard";
import { PortalRoutes } from "./portal/portal";
import { RequestRoutes } from "./request/request";
import { TestimonialRoutes } from "./testimonial/testimonial";
import { NewsRoutes } from "./news/news";

export class RoutesApi {
    private _app: Express; //Api principal
    private authRouter: AuthRoutes;
    private dashboardRouter: DashboardRoutes;
    private portalRouter: PortalRoutes;
    private requestRouter: RequestRoutes;
    private testimonialRouter: TestimonialRoutes;
    private newsRouter: NewsRoutes;

    constructor(app: Express) {
        this._app = app;
        this.authRouter = new AuthRoutes();
        this.dashboardRouter = new DashboardRoutes();
        this.portalRouter = new PortalRoutes();
        this.requestRouter = new RequestRoutes();
        this.testimonialRouter = new TestimonialRoutes();
        this.newsRouter = new NewsRoutes();
        this.initRoutes();
    }

    private initRoutes(): void {
        this._app.use('/api/v1/user', this.authRouter.router);
        this._app.use('/api/v1/dashboard', this.dashboardRouter.router);
        this._app.use('/api/v1/portals', this.portalRouter.router);
        this._app.use('/api/v1/requests', this.requestRouter.router);
        this._app.use('/api/v1/testimonials', this.testimonialRouter.router);
        this._app.use('/api/v1/news', this.newsRouter.router);
    }
}


//localhost:3000/api/v1/user/create