import { Request, Response, NextFunction, Router } from 'express';
import getLogger from '../../common/logger';
import { Joi, Segments, celebrate } from 'celebrate';
import { catchAsync } from '../../common/lib';
import { GameController } from '../controllers/game.controller';
import middlewares from '../../common/middlewares';

const router = Router();

export default (app: Router) => {
	app.use('/game', router);

	/**
	 * @openapi
	 * /core/game/list:
	 *   post:
	 *     tags:
	 *       - Games
	 *     summary: Get all games list
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
		'/list',
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await GameController.getGamesList(req, res, next);

			return res.status(200).json(response);
		}),
	);

	/**
	 * @openapi
	 * /core/game/launchUrl:
	 *   post:
	 *     tags:
	 *       - Games
	 *     summary: Get game launch URL
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               gameId:
	 *                 type: string
	 *               token:
	 *                 type: string
	 *     responses:
	 *       '200':
	 *         description: Game launch URL fetched successfully
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
	 */
	router.post(
		'/launchUrl',
		celebrate({
			[Segments.BODY]: Joi.object({
				gameId: Joi.string().required(),
				token: Joi.string().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const response = await GameController.getGameLaunchUrl(req, res, next);

			return res.status(200).json(response);
		}),
	);
};
