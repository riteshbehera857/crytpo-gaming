import { dummyGamesUrl } from './../../common/config/constants';
import Container, { Service } from 'typedi';
import { Logger } from 'winston';
import { CasinoService } from './casino.service';
import getLogger from '../../common/logger';
import config from '../../common/config';
import { Response } from './../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import axios from 'axios';
import { JwtService } from './jwt.service';

@Service()
class GameService {
	private logger: Logger;
	private casinoService: CasinoService;
	private jwtService: JwtService;

	constructor() {
		this.logger = getLogger(module);
		this.casinoService = Container.get(CasinoService);
		this.jwtService = Container.get(JwtService);
	}

	/**
	 * Fetches the list of games available in the casino.
	 * @returns A Promise that resolves to a Response object containing the fetched list of games.
	 * @throws Throws an error if an error occurs during the fetch process.
	 */
	public async getGamesList(): Promise<Response> {
		try {
			// Generate a signature for the casino service using the operator from the configuration
			const casinoSignature = this.casinoService.generateSignature({
				operator: config.operator,
			});

			// Prepare data to be sent in the request body
			const fetchGameListData = {
				operator: config.operator,
			};

			// Send a POST request to fetch the list of games
			const gamesList = await axios.post(
				config.rgs.gameListUrl, // Endpoint URL
				fetchGameListData, // Request body data
				{
					headers: {
						'Casino-Signature': casinoSignature, // Include casino signature in the request headers
					},
				},
			);

			// Return a Response object with the fetched list of games
			return new Response(
				ResponseCodes.GAMES_FETCHED_SUCCESSFULLY.code, // Response code
				ResponseCodes.GAMES_FETCHED_SUCCESSFULLY.message, // Response message
				{ games: gamesList.data.games }, // Additional data containing the fetched list of games
			);
		} catch (error) {
			// If an error occurs during the fetch process, rethrow the error
			throw error;
		}
	}

	/**
	 * Fetches the launch URL for a game based on the provided game ID and token.
	 * @param data An object containing the game ID and token.
	 * @returns A Promise that resolves to a Response object containing the fetched launch URL.
	 * @throws Throws an error if an error occurs during the fetch process.
	 */
	public async getLaunchUrl(data: {
		gameId: string;
		token: string;
	}): Promise<Response> {
		try {
			// Extract gameId and token from the data object
			const { gameId, token } = data;

			// Decode the token to retrieve the playerId
			const { playerId } = this.jwtService.decodeToken(data.token);

			this.logger.debug(`Generating casino signature---`);
			// Generate a signature for the casino service using playerId, gameId, and token
			const casinoSignature = this.casinoService.generateSignature({
				userId: playerId,
				gameId,
				token,
			});
			this.logger.debug(`Generated casino signature---`);

			// Prepare data to be sent in the request body
			const fetchLaunchUrlData = {
				userId: playerId,
				gameId,
				token,
			};

			this.logger.debug(`Requesting gameLaunchUrl---`);
			// Send a POST request to fetch the launch URL
			const launchUrl = await axios.post(
				config.rgs.gameLaunchUrl, // Endpoint URL
				fetchLaunchUrlData, // Request body data
				{
					headers: {
						'Casino-Signature': casinoSignature, // Include casino signature in the request headers
					},
				},
			);

			this.logger.debug(`Got the LaunchUrl--- ${launchUrl.data.link}`);

			// Return a Response object with the fetched launch URL
			return new Response(
				ResponseCodes.GAME_LAUNCH_URL_FETCHED_SUCCESSFULLY.code, // Response code
				ResponseCodes.GAME_LAUNCH_URL_FETCHED_SUCCESSFULLY.message, // Response message
				{ link: launchUrl.data.link }, // Additional data containing the fetched launch URL
			);
		} catch (error) {
			// If an error occurs during the fetch process, rethrow the error
			throw error;
		}
	}
}

export { GameService };
