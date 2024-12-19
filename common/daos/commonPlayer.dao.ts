import mongoose, {
	FilterQuery,
	Model,
	Mongoose,
	QueryOptions,
	Schema,
	UpdateQuery,
} from 'mongoose';
import { IPlayer } from '../interfaces/player.interface';
import Player from '../../core/models/player.model';

class CommonPlayerDao {
	private playerModel: Model<IPlayer>;

	constructor() {
		this.playerModel = Player;
	}

	/**
	 * Retrieves a player by their ID from the database.
	 * @param id The ID of the player to retrieve.
	 * @returns A Promise resolving to the player data if found, or undefined if not found.
	 */
	public async getPlayerById(id: any): Promise<IPlayer> {
		const user = await this.playerModel.aggregate<IPlayer>([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(id),
				},
			},
			{
				$addFields: {
					currentBalance: {
						$add: [
							'$balance.depositBalance',
							'$balance.withdrawalBalance',
							'$balance.bonusBalance.unlocked',
						],
					},
				},
			},
			{
				$project: {
					_id: 1,
					name: 1,
					email: 1,
					phoneNumber: 1,
					skinId: 1,
					city: 1,
					state: 1,
					country: 1,
					zipCode: 1,
					addressLine1: 1,
					addressLine2: 1,
					bankDetails: 1,
					tags: 1,
					currentBalance: 1,
					balance: 1,
				},
			},
		]);

		return user[0];
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

	public async updateUserBalanceAfterWithdrawalRequest(
		id: Schema.Types.ObjectId,
		withdrawalAmount: number,
	): Promise<IPlayer> {
		const updatedUser = await this.findOneAndUpdate(
			{ _id: id },
			{
				$inc: {
					'balance.withdrawalBalance': -withdrawalAmount,
				},
			},
			{},
		);

		return updatedUser;
	}

	public async updateUserBalanceAfterBonusTransaction(
		id: Schema.Types.ObjectId,
		bonusAmount: number,
		releaseType: 'locked' | 'unlocked',
	): Promise<IPlayer> {
		const updatedUser = await this.findOneAndUpdate(
			{ _id: id },
			{
				$inc: {
					[`balance.bonusBalance.${releaseType}`]: bonusAmount,
				},
			},
			{},
		);

		return updatedUser;
	}

	public async updateUserBalanceAfterLockedBonusTransaction(
		id: Schema.Types.ObjectId,
		bonusAmount: number,
	): Promise<IPlayer> {
		const updatedUser = await this.findOneAndUpdate(
			{ _id: id },
			{
				$inc: {
					[`balance.bonusBalance.locked`]: -bonusAmount,
					[`balance.bonusBalance.unlocked`]: bonusAmount,
				},
			},
			{},
		);

		return updatedUser;
	}

	public async updateUserBalanceAfterBetTransaction(
		id: Schema.Types.ObjectId,
		amount: number,
		releaseType: 'locked' | 'unlocked',
	): Promise<IPlayer> {
		const updatedUser = await this.findOneAndUpdate(
			{ _id: id },
			{
				$inc: {
					[`balance.bonusBalance.${releaseType}`]: -amount,
				},
			},
			{},
		);

		return updatedUser;
	}

	public async getPlayerBalance(
		id: string,
	): Promise<Pick<IPlayer, 'balance'>> {
		const playerBalance = await this.playerModel.findOne(
			{ _id: id },
			{ balance: 1 },
		);

		return playerBalance;
	}
}

export { CommonPlayerDao };
