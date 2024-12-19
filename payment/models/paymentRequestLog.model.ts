import { Model, Schema, model } from 'mongoose';
import {
	IPaymentRequestLog,
	IPaymentRequestLogModel,
	PaymentRequestLogQueryHelpers,
} from '../../common/interfaces/paymentRequestLog.interface';
import { TransactionEnum } from '../../common/types/transaction';

const paymentRequestLogSchema = new Schema<
	IPaymentRequestLog,
	{},
	{},
	PaymentRequestLogQueryHelpers
>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'Player',
		},
		requestType: {
			type: String,
			enum: Object.values(TransactionEnum),
			required: true,
		},
		referenceId: {
			type: String,
		},
		skinId: {
			type: String,
			default: 'crashncash',
		},
		transactionId: {
			type: String,
		},
		requestData: {
			userId: { type: String },
			currency: { type: String },
			customerName: { type: String },
			mobileNumber: { type: Number },
			email: { type: String },
			amount: { type: Number },
			selection: { type: String },
			city: { type: String },
			state: { type: String },
			country: { type: String },
			zipCode: { type: Number },
		},
		isPending: {
			type: Boolean,
		},
		// requestedAt: {
		// 	type: Date,
		// 	default: new Date(Date.now()),
		// },
		transactionInitiatedAt: {
			type: Date,
			default: () => Date.now(),
		},
		transactionCompletedAt: {
			type: Date,
		},

		reasonOfFailure: {
			errorCode: String,
			errorName: String,
			errorDesc: String,
		},
		status: {
			type: String,
		},
	},
	{
		toJSON: { virtuals: true },
	},
);

const PaymentRequestLog = model<IPaymentRequestLog, IPaymentRequestLogModel>(
	'PaymentRequestLog',
	paymentRequestLogSchema,
);

export default PaymentRequestLog;
