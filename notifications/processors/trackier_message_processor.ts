import { Container, Service } from 'typedi';
import { IMessage } from '../interfaces/message';
import { MessageProcessor } from '../interfaces/message_processor';
import TrackierService from '../../events/trackier/trackier.service';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class TrackierMessageProcessor implements MessageProcessor {
	processMessage(message: IMessage) {
		Container.get(TrackierService).postMessage(message);
	}
}

log.info('Registering TrackierMessageProcessor');

Container.set(TrackierMessageProcessor.name, new TrackierMessageProcessor());

export { TrackierMessageProcessor };
