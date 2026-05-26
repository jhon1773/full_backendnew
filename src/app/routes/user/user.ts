import { Router } from "express";
import { UserController } from "../../services/controller/user";
import { RoutesApp } from "../../../core/routes";
import { authenticate, authorize } from '../../middlewares/auth.middleware';

export class AuthRoutes extends RoutesApp {

    public router: Router;
    private userController: UserController;

    constructor() {
        super(); // Llama al constructor de la clase padre (RoutesApp)
        this.router = Router();
        this.userController = new UserController();
        this.setServicesRoutes();
    }

    protected setServicesRoutes(): void {
        // Crear usuarios: pública para usuarios normales (editor). La creación de admins la controla el backend (solo superadmin).
        this.router.post('/create', this.userController.create.bind(this.userController)),
        // Listar usuarios: superadmin ve todos, admin_pais ve usuarios de su país
        this.router.get('/', authenticate, authorize('superadmin', 'admin_pais'), this.userController.list.bind(this.userController)),
        this.router.get('/me', authenticate, this.userController.me.bind(this.userController)),
        this.router.post('/', this.userController.login.bind(this.userController)),
        this.router.post('/logout', authenticate, this.userController.logout.bind(this.userController));
    }
}   