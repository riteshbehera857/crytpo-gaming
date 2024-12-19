import { Container, Service } from 'typedi';
import { IMessage } from '../interfaces/message';
import { CampaignService } from '../services/campaign.service';
import { MessageProcessor } from '../interfaces/message_processor';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class BonusCampaignProcessor implements MessageProcessor {
	processMessage(message: IMessage) {
		Container.get(CampaignService).processMessage(message);
	}
}

log.info('Registering BonusCampaignProcessor');

Container.set(BonusCampaignProcessor.name, new BonusCampaignProcessor());

export { BonusCampaignProcessor };
