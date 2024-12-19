import {
	BonusTransactionQueryHelpers,
	IBonusTransaction,
	IBonusTransactionModel,
} from '../../common/interfaces/bonusTransaction.interface';
import { CurrencyEnum } from '../../common/types/currency';
import { TransactionEnum } from './../../common/types/transaction';

import { Schema, model } from 'mongoose';

const bonusTransactionSchema = new Schema<
	IBonusTransaction,
	{},
	{},
	BonusTransactionQueryHelpers
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
			// Game Details
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
			isAggregated: Boolean,
			// Bonus transaction Details
			campaignId: {
				type: Schema.Types.ObjectId,
			},
			bonusCode: String,
			releaseType: {
				type: String,
				enum: ['locked', 'unlocked'],
				default: 'unlocked',
			},
		},
		isTransactionSuccess: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		collection: 'bonusTransactions',
	},
);

const BonusTransaction = model<IBonusTransaction, IBonusTransactionModel>(
	'BonusTransaction',
	bonusTransactionSchema,
);

export default BonusTransaction;
