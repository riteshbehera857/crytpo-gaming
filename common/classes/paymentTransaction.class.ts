import { Schema } from 'mongoose';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnumPayment } from '../types/transaction';
import {
	IAccountDetail,
	IPaymentTransaction,
} from '../interfaces/paymentTransaction.interface';

class PaymentTransaction implements IPaymentTransaction {
	_id?: Schema.Types.ObjectId;
	paymentGateway: string;
	note: string;
	userId: Schema.Types.ObjectId;
	status: any;
	currency?: CurrencyEnum;
	amount: number;
	transactionType: TransactionEnumPayment;
	accountDetail: IAccountDetail;
	responseId: string;
	requestId: string;
	deletedAt: Date;
	amountWithCommission: number;
	createdAt: Date;
	updatedAt: Date;

	constructor(data: Partial<IPaymentTransaction>) {
		this.paymentGateway = data.paymentGateway;
		this.note = data.note;
		this.userId = data.userId;
		this.status = data.status;
		this.currency = data?.currency;
		this.amount = data.amount;
		this.transactionType = data.transactionType;
		this.accountDetail = data.accountDetail;
		this.responseId = data.responseId;
		this.requestId = data.requestId;
		this.deletedAt = data.deletedAt;
		this.amountWithCommission = data.amountWithCommission;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
	}
}

export { PaymentTransaction };
