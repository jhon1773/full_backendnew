import { Router } from 'express';
import { RoutesApp } from '../../../core/routes';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { NewsController } from '../../services/controller/news';

export class NewsRoutes extends RoutesApp {
  public router: Router;
  private newsController: NewsController;

  constructor() {
    super();
    this.router = Router();
    this.newsController = new NewsController();
    this.setServicesRoutes();
  }

  protected setServicesRoutes(): void {
    this.router.get('/', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.newsController.list.bind(this.newsController));
    this.router.post('/', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.newsController.create.bind(this.newsController));
    this.router.put('/:id', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.newsController.update.bind(this.newsController));
    this.router.delete('/:id', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.newsController.delete.bind(this.newsController));
    this.router.patch('/:id/status', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.newsController.toggleStatus.bind(this.newsController));
  }
}