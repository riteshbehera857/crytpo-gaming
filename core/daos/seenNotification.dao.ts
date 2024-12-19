import { Model, Schema } from 'mongoose';
import SeenNotification from '../models/seenNotification.model';
import { ISeenNotification } from '../../common/interfaces/IseenNotification';
import Notification from '../models/notification.model';
import { INotification } from '../../common/interfaces/notification.interface';
import { INotificationLog } from '../../common/interfaces/notificationLog.interface';
import NotificationLog from '../models/notificationLogLog.model';

class SeenNotificationDao {
	private seenNotificationModel: Model<ISeenNotification>;
	private notificationModel: Model<INotification>;
	private notificationLogModel: Model<INotificationLog>;

	constructor() {
		this.seenNotificationModel = SeenNotification;
		this.notificationModel = Notification;
		this.notificationLogModel = NotificationLog;
	}

	public async markAsSeen(
		userId: Schema.Types.ObjectId,
		notificationId: Schema.Types.ObjectId,
	): Promise<ISeenNotification> {
		const seenNotification = await this.notificationLogModel.create({
			userId,
			notificationId,
			action: 'seen', // Action type is 'seen'
		});

		return seenNotification;
	}

	public async findSeenNotification(
		userId: string,
		notificationId: string,
	): Promise<ISeenNotification | null> {
		const seenNotification = await this.seenNotificationModel.findOne({
			userId,
			notificationId,
		});

		return seenNotification;
	}
	public async findNotificationsByUserId(
		userId: Schema.Types.ObjectId,
	): Promise<INotification[]> {
		const notifications = await this.notificationModel.aggregate([
			{
				$match: {
					$or: [
						{ recipients: { $in: [userId] } },
						{ recipients: { $in: [userId.toString()] } },
						{ recipients: { $in: ['*'] } },
					],
					// Uncomment the next line if you want to filter out notifications with a non-null deletedAt field
					// deletedAt: { $eq: null }
				},
			},
			{
				$lookup: {
					from: 'notificationlogs', // The collection name for NotificationLog
					localField: '_id',
					foreignField: 'notificationId',
					as: 'seenInfo',
				},
			},
			{
				$addFields: {
					hasDeletedLog: {
						$in: [
							'deleted',
							{
								$map: {
									input: '$seenInfo',
									as: 'log',
									in: '$$log.action',
								},
							},
						],
					},
				},
			},
			{
				$match: {
					hasDeletedLog: false, // Exclude notifications that have any 'deleted' logs
				},
			},
			{
				$addFields: {
					seen: {
						$in: [
							userId,
							{
								$map: {
									input: '$seenInfo',
									as: 'log',
									in: '$$log.userId',
								},
							},
						],
					},
				},
			},
			{
				$sort: { createdAt: -1 }, // Sort by createdAt in descending order
			},
			{
				$project: {
					seenInfo: 0, // Exclude seenInfo field if not needed in final output
					scheduleTime: 0,
					recipients: 0, // Exclude recipients field if not needed in final output
					status: 0,
					createdBy: 0,
					updatedAt: 0,
					deletedAt: 0,
				},
			},
		]);

		return notifications;
	}

	public async deleteNotification(
		notificationId: string,
		userId: Schema.Types.ObjectId,
	): Promise<void> {
		try {
			await this.notificationLogModel.create({
				userId,
				notificationId,
				action: 'deleted', // Action type is 'seen'
			});
		} catch (error) {
			// this.logger.error('🔥 error: ' + error?.message);
			throw error;
		}
	}
}

export { SeenNotificationDao };
