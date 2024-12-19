import { Model } from 'mongoose';
import Player from '../models/player.model';
import { PlayerRegisterDetailsType } from '../../common/types/register';
import { IPlayer } from '../../common/interfaces/player.interface';

class AuthDao {
	private playerModel: Model<IPlayer>;

	constructor() {
		this.playerModel = Player;
	}

	public async register(player: PlayerRegisterDetailsType): Promise<IPlayer> {
		const newPlayer = await this.playerModel.create({
			...player,
		});

		return newPlayer;
	}

	public async ifPlayerExistsOrNot(
		player: Partial<IPlayer>,
	): Promise<IPlayer> {
		const playerExists = await this.playerModel
			.findOne({
				email: player.email,
			})
			.select('+password');

		return playerExists;
	}
	// public async login(player: Partial<PlayerType>) {
	// 	const playerFound = await this.playerModel
	// 		.findOne({
	// 			email: player.email.toLowerCase(),
	// 			source: AuthSource.EMAIL,
	// 		})
	// 		.select('password');

	// 	// Check if the provided password is valid
	// 	const validPassword = await this.compareHash(
	// 		playerFound.password,
	// 		player.password,
	// 	);

	// 	if (validPassword) {
	// 		// Log, and generate a JWT token for the authenticated player
	// 		this.logger.debug('Password is valid!');
	// 		this.logger.debug('Generating JWT');
	// 		const authToken = this.generateToken({
	// 			email: player.email,
	// 			playerId: player.id,
	// 		});
	// 		return { authToken };
	// 	} else {
	// 		throw new ApiError(
	// 			'Invalid username or password.',
	// 			400,
	// 			CoreErrors.CORE102,
	// 		);
	// 	}
	// }
}

export { AuthDao };
