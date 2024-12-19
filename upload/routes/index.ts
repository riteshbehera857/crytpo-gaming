import { Router } from 'express';
import uploadFileRoute from '../routes/upload.route';
class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		uploadFileRoute(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
