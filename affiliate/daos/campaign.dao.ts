import { Model } from 'mongoose';
import { ICampaign } from '../../common/interfaces/campaign.interface';
import Campaign from '../models/campaign.model';

class CampaignDao {
	private campaignModel: Model<ICampaign>;

	constructor() {
		this.campaignModel = Campaign;
	}

	/**
	 * Retrieve all campaigns from the database.
	 *
	 * @returns {Promise<ICampaign[]>} A promise that resolves to an array of all campaigns in the database.
	 */
	public async getAllCampaigns(): Promise<ICampaign[]> {
		const campaigns = await this.campaignModel.find({});

		return campaigns;
	}
}

export { CampaignDao };
