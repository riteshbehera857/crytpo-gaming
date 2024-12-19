import { Model, Schema } from 'mongoose';
import { TransactionStatusEnum } from '../types/transactionStatus';
import { CurrencyEnum } from '../types/currency';

interface IPaymentWithdrawal {
	_id?: Schema.Types.ObjectId;
	paymentGateway: string;
	note: string;
	userId: Schema.Types.ObjectId;
	status: TransactionStatusEnum;
	currency?: CurrencyEnum;
	amount: number;
	transactionType: string;
	accountDetail: {
		accountNo: string;
		ifsc: string;
		bankName: string;
	};
	responseId: string;
	requestId: string;
	deletedAt: Date;
	amountWithCommission: number;
	createdAt: Date;
	updatedAt: Date;
}

interface PaymentWithdrawalQueryHelpers {}

interface IWithdrawalModel
	extends Model<IPaymentWithdrawal, PaymentWithdrawalQueryHelpers> {}
export { IPaymentWithdrawal, PaymentWithdrawalQueryHelpers, IWithdrawalModel };
