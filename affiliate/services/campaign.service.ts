import { Service } from 'typedi';
import { CampaignDao } from '../daos/campaign.dao';
import { ICampaign } from '../../common/interfaces/campaign.interface';

@Service()
class CampaignService {
	private campaignDao: CampaignDao;

	constructor() {
		this.campaignDao = new CampaignDao();
	}

	public async getAllCampaigns(): Promise<ICampaign[]> {
		return await this.campaignDao.getAllCampaigns();
	}
}

export { CampaignService };
