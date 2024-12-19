import { Schema } from 'mongoose';
import { IPaymentRequestLog } from '../interfaces/paymentRequestLog.interface';
import { TransactionEnum } from '../types/transaction';
import { CurrencyEnum } from '../types/currency';
import { TransactionStatusEnum } from '../types/transactionStatus';

class PaymentRequestLog implements IPaymentRequestLog {
	_id: Schema.Types.ObjectId;
	user: Schema.Types.ObjectId;
	requestType: TransactionEnum;
	referenceId: string;
	skinId?: string;
	requestData: {
		userId: string;
		currency: CurrencyEnum;
		customerName: string;
		mobileNumber: number;
		amount: number;
		email: string;
		selection: string;
		city: string;
		state: string;
		country: string;
		zipCode: number;
	};
	requestedAt: Date;
	isPending: boolean;
	transactionInitiatedAt: Date;
	transactionCompletedAt: Date;
	transactionId: string;
	status: TransactionStatusEnum;
	reasonOfFailure: { errorCode: string; errorName: string; errorDesc: string };

	constructor(data: Partial<IPaymentRequestLog>) {
		this.user = data.user;
		this.requestType = data.requestType;
		this.referenceId = data.referenceId;
		this.requestData.userId = data.requestData.userId;
		this.requestData.currency = data.requestData.currency;
		this.requestData.customerName = data.requestData.customerName;
		this.requestData.mobileNumber = data.requestData.mobileNumber;
		this.requestData.amount = data.requestData.amount;
		this.requestData.email = data.requestData.email;
		this.requestData.selection = data.requestData.selection;
		this.requestData.city = data.requestData.city;
		this.requestData.state = data.requestData.state;
		this.requestData.country = data.requestData.country;
		this.requestData.zipCode = data.requestData.zipCode;
		this.requestedAt = data.requestedAt;
		this.skinId = 'crashncash';
		this.isPending = data.isPending;
		this.transactionInitiatedAt = data.transactionInitiatedAt;
		this.transactionCompletedAt = data.transactionCompletedAt;
		this.transactionId = data.transactionId;
		this.status = data.status;
		this.reasonOfFailure = data.reasonOfFailure;
	}
}

export { PaymentRequestLog };
