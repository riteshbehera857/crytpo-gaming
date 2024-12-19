import { Model } from 'mongoose';
import {
	IPaymentWithdrawalRequestLog,
	IPaymentWithdrawalRequestLogModel,
} from '../../common/interfaces/paymentWithdrawalRequestLog.interface';
import PaymentWithdrawalRequestLog from '../models/paymentWithdrawalRequestLog.model';

class PaymentWithdrawalRequestLogDao {
	private paymentWithdrawalRequestModel: Model<IPaymentWithdrawalRequestLog>;

	constructor() {
		this.paymentWithdrawalRequestModel = PaymentWithdrawalRequestLog;
	}

	public async createPaymentWithdrawalRequestLog(
		data: Partial<IPaymentWithdrawalRequestLog>,
	): Promise<IPaymentWithdrawalRequestLog> {
		const paymentWithdrawalRequestLog =
			await this.paymentWithdrawalRequestModel.create(data);

		return paymentWithdrawalRequestLog;
	}
}

export { PaymentWithdrawalRequestLogDao };
