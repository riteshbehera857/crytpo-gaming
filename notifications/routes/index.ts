import { Router } from 'express';
import deviceRoute from './device.route';
import notificationRoute from './notification.route';

class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		deviceRoute(this.router);
		notificationRoute(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
