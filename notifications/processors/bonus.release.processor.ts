import { Container, Service } from 'typedi';
import { IMessage } from '../interfaces/message';
import { BonusReleaseService } from '../services/bonus.release.service';
import { MessageProcessor } from '../interfaces/message_processor';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class BonusReleaseProcessor implements MessageProcessor {
	processMessage(message: IMessage) {
		Container.get(BonusReleaseService).processMessage(message);
	}
}

log.info('Registering BonusReleaseProcessor');

Container.set(BonusReleaseProcessor.name, new BonusReleaseProcessor());

export { BonusReleaseProcessor };
