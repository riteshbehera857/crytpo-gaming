import { Router } from 'express';
import authRoutes from './auth.route';
import playerRoutes from './player.route';
import gameRoutes from './game.route';
import notification from './notification.route';
import cryptoRoutes from './../../crypto/routes/cryptoroute';



class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		authRoutes(this.router);
		playerRoutes(this.router);
		gameRoutes(this.router);
		notification(this.router);
		cryptoRoutes(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
