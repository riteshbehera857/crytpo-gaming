import { Model, Schema } from 'mongoose';
import { TransactionEnum } from '../types/transaction';
import { CurrencyEnum } from '../types/currency';
import { TransactionStatusEnum } from '../types/transactionStatus';

interface IPaymentRequestLog {
	_id: Schema.Types.ObjectId;
	user: Schema.Types.ObjectId;
	requestType: TransactionEnum;
	referenceId: string;
	skinId?: string;
	requestData: {
		userId?: string;
		currency?: CurrencyEnum;
		customerName?: string;
		mobileNumber?: number;
		amount?: number;
		email?: string;
		selection?: string;
		city?: string;
		state?: string;
		country?: string;
		zipCode?: number;
	};
	requestedAt: Date;
	isPending: boolean;
	transactionInitiatedAt: Date;
	transactionCompletedAt: Date;
	transactionId: string;
	status: TransactionStatusEnum;
	reasonOfFailure: {
		errorCode: string;
		errorName: string;
		errorDesc: string;
	};
}

interface PaymentRequestLogQueryHelpers {}

interface IPaymentRequestLogModel
	extends Model<IPaymentRequestLog, PaymentRequestLogQueryHelpers> {}

export {
	IPaymentRequestLog,
	PaymentRequestLogQueryHelpers,
	IPaymentRequestLogModel,
};
