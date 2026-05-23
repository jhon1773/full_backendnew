import { Router } from 'express';
import { RoutesApp } from '../../../core/routes';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { PortalController } from '../../services/controller/portal';

export class PortalRoutes extends RoutesApp {
  public router: Router;
  private portalController: PortalController;

  constructor() {
    super();
    this.router = Router();
    this.portalController = new PortalController();
    this.setServicesRoutes();
  }

  protected setServicesRoutes(): void {
    this.router.get('/', authenticate, authorize('superadmin'), this.portalController.list.bind(this.portalController));
  }
}