import { Schema, model } from 'mongoose';
import {
	IPaymentWithdrawalRequestLog,
	IPaymentWithdrawalRequestLogModel,
	PaymentWithdrawalRequestLogQueryHelpers,
} from '../../common/interfaces/paymentWithdrawalRequestLog.interface';
import {
	WithdrawalStatus,
	WithdrawalTypeEnum,
} from '../../common/types/withdrawal';

const paymentWithdrawalRequestLogSchema = new Schema<
	IPaymentWithdrawalRequestLog,
	{},
	{},
	PaymentWithdrawalRequestLogQueryHelpers
>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'Player',
		},
		skinId: {
			type: String,
			default: 'crashncash',
		},
		requestData: {
			userId: { type: String },
			// currency: { type: String },
			customerName: { type: String },
			mobileNumber: { type: Number },
			email: { type: String },
			amount: { type: Number },
			bankDetail: {
				bankName: { type: String },
				bankBranch: { type: String },
				accountNumber: { type: String },
				accountName: { type: String },
				ifscCode: { type: String },
			},
			// selection: { type: String },
			// city: { type: String },
			// state: { type: String },
			// country: { type: String },
			// zipCode: { type: Number },
		},
		isPending: { type: Boolean, default: true },
		referenceId: { type: String },
		transactionId: { type: String },
		type: {
			type: String,
			enum: Object.values(WithdrawalTypeEnum),
			default: WithdrawalTypeEnum.MANUAL,
		},
		requestedAt: {
			type: Date,
			default: () => Date.now(),
		},
		approved: {
			by: Schema.Types.ObjectId,
			date: Date,
		},
		rejected: {
			by: Schema.Types.ObjectId,
			date: Date,
			reason: String,
		},
		settled: {
			by: Schema.Types.ObjectId,
			date: Date,
			transactionId: String,
		},
		status: {
			type: String,
			enum: Object.values(WithdrawalStatus),
			default: WithdrawalStatus.REQUESTED,
		},
	},
	{
		toJSON: { virtuals: true },
		timestamps: true,
	},
);

const PaymentWithdrawalRequestLog = model<
	IPaymentWithdrawalRequestLog,
	IPaymentWithdrawalRequestLogModel
>('PaymentWithdrawalRequestLog', paymentWithdrawalRequestLogSchema);

export default PaymentWithdrawalRequestLog;
