import { Model } from 'mongoose';
import {
	ITransaction,
	ITransactionDetailsForBonus,
	ITransactionDetailsForGames,
} from '../../common/interfaces/transaction.interface';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IPlayer } from '../../common/interfaces/player.interface';
import Transaction from '../../payment/models/transaction.model';
import { IPaymentRequestLog } from '../../common/interfaces/paymentRequestLog.interface';
import { TransactionEnum } from '../../common/types/transaction';

class TransactionDao {
	private transactionModel: Model<ITransaction>;
	private commonPlayerDao: CommonPlayerDao;

	constructor() {
		this.transactionModel = Transaction;
		this.commonPlayerDao = new CommonPlayerDao();
	}

	public async getTransaction(transactionData: any): Promise<ITransaction> {
		const transaction = await this.transactionModel.aggregate([
			{
				$match: {
					'details.transactionUuid':
						transactionData.details.transactionUuid,
					transactionType: transactionData.transactionType,
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
		]);

		return transaction[0];
	}
	public async createTransaction(transaction: any): Promise<ITransaction> {
		const newTransaction = await this.transactionModel.create({
			player: transaction?.player,
			amount: transaction?.amount,
			currency: transaction?.currency,
			transactionType: transaction?.transactionType,
			'details.transactionUuid': transaction?.transactionUuid,
			'details.requestUuid': transaction?.requestUuid,
		});

		return newTransaction;
	}

	public async createBonusTransaction(
		transaction: ITransaction<ITransactionDetailsForBonus>,
	): Promise<ITransaction<ITransactionDetailsForBonus>> {
		const newTransaction =
			await this.transactionModel.create<
				ITransaction<ITransactionDetailsForBonus>
			>(transaction);

		return newTransaction as any;
	}

	public async getTransactionByTransactionUuid(
		transactionUuid: ITransactionDetailsForGames['transactionUuid'],
	): Promise<ITransaction> {
		const transaction = this.transactionModel.findOne({
			'details.transactionUuid': transactionUuid,
		});

		return transaction;
	}

	public async getTransactionByBetId(betId: string): Promise<ITransaction> {
		const transaction = this.transactionModel.findOne({
			'details.betId': betId,
		});

		return transaction;
	}

	public async getTransactionByRoundId(round: string): Promise<ITransaction> {
		const transaction = this.transactionModel.findOne({
			transactionType: TransactionEnum.BET,
			'details.round': round,
		});

		return transaction;
	}

	public async createWalletTransaction(
		transaction: Partial<ITransaction<ITransactionDetailsForGames>>,
	): Promise<ITransaction> {
		const newTransaction = this.transactionModel.create({
			player: transaction?.player,
			amount: transaction?.amount,
			currency: transaction?.currency,
			isTransactionSuccess: transaction?.isTransactionSuccess,
			openingBalance: transaction?.openingBalance,
			closingBalance: transaction?.closingBalance,
			transactionType: transaction?.transactionType,
			'details.transactionUuid': transaction?.details.transactionUuid,
			'details.supplierUser': transaction?.details.supplierUser,
			'details.roundClosed': transaction?.details.roundClosed,
			'details.round': transaction?.details.round,
			'details.rewardId': transaction?.details.rewardId,
			'details.requestUuid': transaction?.details.requestUuid,
			'details.isFree': transaction?.details.isFree,
			'details.isAggregated': transaction?.details.isAggregated,
			'details.gameId': transaction?.details.gameId,
			'details.gameCode': transaction?.details.gameCode,
			'details.bet': transaction?.details.bet,
			'details.betId': transaction?.details.betId,
		});

		return newTransaction;
	}

	public async updatePlayerCurrentBalance(
		player: IPlayer,
		transaction: ITransaction,
	): Promise<IPlayer> {
		const updatedPlayer = await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player._id },
			{ $inc: { 'balance.currentBalance': transaction.amount } },
			{
				new: true,
			},
		);

		return updatedPlayer;
	}

	public async updatePlayerCurrentAndWithdrawalBalance(
		player: IPlayer,
		transaction: ITransaction,
	): Promise<IPlayer> {
		const updatedPlayer = await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player?._id },
			{
				$inc: {
					'balance.withdrawalBalance': -transaction.amount,
				},
			},
			{
				new: true,
			},
		);

		return updatedPlayer;
	}
}

export { TransactionDao };
