import { Schema, Document, Model } from 'mongoose';
import { TransactionEnum } from '../types/transaction';

// interface PaymentDetails {
//     userId: Schema.Types.ObjectId;
//     customerName: string;
//     mobileNumber: string;
//     amount: number;
//     emailId: string;
//     city: string;
//     state: string;
//     country: string;
//     zipCode: string;
// }

interface PaymentObject {
	[key: string]: string;
	order_id: string;
	amount: string;
	currency: string;
	description: string;
	name: string;
	email: string;
	show_convenience_fee?: string;
	udf1: string;
	phone: string;
	city: string;
	state: string;
	country: string;
	zip_code: string;
}

interface PaymentRequestUrlType {
	userId: Schema.Types.ObjectId;
	amount: number;
	emailId: string;
	customerName: string;
	mobileNumber: string;
	referenceId: string;
	returnUrl: string;
	dataUrl: string;
}

interface TransactionDetails {
	upiId: string;
	amount: number;
	customerName: string;
	custRefNo: string;
	orderId: string;
	userId: string;
	transactionId: string;
	txnStatus: string;
	txnTime: string;
}

interface IPaymentResponseLog extends Document {
	userId: Schema.Types.ObjectId;
	responseType: string;
	referenceId: string;
	responseData: any;
	createdBy: Schema.Types.ObjectId;
	updatedBy: Schema.Types.ObjectId;
	deletedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}
type Priority = {
	name: string;
	limits: string;
	active: boolean;
	maxLimits: string;
	paymentType: string[];
	createdAt: Date; // You may want to use Date instead of string
	updatedAt: Date; // You may want to use Date instead of string
};
interface UpdateDetailsBody {
	id: string;
	status: string;
	note: string;
}

interface WithdrawalRequestBody {
	userId: Schema.Types.ObjectId;
	customerName: string;
	mobileNumber: string;
	amount: number;
	currency: string;
	accountDetail?: {
		accountNo: string;
		ifsc: string;
		bankName: string;
	};
}

interface PaymentDetails {
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
	bonusCode?: string;
}
// interface PaymentDetails {
//     userId: Schema.Types.ObjectId;
//     customerName: string;
//     mobileNumber: string;
//     amount: number;
//     emailId: string;
//     city: string;
//     state: string;
//     country: string;
//     zipCode: string;
// }

// interface PaymentResponseLogQueryHelpers {}

// interface IPaymentResponseLogModel extends Model<IPaymentResponseLog, PaymentResponseLogQueryHelpers> {}

export {
	PaymentDetails,
	PaymentObject,
	PaymentRequestUrlType,
	TransactionDetails,
	Priority,
	UpdateDetailsBody,
	WithdrawalRequestBody,
	// IPaymentResponseLog,
	// IPaymentResponseLogModel,
};
