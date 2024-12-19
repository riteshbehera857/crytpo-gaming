import { catchAsync } from './../../common/lib/catchAsync';
import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import AuthController from '../controllers/auth.controller';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/auth', route);

	route.post(
		'/validateToken',
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				token: Joi.string().required(),
			}),
		}),
		// Handle the registration logic
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.tokenValidation(req, res, next);

			res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /core/auth/otp/send-otp:
	 *   post:
	 *     tags:
	 *       - Authentication
	 *     summary: Send the OTP to the user
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               phoneNumber:
	 *                 type: string
	 *                 required: true
	 *     responses:
	 *       '200':
	 *         description: OTP sent successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                   description: A message confirming that the OTP has been sent.
	 *                 otp:
	 *                   type: string
	 *                   description: The generated OTP.
	 */

	route.post(
		'/otp/send-otp',
		celebrate({
			[Segments.BODY]: Joi.object({
				phoneNumber: Joi.string()
					.min(10)
					.regex(/^[6-9]\d{9}$/)
					.required()
					.messages({
						'string.min': 'Phone number must be of 10 digits',
						'object.regex': 'Must be a valid phone number',
						'string.pattern.base': 'Invalid phone number',
					}),
				bonusCode: Joi.string().optional(),
			}),
			[Segments.QUERY]: Joi.object({
				trackierToken: Joi.string().optional(),
				isTrackier: Joi.string().optional(),
				campaignId: Joi.string().optional(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.sendOtp(req, res, next);

			res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /core/auth/otp/verify-otp:
	 *   post:
	 *     tags:
	 *       - Authentication
	 *     summary: Verify the OTP sent by the user and on successful verification send the created token to the user as a response
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               phoneNumber:
	 *                 type: string
	 *                 required: true
	 *               otp:
	 *                 type: integer
	 *                 required: true
	 *     responses:
	 *       '200':
	 *         description: OTP verified successfully, token sent to the user.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 accessToken:
	 *                   type: string
	 *                   description: Access token for the verified user.
	 *                 tokenType:
	 *                   type: string
	 *                   description: Type of token (e.g., Bearer).
	 *                 expiresIn:
	 *                   type: integer
	 *                   format: int32
	 *                   description: The expiration time of the access token in seconds.
	 */

	route.post(
		'/otp/verify-otp',
		celebrate({
			[Segments.BODY]: Joi.object({
				phoneNumber: Joi.string().required(),
				otp: Joi.number().required(),
				deviceId: Joi.string().required(),
				googleFcmId: Joi.string().default(''),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.verifyOtp(req, res, next);

			res.status(200).json(response);
		}),
	);

	route.post(
		'/validate-session',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.validateSession(req, res, next);

			res.status(200).json(response);
		}),
	);

	route.post(
		'/app-exited',
		celebrate({
			[Segments.BODY]: Joi.object({
				phoneNumber: Joi.string().required(),
				// googleFcmId:Joi.string().default(''),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.appExited(req, res, next);

			res.status(200).json(response);
		}),
	);

	route.post(
		'/terminate-session',
		celebrate({
			[Segments.BODY]: Joi.object({
				phoneNumber: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await AuthController.terminateSession(req, res, next);

			res.status(200).json(response);
		}),
	);
};
