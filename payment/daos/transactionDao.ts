import { Model, Schema, UpdateWriteOpResult } from 'mongoose';
// import Player, { PlayerType } from '../models/player.model';
import Transaction from '../models/transaction.model';
import {
	TransactionEnum,
	TransactionEnumPayment,
} from '../../common/types/transaction';
import { ITransaction } from '../../common/interfaces/transaction.interface';
import { PaymentWithdrawalRequestLogDao } from './paymentWithdrawalRequestLogDao';
import {
	IPaymentWithdrawalRequestLog,
	IPaymentWithdrawalRequestLogModel,
} from '../../common/interfaces/paymentWithdrawalRequestLog.interface';
import PaymentWithdrawalRequestLog from '../models/paymentWithdrawalRequestLog.model';

import { WithdrawalStatus } from '../../common/types/withdrawal';
import { format, startOfDay, subDays } from 'date-fns';
import config from '../../common/config';
import { BonusTransactionDao } from '../../bonus/daos/bonusTransaction.dao';
import getLogger from '../../common/logger';

const log = getLogger(module);

class TransactionDao {
	private transactionModel: Model<ITransaction>;
	private paymentWithdrawalRequestLogModel: Model<IPaymentWithdrawalRequestLog>;
	private bonusTransactionDao: BonusTransactionDao;

	constructor() {
		this.transactionModel = Transaction;
		this.paymentWithdrawalRequestLogModel = PaymentWithdrawalRequestLog;
		this.bonusTransactionDao = new BonusTransactionDao();
	}

	public async create(
		transaction: Partial<ITransaction>,
	): Promise<ITransaction> {
		// console.log(`transaction`, transaction);
		const newTransaction = await this.transactionModel.create({
			...transaction,
		});
		return newTransaction;
	}

	public async getTransactionByOrderId(
		orderId: string,
	): Promise<ITransaction> {
		const transaction = await this.transactionModel.findOne({
			'details.orderId': orderId,
		});

		return transaction;
	}

	public async createManualRefund(
		paymentData: any,
		status: string,
		type: string,
		responseId: string,
		requestId: string,
		amountWithCommission: number,
		gateway: string,
	): Promise<ITransaction> {
		// console.log(`transaction`, transaction);
		const newTransaction = await this.transactionModel.create({
			paymentGateway: gateway,
			userId: paymentData.userId,
			status: status,
			transactionType: type,
			amount: paymentData.amount,
			createdBy: paymentData.userId,
			amountWithCommission: amountWithCommission,
			responseId: responseId,
			requestId: requestId,
		});
		return newTransaction;
	}

	public async updateOneById(
		transaction: Partial<ITransaction>,
		id: Schema.Types.ObjectId,
	): Promise<UpdateWriteOpResult> {
		const newTransaction = await this.transactionModel.updateOne(
			{ _id: id },
			{
				$set: transaction,
			},
		);

		return newTransaction;
	}
	public async find(): Promise<ITransaction[]> {
		const paymentDeposits = (await this.transactionModel.find({
			deletedAt: null,
			transactionType: TransactionEnumPayment.Deposit,
		})) as ITransaction[];
		return paymentDeposits;
	}
	public async findWithdrawal(): Promise<ITransaction[]> {
		const paymentWithdrawal = (await this.transactionModel.find({
			deletedAt: null,
			transactionType: TransactionEnumPayment.Withdrawal,
		})) as ITransaction[];
		return paymentWithdrawal;
	}
	public async findOne(id): Promise<ITransaction> {
		const paymentWithdrawal = (await this.transactionModel.findOne({
			deletedAt: null,
			_id: id,
		})) as ITransaction;
		return paymentWithdrawal;
	}

	public async updateManualRefund(
		id: Schema.Types.ObjectId,
		status: string,
		note: string,
	): Promise<UpdateWriteOpResult> {
		const paymentWithdrawal = await this.transactionModel.updateOne(
			{
				note: note,
				status: status,
				// updatedBy: user._id,
				updatedAt: new Date(),
			},
			id,
		);
		return paymentWithdrawal;
	}

	public async getWithdrawalTransactionRequests(
		params: Record<string, any>,
		userId: Schema.Types.ObjectId,
	): Promise<any> {
		let startDate;
		let endDate;

		if (params.startDate === undefined || params.endDate === undefined) {
			endDate = new Date(Date.now());
			startDate = startOfDay(
				subDays(endDate, config.getTransactionFor as number),
			);
		}

		console.log({ startDate, endDate });

		const endDates = new Date(params?.endDate);
		endDates.setDate(endDates.getDate() + 1);

		const withdrawalRequests =
			await this.paymentWithdrawalRequestLogModel.aggregate([
				{
					$match: {
						user: userId,
						requestedAt: {
							$gte: params.startDate ? params.startDate : startDate,
							$lte: params.endDate ? endDates : endDate,
						},
						$nor: [
							{ status: WithdrawalStatus.REJECTED },
							{ status: WithdrawalStatus.SETTLED },
						],
					},
				},
				{
					$set: {
						requestedAt: {
							$dateToString: {
								format: '%Y-%m-%d %H:%M:%S',
								date: '$createdAt',
								timezone: 'Asia/Kolkata',
							},
						},
						createdAt: {
							$dateToString: {
								format: '%Y-%m-%d %H:%M:%S',
								date: '$createdAt',
								timezone: 'Asia/Kolkata',
							},
						},
						updatedAt: {
							$dateToString: {
								format: '%Y-%m-%d %H:%M:%S',
								date: '$updatedAt',
								timezone: 'Asia/Kolkata',
							},
						},
					},
				},
				{
					$project: {
						_id: 1,
						amount: '$requestData.amount',
						createdAt: '$requestedAt',
						type: { $literal: 'WITHDRAWAL' }, // Adding a new field 'type' with value 'withdrawal'
					},
				},
			]);

		console.log('---------------------', withdrawalRequests);

		return withdrawalRequests;
	}

	public async getUserTransactions(
		params: Record<string, any>,
		userId: Schema.Types.ObjectId,
	): Promise<any> {
		let withdrawalRequests;

		let bonusTransactions;

		const startDate = new Date(params?.startDate);
		startDate.setDate(startDate.getDate()); // Add one day to startDate

		const endDate = new Date(params?.endDate);
		endDate.setDate(endDate.getDate() + 1);

		console.log('Dates:', startDate, endDate);

		if (!params.transactionType || params.transactionType === 'WITHDRAWAL') {
			withdrawalRequests = await this.getWithdrawalTransactionRequests(
				params,
				userId,
			);
		}

		if (!params.transactionType || params.transactionType === 'BONUS') {
			bonusTransactions =
				await this.bonusTransactionDao.getBonusTransactions(params, userId);
		}

		const transactions = await this.transactionModel.aggregate([
			{
				$match: {
					player: userId,
					isTransactionSuccess: true,
					...(params?.transactionType
						? {
								transactionType:
									params.transactionType === 'DEPOSIT'
										? { $in: ['DEPOSIT', 'INTERNAL_DEPOSIT'] }
										: params.transactionType,
							}
						: {}),
					...(params.startDate && params.endDate
						? {
								createdAt: {
									$gte: startDate,
									$lte: endDate,
								},
							}
						: {}),
				},
			},
			{
				$sort: {
					createdAt: -1, // Sort by createdAt in descending order
				},
			},
			{
				$set: {
					createdAt: {
						$dateToString: {
							format: '%Y-%m-%d %H:%M:%S',
							date: '$createdAt',
							timezone: 'Asia/Kolkata',
						},
					},
					updatedAt: {
						$dateToString: {
							format: '%Y-%m-%d %H:%M:%S',
							date: '$updatedAt',
							timezone: 'Asia/Kolkata',
						},
					},
				},
			},
			{
				$project: {
					_id: 1,
					amount: 1, // Rename the 'details.amount' field to 'amount'
					type: '$transactionType', // Rename the 'type' field to 'transactionType'
					orderId: '$details.orderId', // Rename the 'details.orderId' field to 'orderId'
					paymentTransactionId: '$details.paymentTransactionId', // Rename the 'details.paymentTransactionId' field to 'paymentTransactionId'
					gameCode: '$details.gameCode',
					createdAt: 1,
				},
			},
			{
				$match: {
					$or: [
						{ type: { $ne: 'WIN' } },
						{ type: 'WIN', amount: { $ne: 0 } },
					],
				},
			},
		]);

		// Merge the results from both pipelines
		const mergedResults = [
			...(withdrawalRequests ? withdrawalRequests : []),
			...(bonusTransactions ? bonusTransactions : []),
			...transactions,
		].sort((a, b) => {
			const dateA = new Date(a.createdAt);
			const dateB = new Date(b.createdAt);

			// Compare the dates
			if (dateA < dateB) return 1; // If dateA is less than dateB, move dateA after dateB
			if (dateA > dateB) return -1; // If dateA is greater than dateB, move dateA before dateB
			return 0;
		});

		return mergedResults;
	}

	public async getUserGamingTransactions({
		userId,
		games = [],
		sDate,
		eDate,
	}: {
		userId: Schema.Types.ObjectId;
		games?: string[];
		sDate: number;
		eDate?: number;
	}): Promise<ITransaction[]> {
		log.silly('Initial starting date is ' + sDate);

		let startDate = new Date(sDate).toISOString();

		const endDate = new Date(eDate ?? Date.now()).toISOString();

		log.silly(`Getting user game transactions: ${startDate} - ${endDate}`);

		const userGamingTransactions = await this.transactionModel.find({
			player: userId,
			transactionType: TransactionEnum.BET,
			createdAt: {
				$gte: startDate,
				$lte: endDate,
			},
			...(Array.isArray(games) && games.length
				? {
						'details.gameCode': {
							$in: games,
						},
					}
				: {}),
		});

		return userGamingTransactions;
	}
}

export { TransactionDao };
