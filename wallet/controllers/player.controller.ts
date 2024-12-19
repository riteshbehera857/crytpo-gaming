import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import getLogger from '../../common/logger';
import { IPlayer } from '../../common/interfaces/player.interface';
import { PlayerService } from '../services/playerWallet.service';
import { Player } from '../../common/classes/player.class';
import { Rule } from '../../common/classes/rule.class';
import { IRule } from '../../common/interfaces/rule.interface';

export default class PlayerController {
	private static log = getLogger(module);

	public static async walletBalance(req: Request, next: NextFunction) {
		this.log.debug('Calling api / wallet /balance', JSON.stringify(req.body));
		const playerService = new PlayerService();
		try {
			const currentPlayer = req.currentUser;

			const response = await playerService.getPlayerById(currentPlayer._id);

			// Send the JSON response with a 200 status code
			// console.log('user response', response);
			return {
				user: response?.data?._id,
				status: response.message,
				requestUuid: req.body.requestUuid,
				balance: response.data?.currentBalance,
			};
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async updatePlayerWithdrawalBalance(
		req: Request,
		next: NextFunction,
	) {
		// Log the API call details
		this.log.debug(
			'Calling api /transact/withdraw/update with body: ' +
				JSON.stringify(req.body),
		);
		const playerService = new PlayerService();

		try {
			// Create an instance of the TransactionService from the dependency injection container

			const data: IRule = { ...req.body };

			const rule = new Rule(data);

			// Call the deposit method of TransactionService with depositId and currentUser
			const response = await playerService.updatePlayerWithdrawalBalance(
				req.id,
				rule,
			);

			// Send the JSON response with a 200 status code
			return response;
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}
