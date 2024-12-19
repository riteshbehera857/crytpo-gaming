import { Model, Schema } from 'mongoose';
import { TransactionEnum } from '../types/transaction';
import { CurrencyEnum } from '../types/currency';
import { TransactionStatusEnum } from '../types/transactionStatus';
import { WithdrawalStatus, WithdrawalTypeEnum } from '../types/withdrawal';

interface IPaymentWithdrawalRequestLog {
	_id: Schema.Types.ObjectId;
	user: Schema.Types.ObjectId;
	referenceId: string;
	skinId?: string;
	openingBalance: number;
	closingBalance: number;
	requestData: {
		userId?: string;
		// currency?: CurrencyEnum;
		customerName?: string;
		mobileNumber?: number;
		amount?: number;
		email?: string;
		bankDetail?: {
			accountNumber?: string;
			accountName?: string;
			bankName?: string;
			ifscCode?: string;
			bankBranch?: string;
		};
		// selection?: string;
		// city?: string;
		// state?: string;
		// country?: string;
		// zipCode?: number;
	};
	isPending: boolean;
	transactionId?: string;
	type: WithdrawalTypeEnum;
	requestedAt: Date;
	approved: {
		by: Schema.Types.ObjectId;
		date: Date;
	};
	rejected: {
		by: Schema.Types.ObjectId;
		date: Date;
		reason: string;
	};
	settled: {
		by: Schema.Types.ObjectId;
		date: Date;
		transactionId: string;
	};
	status: WithdrawalStatus;
	createdAt: Date;
}

interface PaymentWithdrawalRequestLogQueryHelpers {}

interface IPaymentWithdrawalRequestLogModel
	extends Model<
		IPaymentWithdrawalRequestLog,
		PaymentWithdrawalRequestLogQueryHelpers
	> {}

export {
	IPaymentWithdrawalRequestLog,
	PaymentWithdrawalRequestLogQueryHelpers,
	IPaymentWithdrawalRequestLogModel,
};
