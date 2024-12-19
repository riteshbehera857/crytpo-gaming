import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import { catchAsync } from '../../common/lib';
import { Joi, Segments, celebrate } from 'celebrate';
import { verifyUser } from '../../common/middlewares/verfiyUser';
import UploadFileController from '../controllers/uploadFile.controller';
import { upload } from '../services/multer.service';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/image', route);

	/**
	 * @openapi
	 * /auth/register:
	 *  post:
	 *    tags:
	 *      - Authentication
	 *    summary: Register a new user
	 *    requestBody:
	 *      content:
	 *        application/json:
	 *          schema:
	 *            type: object
	 *            properties:
	 *              email:
	 *                type: string
	 *                required: true
	 *              password:
	 *                type: string
	 *                required: true
	 *              name:
	 *                type: string
	 *              scope:
	 *                type: string
	 *    responses:
	 *      200:
	 *        description: Successfully created a new user
	 *      400:
	 *        description: Bad request
	 *      404:
	 *        description: Not found
	 *      500:
	 *          description: Internal server error
	 */

	route.post(
		'/',
		verifyUser(),
		upload.single('file'),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await UploadFileController.uploadFile(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
