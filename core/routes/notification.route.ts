import { Request, Response, NextFunction, Router } from 'express';
import getLogger from '../../common/logger';
import { Joi, Segments, celebrate } from 'celebrate';
import { catchAsync } from '../../common/lib';
import middlewares from '../../common/middlewares';
import NotificationController from '../controllers/seenNotification.controller';

const router = Router();

export default (app: Router) => {
    app.use('/notifications', router);

    /**
     * @openapi
     * /core/notifications/seen:
     *   post:
     *     tags:
     *       - Notifications
     *     summary: Mark notifications as seen
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               notificationIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 required: true
     *     responses:
     *       '200':
     *         description: Notifications marked as seen successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   description: The response code specific to the operation.
     *                 message:
     *                   type: string
     *                   description: A human-readable message explaining the response.
     *                 data:
     *                   type: object
     *                   description: Data object containing the status of the operation.
     */
    router.post(
        '/seen',
        celebrate({
            [Segments.BODY]: Joi.object({
                notificationId: Joi.string().required(),
            }),
        }),
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const response = await NotificationController.markNotificationsAsSeen(req, res, next);
            return res.status(200).json(response);
        }),
    );

    router.get(
        '/',
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const response = await NotificationController.getNotificationsByUserId(req, res, next);
            return res.status(200).json(response);
        }),
    );
    // router.ts or equivalent
    router.delete(
        '/:notificationId',
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const response = await NotificationController.deleteNotification(req, res, next);
            return res.status(200).json(response);
        }),
    );


    // router.get(
    //     '/seen',
    //     catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //         const response = await NotificationController.getNotificationsByUserId(req, res, next);
    //         return res.status(200).json(response);
    //     }),
    // );

};
