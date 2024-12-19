import { Router } from 'express';
import config from './config.route';
import deposit from './deposit.route';
import Withdrawal from './withdrawal.route';
import externalPGRoute from './externalPG.route';
import transactionRoute from './transaction.route';

class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		config(this.router);
		deposit(this.router);
		Withdrawal(this.router);
		externalPGRoute(this.router);
		transactionRoute(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
