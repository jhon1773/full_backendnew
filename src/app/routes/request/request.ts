import { Router } from 'express';
import { RoutesApp } from '../../../core/routes';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { ContactRequestController } from '../../services/controller/contact-request';

export class RequestRoutes extends RoutesApp {
  public router: Router;
  private requestController: ContactRequestController;

  constructor() {
    super();
    this.router = Router();
    this.requestController = new ContactRequestController();
    this.setServicesRoutes();
  }

  protected setServicesRoutes(): void {
    this.router.post('/public', this.requestController.createPublic.bind(this.requestController));
    this.router.get('/', authenticate, authorize('superadmin', 'admin_pais'), this.requestController.list.bind(this.requestController));
    this.router.get('/:id', authenticate, authorize('superadmin', 'admin_pais'), this.requestController.detail.bind(this.requestController));
    this.router.patch('/:id/status', authenticate, authorize('superadmin', 'admin_pais'), this.requestController.updateStatus.bind(this.requestController));
    this.router.delete('/:id', authenticate, authorize('superadmin', 'admin_pais'), this.requestController.delete.bind(this.requestController));
  }
}