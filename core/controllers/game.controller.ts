import { NextFunction, Request, Response } from 'express';
import getLogger from '../../common/logger';
import Container from 'typedi';
import { GameService } from '../services/game.service';

class GameController {
	private static logger = getLogger(module);

	public static async getGamesList(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details
		this.logger.debug(
			'Calling api /game/list with body: ' + JSON.stringify({ ...req.body }),
		);
		const gameService = Container.get(GameService);
		try {
			const resp = await gameService.getGamesList();

			return resp;
		} catch (err) {
			// Log and pass the error to the next middleware
			this.logger.error('🔥 error: ' + err?.message);
			return next(err);
		}
	}

	public static async getGameLaunchUrl(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details
		this.logger.debug(
			'Calling api /game/launchUrl with body: ' +
				JSON.stringify({ ...req.body }),
		);

		const gameService = Container.get(GameService);

		try {
			const user = req.currentUser;
			const fetchLaunchUrlData = {
				token: req.body.token,
				gameId: req.body.gameId,
			};
			const resp = await gameService.getLaunchUrl(fetchLaunchUrlData);

			return resp;
		} catch (error) {
			this.logger.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}

export { GameController };
