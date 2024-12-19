import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import getLogger from '../../common/logger';
import { IPlayer } from '../../common/interfaces/player.interface';
import { PlayerService } from '../services/player.service';
import { UpdatePlayerRegistrationDetailsByEnum } from '../../common/types/updatePlayerRegistrationBy';
import { Player } from '../../common/classes/player.class';
import { PlayerDao } from '../daos/player.dao';
// import TransactionService from '../services/transact.service';
// import PlayerService from '../services/player.service';

export default class PlayerController {
	private static log = getLogger(module);

	public static async getCurrentUser(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /player/me with body: ');
		const playerService = new PlayerService();
		const playerDao = new PlayerDao();

		try {
			const user = req.currentUser;

			const player: IPlayer = new Player(user);

			const response = await playerService.getLoggedInUser(player);

			const apiResponse = response.getResponse();

			return apiResponse;
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async getRecentPaymentRequest(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /player/recent-transaction');
		const playerService = Container.get(PlayerService);

		try {
			const user = req.currentUser;

			const response =
				await playerService.getRecentTransactionRequests(user);

			// console.log(response);

			return response;
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async updatePlayerRegistrationDetails(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		// Log the API call details
		this.log.debug(
			'Calling api /player/update with body: ' + JSON.stringify(req.body),
			+'and query: ' + JSON.stringify(req.query),
		);

		const playerService = new PlayerService();
		const playerDao = new PlayerDao();

		const playerBankDetails = await playerDao.getPlayerByPhoneNumber(
			req.body.phoneNumber,
		);

		const updatedBankDetails = playerBankDetails?.bankDetails?.map(
			(account) => {
				console.log('Original Account:', account); // Log the original account details

				const updatedAccount = {
					accountName: account?.accountName,
					accountNumber: account.accountNumber,
					ifscCode: account.ifscCode,
					isVerified: account.isVerified,
					isPrimary: false, // Set existing accounts to non-primary
					createdAt: account?.createdAt,
				};

				console.log('Updated Account:', updatedAccount); // Log the updated account details

				return updatedAccount;
			},
		);

		// console.log(playerBankDetails.bankDetails);

		try {
			const updateBy = req.query
				.updateBy as UpdatePlayerRegistrationDetailsByEnum;

			const playerDetails: Partial<IPlayer> = {
				...req.body,
				...(req.body.bankDetail
					? {
							bankDetails: [
								...(updatedBankDetails || []),
								{
									...req.body.bankDetail,
									isVerified: false,
									isPrimary: true,
								},
							],
						}
					: null),
			};
			console.log('Final Player Details:', playerDetails);

			if ('bankDetail' in playerDetails) {
				delete playerDetails['bankDetail'];
			}

			const response = await playerService.updatePlayerRegistrationDetails(
				updateBy,
				playerDetails,
			);

			// Send the JSON response with a 200 status code
			return response;
		} catch (error) {
			// Log and pass the error to the next middleware
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async getPrimaryBank(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		this.log.debug('Calling api /player/get-primary-bank with body');

		const playerService = new PlayerService();

		try {
			const player = req.currentUser;

			const response = await playerService.getPrimaryBank(player);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}
