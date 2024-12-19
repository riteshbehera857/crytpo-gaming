import { Model, Schema } from 'mongoose';
import {
	IBonusTransaction,
	IBonusTransactionDetailsForBonus,
	IBonusTransactionDetailsForGames,
} from '../../common/interfaces/bonusTransaction.interface';
import BonusTransaction from '../models/bonusTransaction.model';
import { startOfDay, subDays } from 'date-fns';
import config from '../../common/config';
import { TransactionEnum } from '../../common/types/transaction';
import { ReleaseType } from '../../common/interfaces/campaign.interface';

class BonusTransactionDao {
	private bonusTransactionModel: Model<IBonusTransaction>;

	constructor() {
		this.bonusTransactionModel = BonusTransaction;
	}

	/**
	 * Creates a new BonusTransaction in the database and returns the result.
	 * @param transactionData The data to create the BonusTransaction with.
	 * @returns The newly created BonusTransaction.
	 */
	public async createBonusTransaction<
		T extends
			| IBonusTransactionDetailsForBonus
			| IBonusTransactionDetailsForGames,
	>(transactionData: IBonusTransaction<T>): Promise<IBonusTransaction<T>> {
		const bonusTransaction =
			await this.bonusTransactionModel.create<IBonusTransaction<T>>(
				transactionData,
			);
		return bonusTransaction as unknown as IBonusTransaction<T>;
	}

	public async getBonusTransactionByReleaseTypeAndCampaignId(
		campaignId: string | Schema.Types.ObjectId,
		playerId: string | Schema.Types.ObjectId,
		releaseType: ReleaseType,
	): Promise<IBonusTransaction<IBonusTransactionDetailsForBonus>> {
		const bonusTransaction = await this.bonusTransactionModel.findOne<
			IBonusTransaction<IBonusTransactionDetailsForBonus>
		>({
			player: playerId,
			'details.releaseType': releaseType,
			'details.campaignId': campaignId,
		});

		return bonusTransaction;
	}

	public async getBonusTransactionDetails(
		transactionData: any,
	): Promise<IBonusTransaction> {
		const bonusTransaction = await this.bonusTransactionModel.aggregate([
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

		return bonusTransaction[0];
	}

	public async getBonusTransactionByBetId(
		betId: string,
	): Promise<IBonusTransaction> {
		const bonusTransaction = this.bonusTransactionModel.findOne({
			'details.betId': betId,
		});

		return bonusTransaction;
	}

	public async getBonusTransactions(
		params: Record<string, any>,
		userId: Schema.Types.ObjectId,
	) {
		let startDate;
		let endDate;

		if (params.startDate === undefined || params.endDate === undefined) {
			endDate = new Date(Date.now());
			startDate = startOfDay(
				subDays(endDate, config.getTransactionFor as number),
			);
		}

		const endDates = new Date(params?.endDate);
		endDates.setDate(endDates.getDate() + 1);

		const bonusTransactions = await this.bonusTransactionModel.aggregate([
			{
				$match: {
					player: userId,
					// createdAt: {
					// 	$gte: params.startDate ? params.startDate : startDate,
					// 	$lte: params.endDate ? endDates : endDate,
					// },
					$nor: [{ transactionType: TransactionEnum.BET }],
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
					amount: 1,
					createdAt: '$createdAt',
					type: '$transactionType',
					openingBalance: 1,
					closingBalance: 1,
					campaignId: '$details.campaignId', // Adding a new field 'type' with value 'withdrawal'
				},
			},
		]);

		return bonusTransactions;
	}
}

export { BonusTransactionDao };
