import { NextFunction, Router, Request, Response } from 'express';
import { celebrate, Joi, Segments } from 'celebrate'; // Importing celebrate, Joi, and Segments from celebrate module // Importing payment related controller functions
import WithdrawalController from '../controllers/withdrawal.controller'; // Importing withdrawal related controller functions
import Container from 'typedi';
// import passport, { checkPermission } from '../../common/lib/passport-config';
import { permission, role } from '../../common/lib/roleAndPermissions';
import { ConfigDao } from '../daos/configDao';
import { catchAsync } from '../../common/lib';
const router = Router(); // Creating a router instance
const withdrawalController = Container.get(WithdrawalController);

export default async (app: Router) => {
	// Mount the router at the "/withdrawal" endpoint
	app.use('/withdrawal', router);

	const configDao = new ConfigDao();
	// Retrieve the configuration from the database
	const config = await configDao.findOne();

	/**
	 * @openapi
	 * /payment/withdrawal:
	 *   post:
	 *     tags:
	 *       - Withdrawal
	 *     summary: Process withdrawal
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               skinId:
	 *                 type: string
	 *                 default: crashncash
	 *               amount:
	 *                 type: number
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

	router.post(
		'/',
		celebrate({
			[Segments.BODY]: Joi.object({
				skinId: Joi.string().default('crashncash'),
				amount: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await WithdrawalController.processWithdrawal(
				req,
				next,
			);

			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /payment/withdrawal/update:
	 *   post:
	 *     tags:
	 *       - Withdrawal
	 *     summary: Update withdrawal status
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               id:
	 *                 type: string
	 *                 format: ObjectId
	 *                 description: The ID of the withdrawal
	 *               status:
	 *                 type: string
	 *                 enum: [pending, success, processing, fail]
	 *                 description: The new status of the withdrawal
	 *               note:
	 *                 type: string
	 *                 description: Additional notes about the withdrawal
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

	router.post(
		'/update',
		// passport.authenticate('jwt', { session: false }), // Authenticate JWT token
		// checkPermission([role.admin], [permission.config.get]), // Check admin role permission
		celebrate({
			[Segments.BODY]: Joi.object({
				id: Joi.string().hex().length(24).required(),
				status: Joi.string()
					.valid('pending', 'success', 'processing', 'fail')
					.required(),
				note: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await WithdrawalController.manualWithdrawal(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
