import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import Container from 'typedi';
import { TransactionService } from '../services/transaction.service';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import config from '../../common/config';

class TransactionController {
	private static log: Logger = getLogger(module);
	private static transactionService = Container.get(TransactionService);

	public static async getTransactionTypes(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /transaction/types');
		try {
			const response = await this.transactionService.getTransactionTypes();

			return response;
		} catch (error) {
			next(error);
		}
	}

	public static async getUserTransactions(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /transaction/user-transactions with body', {
			...req.body,
		});
		try {
			const user = req.currentUser;

			const transactionType = req.body.transactionType;
			const startDate = req.body.startDate;

			const endDate = req.body.endDate;

			const params = {
				startDate,
				endDate,
				...(transactionType ? { transactionType } : null),
			};

			const response = await this.transactionService.getUserTransactions(
				params,
				user._id,
			);

			return response;
		} catch (error) {
			next(error);
		}
	}
}

export { TransactionController };
