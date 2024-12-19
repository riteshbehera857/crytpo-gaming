import { Container } from 'typedi';
import { Service } from 'typedi';
import { IMessage } from './../interfaces/message';
import { PublisherService } from './publisher.service';
import config from '../config';
import getLogger from '../../common/logger';

const log = getLogger(module);
@Service()
export default class NotificationService {
	sendMessage(message: IMessage) {
		console.log('00000000000000000');
		const publisherService = Container.get(PublisherService);
		const ret = publisherService.publishMessage(
			message,
			config.pub_sub.channel,
		);
		let response = {};
		if (ret) {
			response = {
				message: 'Message Queued',
				status: 'success',
				data: ret,
			};
		} else {
			response = {
				status: 'failure',
				message: 'Error sending message to queue',
			};
		}
		return response;
	}
}

export { NotificationService };
