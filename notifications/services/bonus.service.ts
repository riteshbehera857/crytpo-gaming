import Container, { Service } from 'typedi';
import { GameService } from './game.service';
import { IMessage } from '../interfaces/message';
import {
	CampaignStatus,
	IReleaseScheduleUsage,
} from '../interfaces/campaign.usage';
import { WalletService } from './wallet.service';
import {
	ITransaction,
	ITransactionDetailsForBonus,
	ITransactionDetailsForPayments,
} from '../../common/interfaces/transaction.interface';
import { Schema } from 'mongoose';
import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from '../../common/types/transaction';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import {
	IBonusTransaction,
	IBonusTransactionDetailsForBonus,
} from '../../common/interfaces/bonusTransaction.interface';
import { BonusTransactionService } from '../../bonus/services/bonusTransaction.service';
import getLogger from '../../common/logger';
import {
	BonusAmountSource,
	BonusAmountType,
	ICampaign,
	IReleaseSchedule,
	ReleaseType,
} from '../../common/interfaces/campaign.interface';
import { IPlayer } from '../../common/interfaces/player.interface';
import { TransactionService } from '../../payment/services/transaction.service';
import { TransactionDao } from '../../wallet/daos/transaction.dao';
import { CampaignDao } from '../../core/daos/campaign.dao';

const log = getLogger(module);
@Service()
class BonusService {
	private bonusTransactionService: BonusTransactionService;
	private transactionDao: TransactionDao;

	private commonPlayerDao: CommonPlayerDao;
	private campaignDao: CampaignDao;

	constructor() {
		// this.walletService = Container.get(WalletService);
		this.bonusTransactionService = Container.get(BonusTransactionService);
		this.commonPlayerDao = new CommonPlayerDao();
		this.transactionDao = new TransactionDao();
		this.campaignDao = new CampaignDao();
	}

	public async processCampaign(
		message: IMessage,
		campaign: ICampaign,
	): Promise<boolean> {
		let userId = message.userId;
		log.info(
			`Processing bonus for user ${userId} for campaign ${campaign._id}`,
		);
		let bonusAmount = await this.calculateBonus(message, campaign);

		const _ = await this.creditBonus(
			userId,
			bonusAmount,
			campaign,
			campaign.releaseType as 'locked' | 'unlocked',
		);

		log.info(`Eligible bonus amount : ${bonusAmount}`);
		return true;
	}

	public async processSchedule(
		message: IMessage,
		campaign: ICampaign,
		releaseSchedule: IReleaseSchedule,
	): Promise<IReleaseScheduleUsage> {
		let releasedSchedule: IReleaseScheduleUsage = {
			scheduleId: releaseSchedule.id,
			status: CampaignStatus.RELEASE_IN_PROGRESS,
			releaseAmount: 0,
			eligibleTimestamp: Date.now(),
		};

		let userId = message.userId;

		log.debug(
			`Processing bonus for user ${userId} for campaign ${campaign._id}, release schedule: ${JSON.stringify(releaseSchedule)}`,
		);

		const lockedBonusTransaction =
			await this.bonusTransactionService.getBonusTransactionByReleaseTypeAndCampaignId(
				campaign._id,
				userId,
				campaign.releaseType,
			);

		let bonusTotalAmount = await this.calculateBonus(message, campaign);

		if (lockedBonusTransaction) {
			bonusTotalAmount = lockedBonusTransaction.amount;
		}

		log.debug(`Eligible total bonus amount : ${bonusTotalAmount}`);

		let bonusAmount = releaseSchedule.amount;

		if (!releaseSchedule.type && !releaseSchedule.amount) {
			bonusAmount = bonusTotalAmount;
		} else if (releaseSchedule.type === 'percentage') {
			bonusAmount = (bonusTotalAmount * releaseSchedule.amount) / 100;
		}

		log.debug(`Eligible bonus amount : ${bonusAmount}`);

		releasedSchedule.releaseAmount = bonusAmount;

		releasedSchedule.status = CampaignStatus.COMPLETED;

		const _ = await this.creditBonus(
			userId,
			bonusAmount,
			campaign,
			'unlocked',
		);

		return releasedSchedule;
	}

	public async calculateBonus(
		message: IMessage,
		campaign: ICampaign,
	): Promise<number> {
		console.log(`Calculating bonus for campaign ${campaign._id}`);

		let sourceAmount = 0;

		if (campaign.bonusAmount.source == 'deposit') {
			sourceAmount = message.payload.amount;
			console.log(`Source amount is ${sourceAmount}`);
		}

		if (
			(campaign.bonusAmount.source !== BonusAmountSource.SIGNUP && campaign.bonusAmount.source !== BonusAmountSource.LOGIN) &&
			(!sourceAmount || sourceAmount < 1)
		) {
			throw new Error(`Invalid source amount`);
		}

		let bonusAmount = campaign.bonusAmount.value;

		log.debug(`Locked bonus amount is ${bonusAmount} from file ${__dirname}`);

		if ('percentage' === campaign.bonusAmount.type) {
			bonusAmount = (sourceAmount * campaign.bonusAmount.value) / 100;
			console.log(`Bonus amount is calculated as ${bonusAmount}`);
		}

		if (BonusAmountType.FIXED === campaign.bonusAmount.type) {
			bonusAmount = campaign.bonusAmount.value;
			console.log(`Bonus amount is calculated as ${bonusAmount}`);
		}

		if (
			BonusAmountType.FIXED !== campaign.bonusAmount.type &&
			bonusAmount > campaign.bonusAmount.maxBonusAmount
		) {
			bonusAmount = campaign.bonusAmount.maxBonusAmount;
			console.log(
				`Bonus amount is capped at ${bonusAmount} since it is greater than maxBonusAmount of ${campaign.bonusAmount.maxBonusAmount}`,
			);
		}

		return bonusAmount;
	}

	public async creditBonus(
		userId: string,
		bonusAmount: number,
		campaign: ICampaign,
		releaseType: 'locked' | 'unlocked',
	): Promise<any> {
		const bonusTransactionService = Container.get(BonusTransactionService);

		console.log(`Crediting bonus of ${bonusAmount} to user ${userId}`);

		const playerBalance = await this.commonPlayerDao.getPlayerBalance(userId);

		if (!playerBalance) {
			throw new Error(`Player balance not found for user ${userId}`);
		}

		const bonusTransactionData: IBonusTransaction<IBonusTransactionDetailsForBonus> =
		{
			player: userId as unknown as Schema.Types.ObjectId,
			amount: bonusAmount,
			currency: CurrencyEnum.INR,
			transactionType: TransactionEnum.BONUS,
			openingBalance:
				releaseType === 'locked'
					? playerBalance.balance.bonusBalance.locked
					: playerBalance.balance.bonusBalance.unlocked,
			closingBalance:
				releaseType === 'locked'
					? playerBalance.balance.bonusBalance.locked + bonusAmount
					: playerBalance.balance.bonusBalance.unlocked + bonusAmount,
			isTransactionSuccess: true,
			details: {
				campaignId: campaign._id as unknown as Schema.Types.ObjectId,
				releaseType: releaseType as unknown as 'locked' | 'unlocked',
			},
		};

		const transactionData: ITransaction<ITransactionDetailsForBonus> = {
			player: userId as unknown as Schema.Types.ObjectId,
			amount: bonusAmount,
			currency: CurrencyEnum.INR,
			transactionType: TransactionEnum.BONUS,
			openingBalance:
				releaseType === 'locked'
					? playerBalance.balance.bonusBalance.locked
					: playerBalance.balance.bonusBalance.unlocked,
			closingBalance:
				releaseType === 'locked'
					? playerBalance.balance.bonusBalance.locked + bonusAmount
					: playerBalance.balance.bonusBalance.unlocked + bonusAmount,
			isTransactionSuccess: true,
			details: {
				campaignId: campaign._id as unknown as Schema.Types.ObjectId,
				releaseType: releaseType as unknown as 'locked' | 'unlocked',
			},
		};

		try {
			log.info(
				`Creating bonus transaction with data ${JSON.stringify(bonusTransactionData)}`,
			);
			const bonusTransaction =
				await bonusTransactionService.createBonusTransaction(
					bonusTransactionData,
				);

			log.info(`Bonus transaction created with id ${bonusTransaction._id}`);

			log.info(
				`Creating transaction with data ${JSON.stringify(transactionData)}`,
			);

			const transaction =
				await this.transactionDao.createBonusTransaction(transactionData);

			log.info(`Transaction created with id ${transaction._id}`);

			let updatedPlayerBalance: IPlayer;

			if (campaign.releaseType == ReleaseType.UNLOCKED) {
				updatedPlayerBalance =
					await this.commonPlayerDao.updateUserBalanceAfterBonusTransaction(
						userId as unknown as Schema.Types.ObjectId,
						bonusAmount,
						releaseType,
					);
			} else if (campaign.releaseType == ReleaseType.LOCKED) {
				updatedPlayerBalance =
					await this.commonPlayerDao.updateUserBalanceAfterLockedBonusTransaction(
						userId as unknown as Schema.Types.ObjectId,
						bonusAmount,
					);
			}

			console.log('Updated player balance', updatedPlayerBalance);

			// Remove player from bonus eligibility list after their bonus is credited
			/*
			* Steps:
			* 1. Retrieve the player's information, including phone number, from the player DAO.
			* 2. Retrieve the current campaign details using the campaign ID.
			* 3. Check if the player's phone number is in the campaign's `assignBonusUser` list.
			* 4. If the phone number is found in the list, remove it to prevent further bonus eligibility.
			*/
			const player = await this.commonPlayerDao.getPlayerById(userId);
			const currentCampaign = await this.campaignDao.getCampaignById(campaign._id)

			// Check if player's phone number exists in `assignBonusUser` list before attempting removal
			if (currentCampaign.assignBonusUser && currentCampaign.assignBonusUser.length > 0 && currentCampaign.assignBonusUser?.includes(player.phoneNumber)) {
				
				// Remove player's phone number from `assignBonusUser` list in the campaign
				const updatedCampaign = await this.campaignDao.removeUserFromAssignBonus(
					campaign._id,      
					player.phoneNumber  
				);
				log.info(`Updated campaign with id ${updatedCampaign?._id}. AssignBonusUser list updated, removed user with phone number: ${player.phoneNumber} from campaigns assignBonusUser list`);
			}
			return updatedPlayerBalance;
		} catch (error) {
			console.error(
				`Failed to credit bonus to user ${userId}. Error: ${error.message}`,
			);
			throw error;
		}
	}
}

export { BonusService };
