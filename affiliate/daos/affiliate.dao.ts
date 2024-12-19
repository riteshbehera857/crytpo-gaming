import { FilterQuery, Model } from 'mongoose';
import { IAffiliate } from '../../common/interfaces/affiliate.interface';
import Affiliate from '../models/affiliate.model';

class AffiliateDao {
	private affiliateModel: Model<IAffiliate>;

	constructor() {
		this.affiliateModel = Affiliate;
	}

	private async getAffiliate(query: FilterQuery<IAffiliate>) {
		return await this.affiliateModel.find(query);
	}

	public async fetchInternalAndTrackierAffiliateDetails() {
		const affiliate = await this.getAffiliate({
			name: { $in: ['Internal', 'Trackier'] },
		});

		return affiliate;
	}
}

export { AffiliateDao };
