import { Router } from 'express';
import demoPaymentRoute from './payment.route';

class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		demoPaymentRoute(this.router);
		// transactRoutes(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
