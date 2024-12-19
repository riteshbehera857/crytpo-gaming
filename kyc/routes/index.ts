import { Router } from 'express';
import kycRoute from './kyc.route';

class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		kycRoute(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
