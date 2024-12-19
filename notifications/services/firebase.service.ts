import { Service } from 'typedi';
import {
	initializeApp,
	applicationDefault,
	ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { IMessage } from '../interfaces/message';
import { DeviceService } from './device.service';
import { Container } from 'typedi';
import { credential } from 'firebase-admin';

// import * as serviceAccount from '../../../serviceAccountKey.json';
import { ITopic } from '../interfaces/topic';
import { PlayerDao } from '../../core/daos/player.dao';
import getLogger from '../../common/logger';
import { token } from 'morgan';

const log = getLogger(module);
@Service()
export default class FirebaseService {
	constructor() {
		initializeApp({
			credential: applicationDefault(),
		});
	}
	private generateUniqueId() {
		return (
			'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
		);
	}

	public async sendMessage(imsg: IMessage) {
		log.debug('Message:' + JSON.stringify(imsg));
		const deviceService = Container.get(DeviceService);

		if (imsg.isForAllUser) {
			const playersDado = new PlayerDao();
			const loggedInUsers: any = await playersDado.getCurrentLoggedInUsers();

			for (const user of loggedInUsers) {
				// Get the player's _id
				const playerId = user.playerInfo._id;

				// Get tokens for the player
				const tokens = await deviceService.getTokens(playerId.toString());

				log.debug(`Found tokens ${JSON.stringify(tokens)}`);

				// Send message to all tokens

				await this.sendMessageToAllUser(ITopic.AllUsers, imsg, tokens);
			}

			const response = {
				messageId: '', // Assuming messageId will be set elsewhere
				message: 'Notification sent',
				status: 'success',
			};
			return response;
		}

		const tokens = await deviceService.getTokens(imsg.userId);

		if (!tokens || tokens.length === 0) {
			log.error('No devices found for user:', imsg.sendTo);
			const response = {
				status: 'failure',
				message: 'No devices found for user',
			};
			return response;
		}

		const message = {
			tokens: tokens,
			// notification: {
			// 	title: imsg.title,
			// 	body: imsg.body,
			// },
			data: Object.fromEntries(
				Object.entries({
					...imsg.payload,
					type: imsg.type,
					subtype: imsg.subType,
					messageIdUnique: this.generateUniqueId(),
				}).map(([key, value]) => [key, value.toString()]),
			),
		};
		console.log(`Message: -`, message);

		let messageId: string = '';
		// sendEachForMulticast
		getMessaging()
			.sendEachForMulticast(message)
			.then((response) => {
				console.log(`Response: -`, response.responses);
				messageId =
					response.successCount > 0 ? response.responses[0].messageId : '';
				log.debug('Successfully sent message:', response);
			})
			.catch((error) => {
				messageId = error?.message;
				log.error('Error sending message:', error);
			});

		const response = {
			messageId: messageId,
			message: 'Notification sent',
			status: 'success',
		};
		return response;
	}

	public async sendMessageToAllUser(
		topic: string,
		message: IMessage,
		tokens: string[],
	) {
		log.debug(`Sending message to topic ${topic} with tokens ${tokens}`);

		try {
			const response = await getMessaging().sendEachForMulticast({
				tokens: tokens,
				// notification: {
				// 	title: message.title,
				// 	body: message.body,
				// },
				data: Object.fromEntries(
					Object.entries({
						...message.payload,
						type: message.type,
						subtype: message.subType,
						messageIdUnique: this.generateUniqueId(),
					}).map(([key, value]) => [key, value.toString()]),
				),
			});

			log.debug(`Successfully sent message to topic ${topic}:`, response);

			return {
				status: 'success',
				message: `Message sent to topic ${topic}`,
				response,
			};
		} catch (error) {
			log.error(`Error sending message to topic ${topic}:`, error);
			return {
				status: 'failure',
				message: `Error sending message to topic ${topic}`,
				error,
			};
		}
	}
}

export { FirebaseService };
