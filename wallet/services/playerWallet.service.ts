import { Service } from 'typedi';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import { PlayerDao } from '../daos/player.dao';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import {
	getPlayerByIdSchema,
	updatePlayerWithdrawalBalanceSchema,
} from '../../common/schemas/player.schema';
import { TransactionEnum } from '../../common/types/transaction';
import { RuleDao } from '../daos/rule.dao';
import { IRule } from '../../common/interfaces/rule.interface';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IPlayer } from '../../common/interfaces/player.interface';

// Define and export the UserService class as a service
@Service()
class PlayerService {
	private playerDao: PlayerDao;
	private ruleDao: RuleDao;
	private commonPlayerDao: CommonPlayerDao;
	// private ruleDao: RuleDao;
	private logger: Logger;
	constructor() {
		this.playerDao = new PlayerDao();
		this.commonPlayerDao = new CommonPlayerDao();
		this.ruleDao = new RuleDao();
		this.logger = getLogger(module);
	}

	/**
	 * Retrieves a player by their ID from the database.
	 * @param id The ID of the player to retrieve.
	 * @returns A Response object containing either the player data if found, or an error response if not found.
	 * @throws Throws an error if there is an issue with validation or database operation.
	 */
	public async getPlayerById(id: any): Promise<Response<IPlayer>> {
		try {
			// Retrieve the player from the DAO using the validated 'id'
			const user = await this.commonPlayerDao.getPlayerById(id);

			// If player not found, return a response with PLAYER_NOT_FOUND code and message
			if (!user) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			} else {
				// If player found, return a response with PLAYER_FETCHED_SUCCESS code, message, and player data
				return new Response<IPlayer>(
					ResponseCodes.RS_OK.code,
					ResponseCodes.RS_OK.message,
					user,
				);
			}
		} catch (err) {
			// If an error occurs during validation or database operation, rethrow the error
			throw err;
		}
	}

	/**
	 * Updates a player in the database based on the provided query and data.
	 * @param query The query options to find and update the player.
	 * @param data The data to update the player with.
	 * @param options Additional options for the update operation (optional).
	 * @returns A Response object containing either the updated player data or an error response.
	 * @throws Throws an error if the query or data is not provided, or if there is an issue with the update operation.
	 */

	public async updatePlayerWithdrawalBalance(
		id: string,
		data: IRule,
	): Promise<Response> {
		const { error, value } =
			updatePlayerWithdrawalBalanceSchema.validate(data);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		try {
			const player = await this.getPlayerById(id);

			if (!player.data) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			const rule = await this.ruleDao.findOneRule({
				numberOfGamePlay: data.numberOfGamePlay,
			});

			if (!rule) {
				return new Response(
					ResponseCodes.RULE_NOT_FOUND.code,
					ResponseCodes.RULE_NOT_FOUND.message,
				);
			}

			if (data.transactionType === TransactionEnum.WITHDRAW) {
				const updatedPlayer =
					await this.playerDao.updatePlayerWithdrawalBalance(
						player.data._doc,
						rule,
					);
				// Send data in response
				return new Response(
					ResponseCodes.PLAYER_UPDATED_SUCCESS.code,
					ResponseCodes.PLAYER_UPDATED_SUCCESS.message,
					{ player: updatedPlayer },
				);
			}
		} catch (err) {
			this.logger.error('🔥 error: ' + err?.message);
			throw err;
		}
	}
}

export { PlayerService };
