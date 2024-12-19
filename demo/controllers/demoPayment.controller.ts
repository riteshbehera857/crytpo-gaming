import { Request, Response, NextFunction } from 'express';
import getLogger from '../../common/logger';
import Container from 'typedi';
import { DemoPaymentService } from '../services/demoPayment.service';

const logger = getLogger(module);

class DemoPaymentController {
	static async deposit(req: Request, res: Response, next: NextFunction) {
		logger.info('Calling /demo/payment/deposit: ' + JSON.stringify(req.body));

		try {
			const user = req.currentUser;

			const demoPaymentService = Container.get(DemoPaymentService);

			const response = await demoPaymentService.demoDeposit(user, req.body);

			return response;
		} catch (error) {
			logger.error('Error: ' + error);

			next(error);
		}
	}
}

export { DemoPaymentController };
