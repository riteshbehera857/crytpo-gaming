import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import { verifyUser } from '../../common/middlewares/verfiyUser';
import { catchAsync } from '../../common/lib';
import PlayerController from '../controllers/player.controller';
import WalletController from '../controllers/wallet.controller';
import { casinoSignVerify } from '../../common/middlewares/casinoSignVeryfy';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/', route);

	/**
	 * @openapi
	 * /wallet/balance:
	 *  post:
	 *    tags:
	 *      - Wallet
	 *    summary: Get Player wallet balance
	 *    requestBody:
	 *      content:
	 *        application/json:
	 *          schema:
	 *            type: object
	 *            properties:
	 *              requestUuid:
	 *                type: string
	 *                required: true
	 *              gameId:
	 *                type: string
	 *              gameCode:
	 *                type: string
	 *
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
		'/balance',
		verifyUser(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				playerId: Joi.string().required(),
				requestUuid: Joi.string().required(),
				gameId: Joi.number(),
				gameCode: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await PlayerController.walletBalance(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /wallet/bet:
	 *   post:
	 *     tags:
	 *       - Wallet
	 *     summary: Create Bet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               transactionUuid:
	 *                 type: string
	 *                 description: Unique identifier for the transaction
	 *                 example: "123456789"
	 *               requestUuid:
	 *                 type: string
	 *                 description: Unique identifier for the request
	 *                 example: "987654321"
	 *               gameCode:
	 *                 type: string
	 *                 description: Game code for the bet
	 *                 example: "blackjack"
	 *               currency:
	 *                 type: string
	 *                 description: Currency code (e.g., USD, EUR)
	 *                 example: "USD"
	 *               amount:
	 *                 type: number
	 *                 description: Amount to be bet
	 *                 example: 100
	 *             required:
	 *               - transactionUuid
	 *               - requestUuid
	 *               - gameCode
	 *               - currency
	 *               - amount
	 *     responses:
	 *       '200':
	 *         description: Successfully created a new bet
	 *       '400':
	 *         description: Bad request
	 *       '404':
	 *         description: Not found
	 *       '500':
	 *         description: Internal server error
	 */
	route.post(
		'/bet',
		verifyUser(),
		// casinoSignVerify(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				playerId: Joi.string().required(),
				transactionUuid: Joi.string().required(),
				supplierUser: Joi.string(),
				roundClosed: Joi.boolean(),
				round: Joi.string().required(),
				rewardId: Joi.string(),
				requestUuid: Joi.string().required(),
				isFree: Joi.boolean(),
				isAggregated: Joi.boolean(),
				gameId: Joi.number(),
				gameCode: Joi.string().required(),
				currency: Joi.string().required(),
				bet: Joi.string(),
				betId: Joi.string(),
				amount: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await WalletController.walletBet(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /wallet/win:
	 *   post:
	 *     tags:
	 *       - Wallet
	 *     summary: Record Win
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               transactionUuid:
	 *                 type: string
	 *                 description: Unique identifier for the win transaction
	 *                 example: "123456789"
	 *                 required: true
	 *               supplierUser:
	 *                 type: string
	 *                 description: Supplier user associated with the win
	 *               roundClosed:
	 *                 type: boolean
	 *                 description: Flag indicating if the round is closed
	 *               round:
	 *                 type: string
	 *                 description: Round identifier for the win
	 *                 example: "Round123"
	 *                 required: true
	 *               rewardId:
	 *                 type: string
	 *                 description: Identifier for the reward associated with the win
	 *               requestUuid:
	 *                 type: string
	 *                 description: Unique identifier for the win request
	 *                 example: "987654321"
	 *                 required: true
	 *               isFree:
	 *                 type: boolean
	 *                 description: Flag indicating if the win is free
	 *               isAggregated:
	 *                 type: boolean
	 *                 description: Flag indicating if the win is aggregated
	 *               gameId:
	 *                 type: number
	 *                 description: Identifier for the game associated with the win
	 *               gameCode:
	 *                 type: string
	 *                 description: Game code for the win
	 *                 example: "slots"
	 *                 required: true
	 *               currency:
	 *                 type: string
	 *                 description: Currency code (e.g., USD, EUR)
	 *                 example: "USD"
	 *                 required: true
	 *               bet:
	 *                 type: string
	 *                 description: Bet identifier associated with the win
	 *               amount:
	 *                 type: number
	 *                 description: Amount won
	 *                 example: 50.75
	 *                 required: true
	 *     responses:
	 *       '200':
	 *         description: Successfully recorded a win
	 *       '400':
	 *         description: Bad request
	 *       '404':
	 *         description: Not found
	 *       '500':
	 *         description: Internal server error
	 */

	route.post(
		'/win',
		verifyUser(),
		// casinoSignVerify(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				playerId: Joi.string().required(),
				transactionUuid: Joi.string().required(),
				supplierUser: Joi.string(),
				roundClosed: Joi.boolean(),
				round: Joi.string().required(),
				rewardId: Joi.string(),
				requestUuid: Joi.string().required(),
				isFree: Joi.boolean(),
				isAggregated: Joi.boolean(),
				gameId: Joi.number(),
				gameCode: Joi.string().required(),
				currency: Joi.string().required(),
				bet: Joi.string(),
				betId: Joi.string(),
				amount: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await WalletController.walletWin(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);
	/**
	 * @openapi
	 * /wallet/refund:
	 *   post:
	 *     tags:
	 *       - Wallet
	 *     summary: Process Refund
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               transactionUuid:
	 *                 type: string
	 *                 description: Unique identifier for the refund transaction
	 *                 example: "123456789"
	 *                 required: true
	 *               requestUuid:
	 *                 type: string
	 *                 description: Unique identifier for the refund request
	 *                 example: "987654321"
	 *                 required: true
	 *               currency:
	 *                 type: string
	 *                 description: Currency code (e.g., USD, EUR)
	 *                 example: "USD"
	 *                 required: true
	 *               amount:
	 *                 type: number
	 *                 description: Amount to be refunded
	 *                 example: 50.0
	 *                 required: true
	 *     responses:
	 *       '200':
	 *         description: Successfully processed the refund
	 *       '400':
	 *         description: Bad request
	 *       '404':
	 *         description: Not found
	 *       '500':
	 *         description: Internal server error
	 */

	route.post(
		'/refund',
		verifyUser(),
		casinoSignVerify(),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				playerId: Joi.string().required(),
				transactionUuid: Joi.string().required(),
				requestUuid: Joi.string().required(),
				currency: Joi.string().required(),
				amount: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the PlayerController
			const response = await WalletController.walletRefund(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);

	// route.post(
	// 	'/sign',

	// 	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	// 		// Call the register method of the PlayerController
	// 		const response = await getSign(req);
	// 		// Send the response
	// 		return res.status(200).json(response);
	// 	}),
	// );
};
