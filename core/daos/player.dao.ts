import { ObjectId } from 'mongodb';
import {
	FilterQuery,
	Model,
	MongooseUpdateQueryOptions,
	QueryOptions,
	Schema,
	UpdateQuery,
} from 'mongoose';
import { AuthSource } from '../../common/config/constants';
import { IPlayer } from '../../common/interfaces/player.interface';
import Player from '../models/player.model';
import { ICampaign } from '../../common/interfaces/campaign.interface';
import UserSessionLog from '../models/userSessionLog.model';
import { IUserSessionLog } from '../../common/interfaces/userSessionLog.interface';

class PlayerDao {
	private playerModel: Model<IPlayer>;

	constructor() {
		this.playerModel = Player;
	}

	public async getPlayerById(id: string) {
		const player = await this.playerModel.findById(id);

		return player;
	}

	public async getPlayerByPhoneNumber(phoneNumber: string): Promise<IPlayer> {
		const player = await this.playerModel
			.findOne({ phoneNumber })
			.select('+otp.value +otp.createdAt +otp.validatedAt +otp.isValidated');

		return player;
	}

	public async createPlayerWithPhoneNumberAndOtp(
		phoneNumber: string,
		otp: IPlayer['otp'],
		campaign: any,
	): Promise<IPlayer> {
		let player = null;

		console.log('---------------------------------');
		console.log('Campaign', campaign);
		console.log('---------------------------------');

		if (campaign) {
			player = this.playerModel.create({
				phoneNumber: phoneNumber,
				otp,
				campaignId: campaign._id,
				channelId: campaign.channel,
				affiliateId: campaign.createdBy ?? campaign.affiliateId,
			});
		} else {
			player = this.playerModel.create({
				phoneNumber: phoneNumber,
				otp,
			});
		}

		return player;
	}

	/**
	 * Creates a new player for users who registered using social authentication like facebook, google or truecaller etc.
	 * If the email or socialProviderId is not provided, they will default to empty strings.
	 * The method does not check for existing players to allow duplicate entries.
	 * 
	 * @param {IPlayer['profileDetailsFromSocialProvider']} profileInfo - The profile information retrieved from the social provider,
	 * which includes details like name, email, and social provider ID.
	 * @param {AuthSource.GOOGLE | AuthSource.FACEBOOK} socialProvider - The social provider through which the user is registering.
	 * @param {any} [campaign] - Optional campaign information related to the registration.
	 * @returns {Promise<IPlayer>} A promise that resolves to the newly created player object.
	 * 
	 */
	public async createPlayerWithSocialAuth(
		profileInfo: IPlayer['profileDetailsFromSocialProvider'],
		socialProvider: AuthSource.GOOGLE | AuthSource.FACEBOOK,
		campaign?: any
	): Promise<IPlayer> {
		const {
			email = "", // Set default value to an empty string if not provided
			id: socialProviderId = "", 
			// Extract the 'id' property from profileInfo and assign it to socialProviderId.
			// If 'id' is not present in profileInfo (i.e., undefined), set socialProviderId to an empty string ("") as a default value.
			name
		} = profileInfo;

		
		const playerData = {
			profileDetailsFromSocialProvider: profileInfo,
			source: socialProvider,
			email: email,
			socialProviderId: socialProviderId, // Unique ID from the social provider, will be an empty string if not provided
			name: name, 
		};

		// Include campaign data if provided
		if (campaign) {
			playerData['campaignId'] = campaign._id;
			playerData['channelId'] = campaign.channel;
			playerData['affiliateId'] = campaign.createdBy ?? campaign.affiliateId;
		}
		
		const newPlayer = await this.playerModel.create(playerData);
		return newPlayer;
	}

	public async findPlayerByPhoneNumberAndUpdateOtp(
		phoneNumber: string,
		otp: IPlayer['otp'],
	): Promise<IPlayer> {
		const player = await this.findOneAndUpdate(
			{ phoneNumber },
			{
				otp,
				lastLoginDate: new Date(),
			},
			{
				new: true,
			},
		);

		return player;
	}

	public async findOneAndUpdate(
		query: FilterQuery<IPlayer>,
		data: UpdateQuery<IPlayer>,
		options: QueryOptions<IPlayer>,
	): Promise<IPlayer> {
		const updatedPlayer = await this.playerModel.findOneAndUpdate(
			query,
			data,
			options,
		);

		return updatedPlayer;
	}

	public async updatePlayerRegistrationDetailsById(
		id: Schema.Types.ObjectId,
		data: Partial<IPlayer>,
	): Promise<IPlayer> {
		const updatedPlayer = await this.findOneAndUpdate({ _id: id }, data, {
			new: true,
		});

		return updatedPlayer;
	}

	public async updatePlayerRegistrationDetailsByPhoneNumber(
		phoneNumber: string,
		data: Partial<IPlayer>,
	): Promise<IPlayer> {
		const updatedPlayer = await this.findOneAndUpdate(
			{ phoneNumber },
			data,
			{},
		);

		return updatedPlayer;
	}

	public async updatePlayerRegistrationDetailsByEmail(
		email: string,
		data: Partial<IPlayer>,
	): Promise<IPlayer> {
		const updatedPlayer = await this.findOneAndUpdate({ email }, data, {
			new: true,
		});

		return updatedPlayer;
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

	public async getCurrentLoggedInUsers(): Promise<IUserSessionLog[]> {
		try {
			return await UserSessionLog.aggregate([
				{
					$match: {
						logoutTime: null,
					},
				},
				{
					$lookup: {
						from: 'players',
						localField: 'phoneNumber',
						foreignField: 'phoneNumber',
						as: 'playerInfo',
					},
				},
				{
					$unwind: {
						path: '$playerInfo',
						preserveNullAndEmptyArrays: false, // Make sure to filter out documents without playerInfo
					},
				},
				{
					$project: {
						_id: 0,
						phoneNumber: 1,
						loginTime: 1,
						'playerInfo._id': 1, // The player _id field
					},
				},
			]);
		} catch (error) {
			console.error('Error fetching current logged-in users:', error);
			throw error;
		}
	}

	public async getPrimaryBank(player: IPlayer): Promise<Record<string, any>> {
		try {
			const foundPlayer = await this.playerModel.findById(player._id);

			const primaryBank = foundPlayer.bankDetails.find(
				(bank) => bank.isPrimary,
			);

			return primaryBank;
		} catch (error) {
			console.error('Error fetching primary bank:', error);
			throw error;
		}
	}
}

export { PlayerDao };
