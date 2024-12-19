import { Schema } from 'mongoose';
import { IPaymentWithdrawalRequestLog } from '../interfaces/paymentWithdrawalRequestLog.interface';
import { TransactionStatusEnum } from '../types/transactionStatus';
import { WithdrawalStatus, WithdrawalTypeEnum } from '../types/withdrawal';

class PaymentWithdrawalRequestLogClass implements IPaymentWithdrawalRequestLog {
	_id: Schema.Types.ObjectId;
	requestData: {
		userId?: string;
		customerName?: string;
		mobileNumber?: number;
		amount?: number;
		email?: string;
		bankDetail?: {
			accountNumber?: string;
			accountName?: string;
			bankName?: string;
			ifscCode?: string;
			branchName?: string;
		};
	};
	openingBalance: number;
	closingBalance: number;
	type: WithdrawalTypeEnum;
	requestedAt: Date;
	skinId?: string;
	status: WithdrawalStatus;
	approved: { by: Schema.Types.ObjectId; date: Date };
	rejected: { by: Schema.Types.ObjectId; date: Date; reason: string };
	settled: { by: Schema.Types.ObjectId; date: Date; transactionId: string };
	user: Schema.Types.ObjectId;
	createdAt: Date;
	isPending: boolean;
	referenceId: string;
	transactionId?: string;

	constructor(data: Partial<IPaymentWithdrawalRequestLog>) {
		this.user = data.user;
		// this.requestType = data.requestType;
		this.referenceId = data.referenceId;
		this.requestData.userId = data.requestData.userId;
		// this.requestData.currency = data.requestData.currency;
		this.requestData.customerName = data.requestData.customerName;
		this.requestData.mobileNumber = data.requestData.mobileNumber;
		this.requestData.amount = data.requestData.amount;
		this.requestData.email = data.requestData.email;
		// this.requestData.selection = data.requestData.selection;
		// this.requestData.city = data.requestData.city;
		// this.requestData.state = data.requestData.state;
		// this.requestData.country = data.requestData.country;
		// this.requestData.zipCode = data.requestData.zipCode;
		this.requestedAt = data.requestedAt;
		this.skinId = 'crashncash';
		this.rejected = data.rejected;
		this.approved = data.approved;
		this.settled = data.settled;
		this.type = data.type;
		this.transactionId = data.transactionId;
		this.status = data.status;
		this.createdAt = data.createdAt;
		this.isPending = data.isPending;
		this.openingBalance = data.openingBalance;
		this.closingBalance = data.closingBalance;
		// this.reasonOfFailure = data.reasonOfFailure;
	}
}

export { PaymentWithdrawalRequestLogClass };
