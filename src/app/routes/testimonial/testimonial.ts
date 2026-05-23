import { Router } from 'express';
import { RoutesApp } from '../../../core/routes';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { TestimonialController } from '../../services/controller/testimonial';

export class TestimonialRoutes extends RoutesApp {
  public router: Router;
  private testimonialController: TestimonialController;

  constructor() {
    super();
    this.router = Router();
    this.testimonialController = new TestimonialController();
    this.setServicesRoutes();
  }

  protected setServicesRoutes(): void {
    this.router.get('/', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.testimonialController.list.bind(this.testimonialController));
    this.router.post('/', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.testimonialController.create.bind(this.testimonialController));
    this.router.put('/:id', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.testimonialController.update.bind(this.testimonialController));
    this.router.delete('/:id', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.testimonialController.delete.bind(this.testimonialController));
    this.router.patch('/:id/publication', authenticate, authorize('superadmin', 'admin_pais', 'editor'), this.testimonialController.togglePublication.bind(this.testimonialController));
  }
}