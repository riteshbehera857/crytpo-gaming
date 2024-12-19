import { Router } from 'express';
import authRoute from './auth.route';

class Routes {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        authRoute(this.router)
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default Routes;
