import mongoose, { Schema, Model } from 'mongoose';
import { TransactionEnum } from '../../common/types/transaction';
import { CurrencyEnum } from '../../common/types/currency';
import {
	IRule,
	IRuleModel,
	RuleQueryHelpers,
} from '../../common/interfaces/rule.interface';

// schema for transaction model
const ruleSchema: Schema<IRule, {}, {}, RuleQueryHelpers> = new Schema(
	{
		transactionType: {
			type: String,
			enum: Object.values(TransactionEnum),
			default: TransactionEnum.DEPOSIT,
			required: true,
		},
		currency: {
			type: String,
			enum: Object.values(CurrencyEnum),
			default: CurrencyEnum.INR,
			required: true,
		},
		amount: {
			type: Number,
			default: null,
		},
		numberOfGamePlay: {
			type: Number,
			default: null,
		},
	},
	{
		toJSON: { virtuals: true },
		timestamps: true,
	},
);

// export transaction model
const Rule = mongoose.model<IRule, IRuleModel>('Rule', ruleSchema);

export { Rule };
