import { Model, Schema, model } from 'mongoose';
import { TransactionStatusEnum } from '../../common/types/transactionStatus';
import { CurrencyEnum } from '../../common/types/currency';
import {
	IPaymentDeposit,
	PaymentDepositModelType,
	PaymentDepositQueryHelpers,
} from '../../common/interfaces/paymentDeposit.interface';

const paymentDepositSchema = new Schema<
	IPaymentDeposit,
	{},
	{},
	PaymentDepositQueryHelpers
>(
	{
		paymentGateway: {
			type: String,
			required: true,
		},
		note: {
			type: String,
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(TransactionStatusEnum),
			required: true,
		},
		currency: {
			type: String,
			enum: Object.values(CurrencyEnum),
			default: CurrencyEnum.INR,
		},
		amount: {
			type: Number,
			required: true,
		},
		transactionType: {
			type: String,
			default: 'deposit',
			required: true,
		},
		responseId: {
			type: String,
			required: true,
		},
		requestId: {
			type: String,
			required: true,
		},
		deletedAt: {
			type: Date,
		}, // You may want to consider using a different type for deletedAt
		amountWithCommission: {
			type: Number,
			required: true,
		},
		walletAddress:{
			type:string,
		}
	},
	{
		toJSON: { virtuals: true },
		timestamps: true,
	},
);

const PaymentDeposit = model<IPaymentDeposit, PaymentDepositModelType>(
	'PaymentDeposit',
	paymentDepositSchema,
);

export default PaymentDeposit;
