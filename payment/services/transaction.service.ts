import { ObjectId } from 'mongodb';
import { Service } from 'typedi';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import { Response } from '../../common/config/response';
import { TransactionDao } from '../daos/transactionDao';
import { TransactionTypesEnum } from '../../common/types/transaction';
import { ResponseCodes } from '../../common/config/responseCodes';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { Type } from 'typescript';
import { Types } from 'joi';
import { Schema } from 'mongoose';

@Service()
class TransactionService {
	private logger: Logger;
	private transactionDao: TransactionDao;
	private commonPlayerDao: CommonPlayerDao;

	constructor() {
		this.logger = getLogger(module);
		this.transactionDao = new TransactionDao();
		this.commonPlayerDao = new CommonPlayerDao();
	}

	public async getTransactionTypes(): Promise<Response> {
		try {
			const types = [...Object.values(TransactionTypesEnum)];

			return new Response(
				ResponseCodes.TRANSACTION_TYPES_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.TRANSACTION_TYPES_FETCHED_SUCCESSFULLY.message,
				types,
			);
		} catch (error) {
			throw error;
		}
	}

	public async getUserTransactions(
		params: Record<string, any>,
		userId: Schema.Types.ObjectId,
	): Promise<Response> {
		try {
			const player = await this.commonPlayerDao.getPlayerById(userId);

			if (!player) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			const transactions = await this.transactionDao.getUserTransactions(
				params,
				userId,
			);

			return new Response(
				ResponseCodes.TRANSACTIONS_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.TRANSACTIONS_FETCHED_SUCCESSFULLY.message,
				transactions,
			);
		} catch (error) {
			throw error;
		}
	}

	public async getTransactionByOrderId(orderId: string): Promise<Response> {
		try {
			const transaction =
				await this.transactionDao.getTransactionByOrderId(orderId);

			return new Response(
				ResponseCodes.EXTERNAL_TRANSACTION_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.EXTERNAL_TRANSACTION_FETCHED_SUCCESSFULLY.message,
				transaction,
			);
		} catch (error) {
			throw error;
		}
	}
}

export { TransactionService };
