import { Schema } from 'mongoose';
import { TransactionEnum } from '../types/transaction';

interface PaymentDetails {
	userId: Schema.Types.ObjectId;
	currency?: string;
	customerName: string;
	mobileNumber: string;
	amount: number;
	transactionType: TransactionEnum;
	accountDetail?: {
		accountNo: string;
		ifsc: string;
		bankName: string;
	};
	email: string;
	selection: string;
	city: string;
	state: string;
	country: string;
	zipCode: string;
	bonusCode: string;
}

class PaymentDetailsClass implements PaymentDetails {
	userId: Schema.Types.ObjectId;
	currency: string;
	customerName: string;
	mobileNumber: string;
	amount: number;
	transactionType: TransactionEnum;
	accountDetail?: {
		accountNo: string;
		ifsc: string;
		bankName: string;
	};
	email: string;
	selection: string;
	city: string;
	state: string;
	country: string;
	zipCode: string;
	bonusCode: string;

	constructor(data: Partial<PaymentDetails>) {
		this.userId = data.userId;
		this.currency = data.currency;
		this.customerName = data.customerName;
		this.mobileNumber = data.mobileNumber;
		this.amount = data.amount;
		this.currency = data?.currency;
		this.accountDetail = data.accountDetail;
		this.email = data.email;
		this.selection = data.selection;
		this.city = data.city;
		this.state = data.state;
		this.country = data.country;
		this.zipCode = data.zipCode;
		this.transactionType = data.transactionType;
		this.bonusCode = data.bonusCode;
	}
}

export { PaymentDetailsClass };
