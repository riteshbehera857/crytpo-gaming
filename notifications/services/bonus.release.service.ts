import Container, { Service } from 'typedi';
import { CampaignStatus, ICampaignUsage } from '../interfaces/campaign.usage';
import { IMessage } from '../interfaces/message';
import { RuleProcessor } from '../interfaces/rule.processor';
import { BonusService } from './bonus.service';
import CacheService from './cache.service';
import { CampaignService } from './campaign.service';
import getLogger from '../../common/logger';
import { WalletService } from './wallet.service';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { Schema } from 'mongoose';
import {
	ICampaign,
	IReleaseSchedule,
	ReleaseType,
} from '../../common/interfaces/campaign.interface';
import { BonusTransactionService } from '../../bonus/services/bonusTransaction.service';
import {
	IBonusTransaction,
	IBonusTransactionDetailsForBonus,
} from '../../common/interfaces/bonusTransaction.interface';

const log = getLogger(module);

@Service()
class BonusReleaseService {
	private cacheService: CacheService;
	private bonusService: BonusService;
	private bonusTransactionService: BonusTransactionService;
	private commonPlayerDao: CommonPlayerDao;

	// private campaignService: CampaignService;

	constructor() {
		this.cacheService = Container.get(CacheService);
		this.bonusService = Container.get(BonusService);
		this.bonusTransactionService = Container.get(BonusTransactionService);
		this.commonPlayerDao = new CommonPlayerDao();
		// this.campaignService = Container.get(CampaignService);
	}

	public async processMessage(message: IMessage) {
		const campaignService = Container.get(CampaignService);

		const _ = await campaignService.getAllCampaigns();

		let userCampaigns = await CampaignService.getUserCampaignsFromCache(
			this.cacheService,
			message.userId,
		);

		log.debug(
			`Processing bonus release for user ${message.userId}, campaigns: ${JSON.stringify(userCampaigns)}`,
		);

		for (let i = 0; i < userCampaigns.list.length; i++) {
			let campaignUsage = userCampaigns.list[i];

			let campaign = CampaignService.getCampaignById(
				campaignUsage.campaignId,
			);

			if (
				campaignUsage.status === CampaignStatus.COMPLETED ||
				campaignUsage.status === CampaignStatus.NOT_ELIGIBLE
			)
				continue;

			await this.processCampaign(message, campaign, userCampaigns);
		}
	}

	/**
	 * This function processes a campaign, either by releasing a bonus or by
	 * checking if the campaign is completed.
	 *
	 * The logic is as follows:
	 *
	 * 1. Get the campaign usage from the user's campaigns.
	 * 2. If the campaign is not found, create a new campaign usage.
	 * 3. Check if the campaign is a locked campaign or an unlocked campaign.
	 * 4. If it's an unlocked campaign, just release the bonus.
	 * 5. If it's a locked campaign, check if the next schedule is eligible.
	 * 6. If it is, release the bonus and update the campaign usage.
	 * 7. If not, do nothing.
	 * 8. Update the campaign usage in the cache.
	 *
	 * @param message The message object.
	 * @param campaign The campaign object.
	 * @param userCampaigns The user's campaigns.
	 */
	public async processCampaign(
		message: IMessage,
		campaign: ICampaign,
		userCampaigns: any,
	) {
		let campaignUsage: ICampaignUsage;

		if (
			userCampaigns &&
			userCampaigns.idList.includes(campaign._id.toString())
		) {
			for (let i = 0; i < userCampaigns.list.length; i++) {
				let c = userCampaigns.list[i];
				if (c.campaignId == campaign._id.toString()) {
					campaignUsage = c;
					break;
				}
			}
		} else {
			campaignUsage = CampaignService.createEmptyCampaignUsage(
				campaign,
				message,
			);
		}

		CampaignService.setUserCampaignsToCache(
			this.cacheService,
			message.userId,
			userCampaigns,
		);

		if (campaign.releaseType == ReleaseType.LOCKED) {
			log.silly(`Getting bonus transaction by campaignId ${campaign._id}`);

			const lockedBonusTransaction =
				await this.bonusTransactionService.getBonusTransactionByReleaseTypeAndCampaignId(
					campaign._id,
					message.userId,
					campaign.releaseType,
				);
			log.silly(
				`Got bonus transaction ${JSON.stringify(lockedBonusTransaction)}`,
			);

			if (!lockedBonusTransaction) {
				log.warn(
					`No bonus transaction found for locked campaign ${campaign._id}`,
				);

				const bonusAmount = await this.bonusService.calculateBonus(
					message,
					campaign,
				);

				const player = await this.commonPlayerDao.getPlayerById(
					message.userId,
				);

				const bonusTransactionData =
					this.bonusTransactionService.buildBonusTransaction(
						player,
						campaign,
						bonusAmount,
					);

				try {
					log.silly(
						`Creating bonus transaction with data ${JSON.stringify(bonusTransactionData)}`,
					);
					const bonusTransaction =
						await this.bonusTransactionService.createBonusTransaction(
							bonusTransactionData,
						);

					console.log(
						`Bonus transaction created with id ${bonusTransaction._id}`,
					);

					const updatedPlayerBalance =
						await this.commonPlayerDao.updateUserBalanceAfterBonusTransaction(
							player._id,
							bonusAmount,
							campaign.releaseType,
						);

					console.log('Updated player balance', updatedPlayerBalance);

					return updatedPlayerBalance;
				} catch (error) {
					console.error(
						`Failed to credit bonus to user ${player._id}. Error: ${error.message}`,
					);
					throw error;
				}
			}
		}

		let success = false;

		if (campaign.releaseType === ReleaseType.UNLOCKED) {
			log.silly(
				'Releasing unlocked bonus campaign : ' + JSON.stringify(campaign),
			);
			campaignUsage.status = CampaignStatus.RELEASE_IN_PROGRESS;
			success = await this.bonusService.processCampaign(message, campaign);
		} else if (campaign.releaseType === ReleaseType.LOCKED) {
			/**
			 * This part of the code processes a locked campaign.
			 */
			let schedule: IReleaseSchedule = campaign.releaseSchedule[0];
			let eligibleTimestamp = campaignUsage.eligibleTimestamp;

			if (
				campaignUsage.releasedSchedules &&
				campaignUsage.releasedSchedules.length > 0
			) {
				/**
				 * If the campaign has already been processed before, get the next
				 * schedule.
				 */
				let processedCount = campaignUsage.releasedSchedules.length;
				schedule = campaign.releaseSchedule[processedCount];
				eligibleTimestamp =
					campaignUsage.releasedSchedules[processedCount - 1]
						.eligibleTimestamp;
			}

			message.eligibleTimestamp = eligibleTimestamp;
			/**
			 * Check if the next schedule is eligible.
			 */
			let isMatched = await RuleProcessor.isCriteriaMatched(
				message,
				campaign,
				schedule.releaseCriteria,
				campaignUsage,
			);

			if (isMatched) {
				/**
				 * If the next schedule is eligible, release the bonus and update
				 * the campaign usage.
				 */
				let released = await this.bonusService.processSchedule(
					message,
					campaign,
					schedule,
				);
				if (released.status === CampaignStatus.COMPLETED) {
					campaignUsage.status = CampaignStatus.RELEASE_IN_PROGRESS;
					success = true;
				}
				campaignUsage.releasedSchedules.push(released);
			}
		} else {
			log.error(
				'Invalid release type for campaign: ' + JSON.stringify(campaign),
			);
		}
		if (success) {
			log.silly(`Successfully release ${campaign._id}`);
			let isCompleted = true;
			if (campaign.repeatCount > 1) {
				campaignUsage.usedCount++;
				if (campaign.repeatCount > campaignUsage.usedCount)
					isCompleted = false;
			}
			if (campaign.releaseType === ReleaseType.LOCKED) {
				if (
					campaignUsage.releasedSchedules.length !=
					campaign.releaseSchedule.length
				)
					isCompleted = false;
			}
			if (isCompleted) {
				campaignUsage.status = CampaignStatus.COMPLETED;
				log.silly(`Release completed for ${campaign._id}`);
			}
		}
		CampaignService.setUserCampaignsToCache(
			this.cacheService,
			message.userId,
			userCampaigns,
		);
	}
}

export { BonusReleaseService };
