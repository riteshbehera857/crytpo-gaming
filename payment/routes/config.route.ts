import { NextFunction, Request, Response, Router } from 'express';

import { celebrate, Joi, Segments } from 'celebrate';
import { catchAsync } from '../../common/lib';
import ConfigController from '../controllers/config.controller';
// import passport, { checkPermission } from '../../common/lib/passport-config';

const router = Router();

export default (app: Router) => {
	// Use the "/config" route for configuration management, authenticate with JWT
	app.use(
		'/config',
		// passport.authenticate('jwt', { session: false }),
		router,
	);
	/**
	 * @openapi
	 * /payment/config:
	 *   get:
	 *     tags:
	 *       - Configuration
	 *     summary: Get configuration settings
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
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
	 *                   description: Data object containing the list of games.
	 */
	// GET endpoint to retrieve configuration, requires admin role and config.get permission
	router.get(
		'/',
		// checkPermission([role.admin], [permission.config.get]),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await ConfigController.getConfig(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /payment/config:
	 *   post:
	 *     tags:
	 *       - Configuration
	 *     summary: Update configuration settings
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               paymentType:
	 *                 type: string
	 *                 enum: [round, user_selection]
	 *               depositCommission:
	 *                 type: number
	 *               withdrawalCommission:
	 *                 type: number
	 *               priority:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     name:
	 *                       type: string
	 *                     limits:
	 *                       type: string
	 *                     maxLimits:
	 *                       type: string
	 *                     active:
	 *                       type: boolean
	 *                     paymentType:
	 *                       type: array
	 *                       items:
	 *                         type: string
	 *                     updatedAt:
	 *                       type: string
	 *                       format: date-time
	 *                     createdAt:
	 *                       type: string
	 *                       format: date-time
	 *     responses:
	 *       '200':
	 *         description: Games fetched successfully
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
	 *                   description: Data object containing the list of games.
	 */

	// POST endpoint to update configuration, requires admin role and config.update permission
	router.post(
		'/',
		celebrate({
			[Segments.BODY]: Joi.object({
				// Validate payment_type as valid string
				paymentType: Joi.string()
					.valid('round', 'user_selection')
					.required(),
				// Example validation for deposit commission
				depositCommission: Joi.number().required(),
				// Example validation for withdrawal commission
				withdrawalCommission: Joi.number().required(),
				// Validate priority array with nested objects
				priority: Joi.array()
					.items(
						Joi.object({
							name: Joi.string().required(),
							limits: Joi.string().required(),
							maxLimits: Joi.string().required(),
							active: Joi.boolean().required(),
							paymentType: Joi.array().items(Joi.string()).required(),
							updatedAt: Joi.date().required(),
							createdAt: Joi.date().required(),
						}),
					)
					.required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await ConfigController.updateConfig(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
		// checkPermission([role.admin], [permission.config.update]),
	);
};
