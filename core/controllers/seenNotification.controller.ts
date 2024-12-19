import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import getLogger from '../../common/logger';
import { NotificationService } from '../services/notification.service';
// import { NotificationService } from '../services/notification.service';

export default class NotificationController {
    private static log = getLogger(module);

    public static async markNotificationsAsSeen(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        this.log.debug('Calling api /notifications/seen with body: ' + JSON.stringify(req.body));
        const notificationService = Container.get(NotificationService);

        try {
            const { notificationId } = req.body;

            const response = await notificationService.markNotificationsAsSeen(req.currentUser._id, notificationId);

            return response;
        } catch (error) {
            // Log and pass the error to the next middleware
            this.log.error('🔥 error: ' + error?.message);
            return next(error);
        }
    }
    public static async getNotificationsByUserId(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        this.log.debug('Calling api /notifications with user ID: ' + req.currentUser._id);
        const notificationService = Container.get(NotificationService);

        try {
            const userId = req.currentUser._id;  // Assuming req.user contains the user ID
            const notifications = await notificationService.getNotificationsByUserId(userId);

            return notifications;
        } catch (error) {
            this.log.error('🔥 error: ' + error?.message);
            return next(error);
        }
    }
    // NotificationController.ts
    public static async deleteNotification(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        this.log.debug('Deleting notification with ID: ' + req.params.notificationId);
        const notificationService = Container.get(NotificationService);

        try {
            const notificationId = req.params.notificationId;
            const userId = req.currentUser._id;

            return await notificationService.deleteNotification(notificationId, userId);
        } catch (error) {
            this.log.error('🔥 error: ' + error?.message);
            return next(error);
        }
    }

}
