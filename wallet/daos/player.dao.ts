import { FilterQuery, Model, MongooseUpdateQueryOptions } from 'mongoose';
import { IPlayer } from '../../common/interfaces/player.interface';
import Player from '../../core/models/player.model';
import { ITransaction } from '../../common/interfaces/transaction.interface';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IRule } from '../../common/interfaces/rule.interface';

class PlayerDao {
	private playerModel: Model<IPlayer>;
	private commonPlayerDao: CommonPlayerDao;

	constructor() {
		this.playerModel = Player;
		this.commonPlayerDao = new CommonPlayerDao();
	}

	public async getPlayerById(id: string): Promise<IPlayer> {
		const user = await this.playerModel.findById(id);

		return user;
	}

	public async updatePlayerBalance(
		player: IPlayer,
		transaction: Partial<ITransaction<any> & ITransaction['details']>,
		balanceType: 'withdrawalBalance' | 'depositBalance',
	): Promise<IPlayer> {
		console.log('transaction', transaction);
		return await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player._id },
			{ $inc: { [`balance.${balanceType}`]: transaction.amount } },
			{
				new: true,
			},
		);
	}
	public async updatePlayerDepositORWithdrawalBalanceAfterBet(
		player: IPlayer,
		amount: number,
		balanceType: 'depositBalance' | 'withdrawalBalance',
	): Promise<IPlayer> {
		console.log('++++++++++++++++++++++++++++++++++++');
		console.log({ player, amount, balanceType });
		console.log('++++++++++++++++++++++++++++++++++++');

		return await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player._id },
			{ $inc: { [`balance.${balanceType}`]: -amount } },
			{},
		);
	}

	public async updatePlayerWithdrawalBalance(
		player: IPlayer,
		transaction: Partial<ITransaction<any> & ITransaction['details']>,
	) {
		await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player._id },
			{
				$inc: {
					'balance.withdrawalBalance': -transaction.amount,
				},
			},
			{
				new: true,
			},
		);
	}

	public async updatePlayerWithdrawalBalanceAfterWin(
		player: IPlayer,
		transaction: Partial<ITransaction<any> & ITransaction['details']>,
	) {
		await this.commonPlayerDao.findOneAndUpdate(
			{ _id: player._id },
			{
				$inc: {
					'balance.withdrawalBalance': transaction.amount,
				},
			},
			{
				new: true,
			},
		);
	}

	// public async updatePlayerWithdrawalBalance(
	// 	player: IPlayer,
	// 	rule: IRule,
	// ): Promise<IPlayer> {
	// 	return await this.commonPlayerDao.findOneAndUpdate(
	// 		{ _id: player._id },
	// 		{
	// 			$inc: {
	// 				'balance.withdrawalBalance': rule.amount,
	// 			},
	// 		},
	// 		{
	// 			new: true,
	// 		},
	// 	);
	// }
	public async findOneAndUpdate(
		query: MongooseUpdateQueryOptions,
		data: any,
		options: any,
	) {
		const updatedPlayer = await this.playerModel.findOneAndUpdate(
			query,
			data,
			options,
		);

		return updatedPlayer;
	}
}

export { PlayerDao };
