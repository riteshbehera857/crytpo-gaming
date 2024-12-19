import { NextFunction, Request } from 'express';
import getLogger from '../../common/logger';
import TransactionService from '../services/transaction.service';
import { ITransaction } from '../../common/interfaces/transaction.interface';
import { Transaction } from '../../common/classes/transaction.class';

const log = getLogger(module);

// controller for transaction
export default class TransactionController {
	// Method for creating a transaction
	public static async createTransaction(req: Request, next: NextFunction) {
		const transactionService = new TransactionService(); // Create a new instance of TransactionService

		try {
			const data: ITransaction = { ...req.body };
			const currentPlayer = req.currentUser;
			// Attempt to create a transaction using TransactionService
			const transaction = await transactionService.createTransaction(
				data as any,
				currentPlayer,
			);
			// Return the created transaction

			return {
				user: transaction.data.newPlayer?._id,
				status: transaction?.message,
				requestUuid: transaction.data.newTransaction?.details?.requestUuid,
				balance: transaction.data.newPlayer?.currentBalance,
			};
		} catch (error) {
			// If an error occurs during the transaction creation process
			return next(error);
		}
	}
}
