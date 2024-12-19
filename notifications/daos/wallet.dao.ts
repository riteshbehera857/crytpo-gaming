import { Model } from 'mongoose';
import {
	ITransaction,
	ITransactionDetailsForPayments,
} from '../../common/interfaces/transaction.interface';
import Transaction from '../../payment/models/transaction.model';

class WalletDao {
	private transactionModel: Model<ITransaction>;

	constructor() {
		this.transactionModel = Transaction;
	}

	public async createBonusTransaction(
		transactionData: Partial<ITransaction<ITransactionDetailsForPayments>>,
	): Promise<ITransaction> {
		const bonusTransaction =
			await this.transactionModel.create(transactionData);
		return bonusTransaction;
	}
}

export { WalletDao };
