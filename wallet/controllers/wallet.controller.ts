import { NextFunction, Request, Response } from 'express';
import getLogger from '../../common/logger';
import TransactionService from '../services/transaction.service';
import { ITransaction } from '../../common/interfaces/transaction.interface';
import { Transaction } from '../../common/classes/transaction.class';

export default class WalletController {
	private static log = getLogger(module);

	public static async walletBet(req: Request, next: NextFunction) {
		const startTime = Date.now();
		this.log.debug(
			'Calling api /wallet/bet' +
				JSON.stringify({
					...req.body,
				}),
		);

		const transactionService = new TransactionService(); // Create a new instance of TransactionService
		try {
			const data: ITransaction = { ...req.body };

			const currentPlayer = req.currentUser;

			const response = await transactionService.createBetTransaction(
				data,
				currentPlayer,
			);

			const endTime = Date.now(); // Record the end time
			const duration = endTime - startTime;

			this.log.debug(`Total time Duration by bet: ${duration}ms`);

			// sendBalanceUpdate(response?.data?.playerResponse?._id.toString());

			console.log('---------------------------------------------');
			console.log(response.data);
			console.log('---------------------------------------------');

			if (response?.data?.playerResponse) {
				return {
					user: response?.data?.playerResponse?._id,
					code: response?.code,
					status: response?.message,
					requestUuid: response.data.betTransaction.details?.requestUuid,
					balance: response?.data.playerResponse?.currentBalance,
				};
			}

			return {
				user: response?.data?.player?._id,
				code: response?.code,

				status: response?.message,
				requestUuid:
					response?.data?.previousTransaction?.details?.requestUuid,
				balance: response?.data.player?.currentBalance,
			};
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async walletWin(req: Request, next: NextFunction) {
		this.log.debug(
			'Calling api /wallet/win' +
				JSON.stringify({
					...req.body,
				}),
		);
		const transactionService = new TransactionService(); // Create a new instance of TransactionService
		try {
			const data: ITransaction = { ...req.body };
			const currentPlayer = req.currentUser;

			const response = await transactionService.createWinTransaction(
				data,
				currentPlayer,
			);

			console.log('response in controller', response);
			// Send the JSON response with a 200 status code

			// sendBalanceUpdate(response?.data?.playerResponse?._id.toString());

			if (response?.data?.playerResponse) {
				return {
					user: response?.data?.playerResponse?._id,
					code: response?.code,
					status: response?.message,

					requestUuid:
						response?.data?.newTransaction?.details?.requestUuid,
					balance: response?.data.playerResponse?.currentBalance,
				};
			}

			return {
				user: response?.data?.player?._id,
				code: response?.code,

				status: response?.message,
				requestUuid:
					response?.data?.previousTransaction?.details?.requestUuid,
				balance: response?.data.player?.currentBalance,
			};
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async walletRefund(req: Request, next: NextFunction) {
		this.log.debug('Calling api / wallet /refund', JSON.stringify(req.body));
		const transactionService = new TransactionService(); // Create a new instance of TransactionService
		try {
			const data: ITransaction = { ...req.body };
			const currentPlayer = req.currentUser;

			const response = await transactionService.createRefundTransaction(
				data,
				currentPlayer,
			);

			// sendBalanceUpdate(response?.data?.playerResponse?._id.toString());

			// Send the JSON response with a 200 status code
			if (response?.data?.playerResponse) {
				return {
					user: response?.data?.playerResponse?._id,
					status: response?.message,
					requestUuid:
						response?.data?.newTransaction?.details?.requestUuid,
					balance: response?.data.playerResponse?.currentBalance,
				};
			}

			// Send the JSON response with a 200 status code
			return {
				user: response?.data?.player?._id,
				status: response?.message,
				requestUuid:
					response?.data?.previousTransaction?.details?.requestUuid,
				balance: response?.data.player?.currentBalance,
			};
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}
