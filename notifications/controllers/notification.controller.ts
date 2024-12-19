import { Container } from 'typedi';
import { Request } from 'express';
import { IMessage } from '../interfaces/message';
import NotificationService from '../services/notification.service';
import getLogger from '../../common/logger';

const log = getLogger(module);
export default class NotificationController {
	public static async sendMessage(req: Request) {
		log.debug(`Sending message : ${JSON.stringify(req.body)}`);
		const message = req.body as IMessage;
		const notificationService = Container.get(NotificationService);

		const response = notificationService.sendMessage(message);
		return response;
	}
}

export { NotificationController };
