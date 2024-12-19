import { FilterQuery, Schema } from 'mongoose';
import { Service } from 'typedi';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
// import { NotificationDao } from '../daos/notification.dao';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { INotification } from '../../common/interfaces/notification.interface';
import { AuthService } from './auth.service';
import { SeenNotificationDao } from '../daos/seenNotification.dao';
import { ISeenNotification } from '../../common/interfaces/IseenNotification';

@Service()
class NotificationService {
    private notificationDao: SeenNotificationDao;
    private logger: Logger;
    private authService: AuthService;

    constructor() {
        this.notificationDao = new SeenNotificationDao();
        this.authService = new AuthService();
        this.logger = getLogger(module);
    }

    /**
     * Retrieves a notification by its ID from the database.
     * @param id The ID of the notification to retrieve.
     * @returns A Response object containing either the notification data if found, or an error response if not found.
     * @throws Throws an error if there is an issue with validation or database operation.
     */
    public async getNotificationById(id: Schema.Types.ObjectId): Promise<Response<INotification>> {
        try {
            const notification = await this.notificationDao.findNotificationsByUserId(id);

            if (!notification) {
                return new Response(
                    ResponseCodes.NOTIFICATION_NOT_FOUND.code,
                    ResponseCodes.NOTIFICATION_NOT_FOUND.message,
                );
            } else {
                return new Response<any>(
                    ResponseCodes.NOTIFICATION_FETCHED_SUCCESS.code,
                    ResponseCodes.NOTIFICATION_FETCHED_SUCCESS.message,
                    notification,
                );
            }
        } catch (err) {
            throw err;
        }
    }

    public async getNotificationsByUserId(userId: Schema.Types.ObjectId): Promise<Response<INotification[]>> {
        try {
            const notifications = await this.notificationDao.findNotificationsByUserId(userId);
            // console.log(`notifications`, notifications);
            return new Response<INotification[]>(
                ResponseCodes.NOTIFICATIONS_FETCHED_SUCCESS.code,
                ResponseCodes.NOTIFICATIONS_FETCHED_SUCCESS.message,
                notifications,
            );
        } catch (error) {
            this.logger.error('🔥 error: ' + error?.message);
            throw error;
        }
    }

    /**
     * Marks notifications as seen based on the provided query.
     * @param query The query options to find and update the notifications.
     * @param data The data to update the notifications with.
     * @returns A Response object containing either the updated notifications or an error response.
     * @throws Throws an error if the query or data is not provided, or if there is an issue with the update operation.
     */
    public async markNotificationsAsSeen(
        userId: Schema.Types.ObjectId,
        notificationId: Schema.Types.ObjectId
    ): Promise<Response<INotification[]>> {
        try {
            // Validate inputs
            if (!userId) {
                return new Response(
                    ResponseCodes.NOTIFICATION_CREATED_QUERY_NOT_PROVIDED.code,
                    'User ID is required.',
                );
            }
            const updatedNotifications = await this.notificationDao.markAsSeen(userId, notificationId);

            return new Response<any>(
                ResponseCodes.NOTIFICATION_CREATED_SUCCESS.code,
                ResponseCodes.NOTIFICATION_CREATED_SUCCESS.message,
                // updatedNotifications,
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves recent notifications for a user.
     * @param userId The ID of the user to fetch notifications for.
     * @returns A Response object containing the recent notifications.
     */
    public async getRecentNotifications(userId: Schema.Types.ObjectId): Promise<Response<{ notifications: INotification[] }>> {
        try {
            const notifications = await this.notificationDao.findNotificationsByUserId(userId);

            return new Response<{ notifications: any }>(
                ResponseCodes.NOTIFICATIONS_FETCHED_SUCCESS.code,
                ResponseCodes.NOTIFICATIONS_FETCHED_SUCCESS.message,
                { notifications },
            );
        } catch (error) {
            throw error;
        }
    }

    // NotificationService.ts
    public async deleteNotification(notificationId: string, userId: Schema.Types.ObjectId): Promise<any> {
        try {
            await this.notificationDao.deleteNotification(notificationId, userId);


            return new Response<any>(
                ResponseCodes.NOTIFICATIONS_DELETE_SUCCESS.code,
                ResponseCodes.NOTIFICATIONS_DELETE_SUCCESS.message,
                {},
            );
        } catch (error) {
            this.logger.error('🔥 error: ' + error?.message);
            throw error;
        }
    }

}

export { NotificationService };
