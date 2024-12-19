import { Service } from 'typedi';
import { BonusTransactionDao } from '../daos/bonusTransaction.dao';
import {
	IBonusTransaction,
	IBonusTransactionDetailsForBonus,
	IBonusTransactionDetailsForGames,
} from '../../common/interfaces/bonusTransaction.interface';
import {
	ICampaign,
	ReleaseType,
} from '../../common/interfaces/campaign.interface';
import { Schema } from 'mongoose';
import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from '../../common/types/transaction';
import { IPlayer } from '../../common/interfaces/player.interface';

@Service()
class BonusTransactionService {
	private bonusTransactionDao: BonusTransactionDao;

	constructor() {
		this.bonusTransactionDao = new BonusTransactionDao();
	}

	public async createBonusTransaction<
		T extends
			| IBonusTransactionDetailsForBonus
			| IBonusTransactionDetailsForGames,
	>(transactionData: IBonusTransaction<T>): Promise<IBonusTransaction<T>> {
		return await this.bonusTransactionDao.createBonusTransaction<T>(
			transactionData,
		);
	}

	public async getBonusTransactionByReleaseTypeAndCampaignId(
		campaignId: string | Schema.Types.ObjectId,
		playerId: string | Schema.Types.ObjectId,
		releaseType: ReleaseType,
	): Promise<IBonusTransaction<IBonusTransactionDetailsForBonus>> {
		return await this.bonusTransactionDao.getBonusTransactionByReleaseTypeAndCampaignId(
			campaignId,
			playerId,
			releaseType,
		);
	}

	public buildBonusTransaction(
		player: IPlayer,
		campaign: ICampaign,
		bonusAmount: number,
	): IBonusTransaction<IBonusTransactionDetailsForBonus> {
		const bonusTransactionData: IBonusTransaction<IBonusTransactionDetailsForBonus> =
			{
				player: player._id,
				amount: bonusAmount,
				currency: CurrencyEnum.INR,
				transactionType: TransactionEnum.BONUS,
				openingBalance:
					campaign.releaseType === 'locked'
						? player.balance.bonusBalance.locked
						: player.balance.bonusBalance.unlocked,
				closingBalance:
					campaign.releaseType === 'locked'
						? player.balance.bonusBalance.locked + bonusAmount
						: player.balance.bonusBalance.unlocked + bonusAmount,
				isTransactionSuccess: true,
				details: {
					campaignId: campaign._id as unknown as Schema.Types.ObjectId,
					releaseType: campaign.releaseType,
				},
			};

		return bonusTransactionData;
	}
}

export { BonusTransactionService };
