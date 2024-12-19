import { Router } from 'express';
import getLogger from '../../common/logger';
import { model } from 'mongoose';
import { catchAsync } from '../../common/lib';
import { Request, Response, NextFunction } from 'express';
import { DemoPaymentController } from '../controllers/demoPayment.controller';

const route = Router();

const log = getLogger(module);

export default (app: Router) => {
	app.use('/payment', route);

	route.post(
		'/deposit',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await DemoPaymentController.deposit(req, res, next);

			res.status(200).json(response);
		}),
	);
};
