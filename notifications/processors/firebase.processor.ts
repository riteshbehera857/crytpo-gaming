import { Container, Service } from 'typedi';
import { IMessage } from '../interfaces/message';
import FirebaseService from '../services/firebase.service';
import { MessageProcessor } from '../interfaces/message_processor';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class FirebaseMessageProcessor implements MessageProcessor {
	processMessage(message: IMessage) {
		Container.get(FirebaseService).sendMessage(message);
	}
}

log.info('Registering FirebaseMessageProcessor');

Container.set(FirebaseMessageProcessor.name, new FirebaseMessageProcessor());

export { FirebaseMessageProcessor };
