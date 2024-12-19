import {
	IExternalTransaction,
	IExternalTransactionModel,
	IExternalTransactionQueryHelpers,
} from '../../common/interfaces/externalTransaction.interface';
import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from './../../common/types/transaction';

import { Schema, model } from 'mongoose';
// import {
// 	ITransaction,
// 	ITransactionModel,
// 	TransactionQueryHelpers,
// } from '../../common/interfaces/transaction.interface';

export const externalTransactionSchema = new Schema<
	IExternalTransaction,
	{},
	{},
	IExternalTransactionQueryHelpers
>(
	{
		userId: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		customerId: {
			type: String,
		},
		currency: {
			type: String,
			enum: Object.values(CurrencyEnum),
			default: CurrencyEnum.INR,
		},
		transactionType: {
			type: String,
			enum: Object.values(TransactionEnum),
			required: true,
		},
		details: {
			requestUuid: String,
			paymentGateway: String,
			amountWithCommission: Number,
			orderId: String,
			paymentTransactionId: String,
		},
		isTransactionSuccess: {
			type: Boolean,
			default: false,
		},
		reasonOfFailure: {
			errorCode: String,
			errorName: String,
			errorDesc: String,
		},
	},
	{
		timestamps: true,
	},
);

const ExternalTransaction = model<
	IExternalTransaction,
	IExternalTransactionModel
>('ExternalTransaction', externalTransactionSchema);

export default ExternalTransaction;
