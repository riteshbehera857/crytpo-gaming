import { Service } from 'typedi';
import { WalletDao } from '../daos/wallet.dao';
import {
	ITransaction,
	ITransactionDetailsForPayments,
} from '../../common/interfaces/transaction.interface';

@Service()
class WalletService {
	private walletDao: WalletDao;

	constructor() {
		this.walletDao = new WalletDao();
	}

	public async createBonusTransaction(
		transactionData: Partial<ITransaction<ITransactionDetailsForPayments>>,
	): Promise<ITransaction> {
		return await this.walletDao.createBonusTransaction(transactionData);
	}
}

export { WalletService };
