import { Container, Service } from 'typedi';
import { IMessage } from '../interfaces/message';
import { MessageProcessor } from '../interfaces/message_processor';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class LogMessageProcessor implements MessageProcessor {
	processMessage(message: IMessage) {
		log.debug('Processing message : ' + JSON.stringify(message));
	}
}

log.info('Registering LogMessageProcessor');

Container.set(LogMessageProcessor.name, new LogMessageProcessor());

export { LogMessageProcessor };
