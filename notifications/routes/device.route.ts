import { Joi, Segments, celebrate } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { catchAsync } from '../../common/lib';

const route = Router();

export default (app: Router) => {
	app.use('/device', route);
	route.post(
		'/register',
		celebrate({
			[Segments.BODY]: Joi.object().keys({
				userId: Joi.string().required(),
				token: Joi.string().required(),
				id: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			try {
				await DeviceController.registerDevice(req);
				res.status(200).json({ message: 'Device Registered' });
			} catch (error) {
				return next(error);
			}
		}),
	);
};
