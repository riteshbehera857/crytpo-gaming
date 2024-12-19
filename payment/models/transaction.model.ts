import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from './../../common/types/transaction';

import { Schema, model } from 'mongoose';
import {
	ITransaction,
	ITransactionModel,
	TransactionQueryHelpers,
} from '../../common/interfaces/transaction.interface';

export const transactionSchema = new Schema<
	ITransaction,
	{},
	{},
	TransactionQueryHelpers
>(
	{
		player: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		skinId: {
			type: String,
			default: 'crashncash',
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
		moneyType: {
			type: String,
			default: 'CHIP',
		},
		openingBalance: {
			type: Number,
		},
		closingBalance: {
			type: Number,
		},
		details: {
			transactionUuid: String,
			supplierUser: String,
			roundClosed: Boolean,
			round: String,
			rewardId: String,
			requestUuid: String,
			isFree: Boolean,
			gameId: Number,
			gameCode: String,
			bet: String,
			betId: String,
			paymentMethod: String,
			isAggregated: Boolean,
			paymentGateway: String,
			amountWithCommission: Number,
			orderId: String,
			paymentTransactionId: String,
			campaignId: String,
			releaseType: String,
		},
		isTransactionSuccess: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const Transaction = model<ITransaction, ITransactionModel>(
	'Transaction',
	transactionSchema,
);

export default Transaction;
