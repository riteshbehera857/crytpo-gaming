import { Router } from 'express';
import ruleRoutes from './rule.route';
import transactionRoutes from './transaction.route';
import walletRoutes from './wallet.route';

class Routes {
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		ruleRoutes(this.router);
		transactionRoutes(this.router);
		walletRoutes(this.router);
	}

	public getRouter(): Router {
		return this.router;
	}
}

export default Routes;
