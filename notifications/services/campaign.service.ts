import { Container, Service } from 'typedi';
// import campaigns from '../campaigns';
import { IMessage } from '../interfaces/message';
import { RuleProcessor } from '../interfaces/rule.processor';
import { BonusReleaseService } from './bonus.release.service';
import CacheService from './cache.service';
import {
	CampaignStatus,
	ICampaignUsage,
	ICampaignUsageCache,
} from '../interfaces/campaign.usage';

import { CampaignService as CService } from './../../affiliate/services/campaign.service';
import getLogger from '../../common/logger';
import {
	ICampaign,
	ReleaseType,
} from '../../common/interfaces/campaign.interface';
import { BonusService } from './bonus.service';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import mongoose, { ObjectId, Schema } from 'mongoose';

const log = getLogger(module);
const CAMPAIGN_USER_PREFIX = 'campaigns_';

// campaignsList.forEach((campaign) => {
// 	campaignsMap.set(campaign._id, campaign);
// });

@Service()
class CampaignService {
	private cacheService: CacheService;
	private bonusReleaseService: BonusReleaseService;
	private bonusService: BonusService;
	private cService: CService;
	private commonPlayerDao: CommonPlayerDao;

	private static campaignsList = [];
	private campaigns: ICampaign[] = [];
	private static campaignsMap = new Map<string, ICampaign>();

	constructor() {
		this.cacheService = Container.get(CacheService);
		this.bonusReleaseService = Container.get(BonusReleaseService);
		this.cService = Container.get(CService);
		this.bonusService = Container.get(BonusService);
		this.commonPlayerDao = new CommonPlayerDao();
	}

	public async getAllCampaigns(): Promise<ICampaign[]> {
		log.debug('Getting all campaigns 🎉');
		// let cService = Container.get(CService);
		const cs = await this.cService.getAllCampaigns();

		this.campaigns = cs;

		CampaignService.campaignsList = cs;

		cs.forEach((campaign) => {
			CampaignService.campaignsMap.set(campaign._id.toString(), campaign);
		});

		return cs;
	}

	public async getEligibleCampaign(
		message: IMessage,
		userCampaigns: ICampaignUsageCache,
	): Promise<ICampaign> {
		await this.getAllCampaigns();

		log.debug(
			`Getting eligible campaigns for message: ${JSON.stringify(message)}`,
		);

		log.debug(`Available campaigns: ${JSON.stringify(this.campaigns)}`);

		let ts = new Date(message.ts);

		const eligibleCampaigns = [];

		for (let i = 0; i < this.campaigns.length; i++) {
			let campaign = this.campaigns[i];
			// Check if the user has already participated in this campaign.
			if (ts < campaign.startDate || ts > campaign.endDate) continue;

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

			if (campaignUsage.status != CampaignStatus.NOT_ELIGIBLE) continue;

			log.debug(
				`Checking eligibility for campaign ${campaign._id}, campaign usage: ${JSON.stringify(campaignUsage)}`,
			);

			const playerId = new mongoose.Types.ObjectId(message.userId);
			const player = await this.commonPlayerDao.getPlayerById(playerId);
			/**
			 * 1. Check first if campaign collection has assignBonusUser field
			 * 2. Check if campaign assignBonusUser field has at least length 1
			 * 3. Check if campaign assignBonusUser field has player phoneNumber from message
			 */
			if (
                campaign.assignBonusUser &&
                campaign.assignBonusUser.length > 0
            ) {
				const isPlayerListed = campaign.assignBonusUser.includes(player.phoneNumber);
				console.log("Player ID:", playerId);
        		console.log("All users assigned:", campaign.assignBonusUser);
				
				if (!isPlayerListed) {
					// Player ID not found in assignBonusUser; skip this campaign
					console.log(">>>>> User NOT Found: " + playerId);
					continue;
				}
				console.log(">>>>> User found", playerId);
            }
			
			let isMatched = await RuleProcessor.isCriteriaMatched(
				message,
				campaign,
				campaign.eligibilityCriteria,
				campaignUsage,
			);

			campaignUsage.status = CampaignStatus.NOT_ELIGIBLE;

			if (
				campaignUsage.eligibleRules &&
				campaignUsage.eligibleRules.length > 0
			) {
				userCampaigns.list.push(campaignUsage);
				userCampaigns.idList.push(campaign._id.toString());

				if (isMatched) {
					campaignUsage.status = CampaignStatus.ELIGIBLE;
					eligibleCampaigns.push(campaign);
				}
				CampaignService.setUserCampaignsToCache(
					this.cacheService,
					message.userId,
					userCampaigns,
				);
			}
			if (isMatched) return campaign;
		}

		return null;
	}

	public static createEmptyCampaignUsage(
		campaign: ICampaign,
		message: IMessage,
	): ICampaignUsage {
		log.debug(
			`Creating empty campaign usage for campaign ${campaign._id}, message: ${JSON.stringify(
				message,
			)}`,
		);

		let campaignUsage = {
			campaignId: campaign._id.toString(),
			usedCount: 0,
			eligibleTimestamp: message.ts,
			status: CampaignStatus.NOT_ELIGIBLE,
			userId: message.userId,
			eligibleRules: [],
			releasedSchedules: [],
		};

		return campaignUsage;
	}

	public async getUserCampaigns(userId: string) {
		return await CampaignService.getUserCampaignsFromCache(
			this.cacheService,
			userId,
		);
	}

	public static getCampaignById(campaignId: string): ICampaign {
		return CampaignService.campaignsMap.get(campaignId);
	}

	public static getAllCampaigns(): ICampaign[] {
		return CampaignService.campaignsList;
	}

	public static async getUserCampaignsFromCache(
		cacheService: CacheService,
		userId: string,
	): Promise<ICampaignUsageCache> {
		let userKey = `${CAMPAIGN_USER_PREFIX}${userId}`;
		let userCampaignsStr = await cacheService.get(userKey);
		log.debug(
			`User campaigns for user ${userId} from cache : ${userCampaignsStr}`,
		);
		if (userCampaignsStr == null) {
			let usage: ICampaignUsageCache = {
				idList: [],
				list: [],
			};
			return usage;
		}
		let userCampaigns = <ICampaignUsageCache>JSON.parse(userCampaignsStr);
		userCampaigns.idList = [];

		userCampaigns.list.forEach(
			(value: ICampaignUsage, index: number, array: ICampaignUsage[]) => {
				userCampaigns.idList.push(value.campaignId);
			},
		);
		return userCampaigns;
	}

	public async setUserCampaignsToCache(
		userId: string,
		userCampaigns: ICampaignUsageCache,
	) {
		await CampaignService.setUserCampaignsToCache(
			this.cacheService,
			userId,
			userCampaigns,
		);
	}

	public static async setUserCampaignsToCache(
		cacheService: CacheService,
		userId: string,
		userCampaigns: ICampaignUsageCache,
	) {
		let userKey = `${CAMPAIGN_USER_PREFIX}${userId}`;
		await cacheService.set(userKey, JSON.stringify(userCampaigns));
	}

	public async processMessage(message: IMessage) {
		let userCampaigns = await this.getUserCampaigns(message.userId);

		let eligibleCampaign = await this.getEligibleCampaign(
			message,
			userCampaigns,
		);

		if (!eligibleCampaign) {
			log.debug(
				`No eligible campaigns found for user ${message.userId} and message: ${JSON.stringify(message)}`,
			);
			return;
		}

		log.debug(
			`Releasing bonus for eligible campaign: ${JSON.stringify(eligibleCampaign)}`,
		);

		await this.bonusReleaseService.processCampaign(
			message,
			eligibleCampaign,
			userCampaigns,
		);
	}
}

export { CampaignService };
