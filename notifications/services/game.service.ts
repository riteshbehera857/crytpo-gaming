import { Service } from 'typedi';
import { TransactionDao } from '../../payment/daos/transactionDao';
import { Schema } from 'mongoose';

@Service()
class GameService {
	private transactionDao: TransactionDao;

	constructor() {
		this.transactionDao = new TransactionDao();
	}

	public async getGameCountAfter(
		eligibleTimestamp: number,
		userId: string,
	): Promise<number> {
		const userGamingTransactions =
			await this.transactionDao.getUserGamingTransactions({
				userId: userId as unknown as Schema.Types.ObjectId,
				sDate: eligibleTimestamp,
			});

		return userGamingTransactions.length ?? 0;
	}

	public async getGameCountAfterIn(
		eligibleTimestamp: number,
		userId: string,
		games: string[],
	): Promise<number> {
		const userGamingTransactions =
			await this.transactionDao.getUserGamingTransactions({
				userId: userId as unknown as Schema.Types.ObjectId,
				sDate: eligibleTimestamp,
				games: games,
			});

		return userGamingTransactions.length ?? 0;
	}
}

export { GameService };
