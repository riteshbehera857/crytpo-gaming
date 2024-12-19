import { IPaymentWithdrawal } from '../interfaces/paymentWithdrawal';
import { CurrencyEnum } from '../types/currency';
import { Schema } from 'mongoose';
import { TransactionStatusEnum } from '../types/transactionStatus';

class PaymentWithdrawal implements IPaymentWithdrawal {
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

	constructor(transactionData: Partial<IPaymentWithdrawal>) {
		this._id = transactionData._id;
		this.paymentGateway = transactionData.paymentGateway;
		this.note = transactionData.note;
		this.userId = transactionData.userId;
		this.status = transactionData.status;
		this.currency = transactionData?.currency;
		this.amount = transactionData.amount;
		this.transactionType = transactionData.transactionType;
		this.accountDetail = transactionData.accountDetail;
		this.responseId = transactionData.responseId;
		this.requestId = transactionData.requestId;
		this.deletedAt = transactionData.deletedAt;
		this.amountWithCommission = transactionData.amountWithCommission;
		this.createdAt = transactionData.createdAt;
		this.updatedAt = transactionData.updatedAt;
	}
}

export { PaymentWithdrawal };
