import { Joi, Segments, celebrate } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { catchAsync } from '../../common/lib';

const route = Router();

export default (app: Router) => {
	app.use('/notification', route);
	route.post(
		'/send',
		celebrate({
			[Segments.BODY]: Joi.object().keys({
				userId: Joi.string().required(),
				type: Joi.string().required(),
				subType: Joi.string().required(),
				sendTo: Joi.string().required(),
				payload: Joi.object().required(),
				title: Joi.string(),
				body: Joi.string(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			try {
				const response = await NotificationController.sendMessage(req);
				res.status(200).json(response);
			} catch (error) {
				next(error);
			}
		}),
	);
};
