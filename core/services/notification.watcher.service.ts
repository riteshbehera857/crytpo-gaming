import { Service, Container } from 'typedi';
import Notification from '../models/notification.model';
import { INotification } from '../../common/interfaces/notification.interface';
import { IMessage } from '../../notifications/interfaces/message';
import { EventTypes, SubTypes } from '../../common/interfaces/event.interface';
import { PublisherService } from '../../notifications/services/publisher.service';
import FirebaseService from '../../notifications/services/firebase.service';

@Service()
class NotificationWatcher {
	private publisherService: PublisherService;
	constructor() {
		this.initializeWatcher();
		this.publisherService = new PublisherService();
	}
	private async handleNotification(
		newNotification: any,
		userIds: string[] | undefined,
	) {
		if (userIds && userIds.length > 0 && !userIds.includes('*')) {
			// If recipients array contains user IDs
			// console.log(`userId>>>>>>>>>>>>>>>>>>>>`, userIds);

			for (const userId of userIds) {
				// console.log(`userId>>>>>>>>>>>>>>>>>>>>`, userId);
				const notification: IMessage = {
					type: EventTypes.NOTIFICATION,
					subType: SubTypes.PUSH_NOTIFICATION,
					ts: Date.now(),
					title: newNotification.title,
					body: newNotification.body,
					userId: userId, // Optionally set a specific user ID if needed
					payload: {
						notificationId: newNotification._id,
						notificationTitle: newNotification.title,
						body: newNotification.body,
						type: newNotification.type,
						date: new Date(),
					},
				};

				// await this.publisherService.publishMessage(notification, 'notification');
				Container.get(FirebaseService).sendMessage(notification);
			}
		} else {
			// If recipients array is empty ([]), indicating it's for all users
			const notification: IMessage = {
				type: EventTypes.NOTIFICATION,
				ts: Date.now(),
				subType: SubTypes.PUSH_NOTIFICATION,
				isForAllUser: true,
				userId: '', // Optionally set a specific user ID if needed
				payload: {
					notificationId: newNotification._id,
					notificationTitle: newNotification.title,
					body: newNotification.body,
					type: newNotification.type,
					date: new Date(),
				},
			};
			await this.publisherService.publishMessage(
				notification,
				'notification',
			);
		}
	}

	private initializeWatcher() {
		const notificationChangeStream = Notification.watch();

		notificationChangeStream.on('change', async (change) => {
			switch (change.operationType) {
				case 'insert':
					const newNotification: INotification =
						change.fullDocument as INotification;
					console.log('New notification added:', newNotification);
					try {
						const newNotification: INotification =
							change.fullDocument as INotification;
						// log.debug('New notification added:', newNotification);

						if (
							newNotification.recipients &&
							newNotification.recipients.length > 0
						) {
							await this.handleNotification(
								newNotification,
								newNotification.recipients,
							);
						} else {
							await this.handleNotification(newNotification, undefined);
						}
					} catch (error) {
						// log.error('Error processing new notification:', error);
						console.log('Error processing new notification:', error);
					}
					// Handle insert event
					break;
				case 'update':
					const updatedNotification: INotification =
						change.fullDocument as INotification;
					console.log('Notification updated:', updatedNotification);
					// Handle update event
					break;
				case 'delete':
					const deletedNotificationId: string = change.documentKey
						._id as string;
					console.log('Notification deleted:', deletedNotificationId);
					// Handle delete event
					break;
				default:
					console.log('Unsupported operation');
			}
		});

		notificationChangeStream.on('error', (err) => {
			console.error('Change stream error:', err);
		});

		notificationChangeStream.on('close', () => {
			console.log('Change stream closed');
		});

		// Start listening to change stream
		notificationChangeStream.on('ready', () => {
			console.log('Change stream ready');
		});
	}
}

export default NotificationWatcher;
