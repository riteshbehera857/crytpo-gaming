import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import { verifyUser } from '../../common/middlewares/verfiyUser';
import { catchAsync } from '../../common/lib';
import TransactionController from '../controllers/transaction.controller';
import PlayerController from '../controllers/player.controller';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/transaction', route);

	/**
	 * @openapi
	 * /wallet/transaction:
	 *  post:
	 *    tags:
	 *      - Wallet
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
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				transactionUuid: Joi.string().required(),
				transactionType: Joi.string().required(),
				round: Joi.string(),
				requestUuid: Joi.string().required(),
				gameCode: Joi.string(),
				currency: Joi.string().required(),
				amount: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await TransactionController.createTransaction(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /wallet/transaction/updateBalance:
	 *   post:
	 *     tags:
	 *       - Wallet
	 *     summary: Update player balance
	 *     security:
	 *       - bearerAuth: []  # Use JWT bearer token authentication
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               transactionType:
	 *                 type: string
	 *                 description: Type of transaction (e.g., deposit, withdrawal)
	 *               numberOfGamePlay:
	 *                 type: number
	 *                 description: Number of gameplay
	 *     responses:
	 *       '200':
	 *         description: Player balance updated successfully.
	 */

	route.post(
		'/updateBalance',
		verifyUser(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				transactionType: Joi.string().required(),
				numberOfGamePlay: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await PlayerController.updatePlayerWithdrawalBalance(
				req,
				next,
			);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
