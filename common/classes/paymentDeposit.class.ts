import { Schema } from 'mongoose';
import { IPaymentDeposit } from '../interfaces/paymentDeposit.interface';
import { TransactionStatusEnum } from '../types/transactionStatus';
import { CurrencyEnum } from '../types/currency';

class PaymentDeposit implements IPaymentDeposit {
	_id?: Schema.Types.ObjectId;
	paymentGateway: string;
	note: string;
	userId: Schema.Types.ObjectId;
	status: TransactionStatusEnum;
	currency: CurrencyEnum;
	walletAddress: string
	amount: number;
	transactionType: string;
	responseId: string;
	requestId: string;
	deletedAt: Date;
	amountWithCommission: number;
	createdAt: Date;
	updatedAt: Date;

	constructor(data: Partial<IPaymentDeposit>) {
		this.paymentGateway = data.paymentGateway;
		this.note = data.note;
		this.userId = data.userId;
		this.currency = data.currency;
		this.deletedAt = data.deletedAt;
		this.amount = data.amount;
		this.transactionType = data.transactionType;
		this.responseId = data.responseId;
		this.requestId = data.requestId;
		this.status = data.status;
		this.amountWithCommission = data.amountWithCommission;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
		this.walletAddress = data.walletAddress
	}
}

export { PaymentDeposit };
