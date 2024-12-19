import { FilterQuery, MongooseUpdateQueryOptions } from 'mongoose';
import { Service } from 'typedi';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import { PlayerDao } from '../daos/player.dao';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { getPlayerByIdSchema } from '../../common/schemas/player.schema';
import { IPlayer } from '../../common/interfaces/player.interface';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { UpdatePlayerRegistrationDetailsByEnum } from '../../common/types/updatePlayerRegistrationBy';
import { AuthService } from './auth.service';
import { PaymentRequestDao } from '../../payment/daos/paymentRequestLogDao';
import { IPaymentRequestLog } from '../../common/interfaces/paymentRequestLog.interface';
import { IResponse } from '../../common/interfaces/response.interface';

// Define and export the UserService class as a service
@Service()
class PlayerService {
	private playerDao: PlayerDao;
	// private ruleDao: RuleDao;
	private logger: Logger;
	private commonPlayerDao: CommonPlayerDao;
	private authService: AuthService;
	private paymentRequestDao: PaymentRequestDao;

	constructor() {
		this.playerDao = new PlayerDao();
		this.commonPlayerDao = new CommonPlayerDao();
		this.authService = new AuthService();
		this.paymentRequestDao = new PaymentRequestDao();
		// this.ruleDao = new RuleDao();
		this.logger = getLogger(module);
	}

	/**
	 * Retrieves a player by their ID from the database.
	 * @param id The ID of the player to retrieve.
	 * @returns A Response object containing either the player data if found, or an error response if not found.
	 * @throws Throws an error if there is an issue with validation or database operation.
	 */
	public async getPlayerById(id: string): Promise<Response<IPlayer>> {
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
					ResponseCodes.PLAYER_FETCHED_SUCCESS.code,
					ResponseCodes.PLAYER_FETCHED_SUCCESS.message,
					user,
				);
			}
		} catch (err) {
			// If an error occurs during validation or database operation, rethrow the error
			throw err;
		}
	}

	public async getLoggedInUser(player: IPlayer): Promise<Response<IPlayer>> {
		try {
			return new Response(
				ResponseCodes.LOGGED_IN_USER_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.LOGGED_IN_USER_FETCHED_SUCCESSFULLY.message,
				player,
			);
		} catch (error) {
			throw error;
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
	public async updatePlayer(
		query: FilterQuery<IPlayer>,
		data: any,
		options?: any,
	): Promise<Response<IPlayer>> {
		try {
			// Check if the query is provided and is of type object
			if (typeof query !== 'object' || !query) {
				return new Response(
					ResponseCodes.PLAYER_UPDATE_QUERY_NOT_PROVIDED.code,
					ResponseCodes.PLAYER_UPDATE_QUERY_NOT_PROVIDED.message,
				);
			}

			// Check if the data is provided and is of type object
			if (typeof data !== 'object' || !data) {
				return new Response(
					ResponseCodes.PLAYER_UPDATE_DATA_NOT_PROVIDED.code,
					ResponseCodes.PLAYER_UPDATE_DATA_NOT_PROVIDED.message,
				);
			}

			// Update the player in the database using the provided query, data, and options
			const updatedPlayer = (await this.commonPlayerDao.findOneAndUpdate(
				query,
				data,
				options,
			)) as unknown as IPlayer;

			// Return a response with the updated player data
			return new Response<{ player: IPlayer }>(
				ResponseCodes.PLAYER_UPDATED_SUCCESS.code,
				ResponseCodes.PLAYER_UPDATED_SUCCESS.message,
				{ player: updatedPlayer },
			);
		} catch (error) {
			// If an error occurs during the update operation, rethrow the error
			throw error;
		}
	}

	/**
	 * Updates player registration details based on the specified identifier.
	 * @param updateBy The identifier to update player details (phone number, email, or ID).
	 * @param data The partial player data to update.
	 * @returns A response containing the updated player details.
	 */
	public async updatePlayerRegistrationDetails(
		updateBy: UpdatePlayerRegistrationDetailsByEnum,
		data: Partial<IPlayer>,
	): Promise<Response<IPlayer>> {
		try {
			let update: Partial<IPlayer>;
			// If password is provided, hash it before updating
			if (data.password) {
				const hashedPassword = await this.authService.generateHash(
					data.password,
				);
				update = {
					...data,
					password: hashedPassword,
				};
			} else {
				update = { ...data };
			}

			// Update player details based on the specified identifier
			let updatedPlayer: IPlayer;
			switch (updateBy) {
				case UpdatePlayerRegistrationDetailsByEnum.PHONENUMBER:
					updatedPlayer =
						await this.playerDao.updatePlayerRegistrationDetailsByPhoneNumber(
							data.phoneNumber,
							update,
						);
					break;
				case UpdatePlayerRegistrationDetailsByEnum.EMAIL:
					updatedPlayer =
						await this.playerDao.updatePlayerRegistrationDetailsByEmail(
							data.email,
							update,
						);
					break;
				case UpdatePlayerRegistrationDetailsByEnum.ID:
					updatedPlayer =
						await this.playerDao.updatePlayerRegistrationDetailsById(
							data._id,
							update,
						);
					break;
				default:
					return null; // Return null for unrecognized updateBy value
			}

			// Return success response with updated player details
			return new Response<IPlayer>(
				ResponseCodes.PLAYER_REGISTRATION_DETAILS_UPDATE_SUCCESS.code,
				ResponseCodes.PLAYER_REGISTRATION_DETAILS_UPDATE_SUCCESS.message,
				updatedPlayer,
			);
		} catch (err) {
			// Log and rethrow any errors
			this.logger.error('🔥 error: ' + err?.message);
			throw err;
		}
	}

	public async getRecentTransactionRequests(
		player: IPlayer,
	): Promise<Response<{ requests: IPaymentRequestLog[] }>> {
		try {
			const paymentRequests =
				await this.paymentRequestDao.getPaymentRequestsByPlayerId(
					player._id,
				);

			return new Response<{ requests: IPaymentRequestLog[] }>(
				ResponseCodes.PLAYER_PAYMENT_REQUESTS_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.PLAYER_PAYMENT_REQUESTS_FETCHED_SUCCESSFULLY.message,
				{ requests: paymentRequests },
			);
		} catch (error) {
			// If an error occurs during the update operation, rethrow the error
			throw error;
		}
	}

	public async getPrimaryBank(player: IPlayer): Promise<Response> {
		try {
			const primaryBank = await this.playerDao.getPrimaryBank(player);

			return new Response(
				ResponseCodes.PLAYER_BANK_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.PLAYER_BANK_FETCHED_SUCCESSFULLY.message,
				primaryBank,
			);
		} catch (error) {
			throw error;
		}
	}
}

export { PlayerService };
