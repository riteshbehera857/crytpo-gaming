import { Model } from 'mongoose';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnum } from '../types/transaction';

interface IRule {
	// _id: string;
	transactionType: TransactionEnum;
	currency?: CurrencyEnum;
	amount: number;
	numberOfGamePlay: number;
	// createdAt: Date;
	// updatedAt: Date;
}

interface RuleQueryHelpers {}

interface IRuleModel extends Model<IRule, RuleQueryHelpers> {}

export { IRule, RuleQueryHelpers, IRuleModel };
