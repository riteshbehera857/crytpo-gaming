import { Model, Schema } from 'mongoose';
import { ICampaign } from '../../common/interfaces/campaign.interface';
import Campaign from '../../affiliate/models/campaign.model';
// import Campaign from '../models/Campaign.model';
// import Campaign from '../models/campaign.model';

class CampaignDao {
	private campaignModel: Model<ICampaign>;

	constructor() {
		this.campaignModel = Campaign;
	}

	public async getCampaignById(
		id: Schema.Types.ObjectId,
	): Promise<ICampaign | null> {
		const campaign = await this.campaignModel.findById(id);
		return campaign;
	}

	/**
	 * Remove a user's phone number from the assignBonusUser array in a campaign
	 * @param campaignId - The ID of the campaign to update
	 * @param phoneNumber - The phone number to remove from assignBonusUser
	 * @returns The updated campaign document or null if campaign not found
	 */
	public async removeUserFromAssignBonus(
		campaignId: Schema.Types.ObjectId,
		phoneNumber: string,
	): Promise<ICampaign | null> {
		const updatedCampaign = await this.campaignModel.findByIdAndUpdate(
			campaignId,
			{ $pull: { assignBonusUser: phoneNumber } },
			{ new: true }
		);
		return updatedCampaign;
	}
}

export { CampaignDao };
