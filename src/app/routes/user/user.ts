import { Router } from "express";
import { UserController } from "../../services/controller/user";
import { RoutesApp } from "../../../core/routes";
import { authenticate } from '../../middlewares/auth.middleware';

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
        this.router.post('/create', this.userController.create),
        this.router.post('/', this.userController.login),
        this.router.post('/logout', authenticate, this.userController.logout.bind(this.userController));
    }
}   