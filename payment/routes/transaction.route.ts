import { Router, NextFunction, Request, Response } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import { catchAsync } from '../../common/lib';
import {
	TransactionEnum,
	TransactionTypesEnum,
} from '../../common/types/transaction';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();

export default (app: Router) => {
	app.use('/transaction', router);

	router.post(
		'/user-transactions',
		celebrate({
			[Segments.BODY]: Joi.object({
				startDate: Joi.date().optional(),
				endDate: Joi.date().optional(),
				transactionType: Joi.string()
					.valid(...Object.values(TransactionTypesEnum))
					.optional(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await TransactionController.getUserTransactions(
				req,
				res,
				next,
			);

			res.status(200).json(response);
		}),
	);

	router.get(
		'/types',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await TransactionController.getTransactionTypes(
				req,
				res,
				next,
			);

			res.status(200).json(response);
		}),
	);
};
