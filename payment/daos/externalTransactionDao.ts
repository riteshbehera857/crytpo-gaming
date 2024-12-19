import { Model } from 'mongoose';
import ExternalTransaction from '../models/externalTransaction.model';
import { IExternalTransaction } from '../../common/interfaces/externalTransaction.interface';

class ExternalTransactionDao {
	private static externalTransactionModel: Model<IExternalTransaction> =
		ExternalTransaction;

	public static async createExternalTransaction(
		transaction: Partial<IExternalTransaction>,
	): Promise<IExternalTransaction> {
		const externalTransaction =
			await this.externalTransactionModel.create(transaction);

		return externalTransaction;
	}

	public static async getTransactionByOrderId(
		orderId: string,
	): Promise<IExternalTransaction> {
		const transaction = await this.externalTransactionModel.findOne({
			'details.orderId': orderId,
		});

		return transaction;
	}
}

export { ExternalTransactionDao };
