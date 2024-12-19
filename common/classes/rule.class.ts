import { IRule } from '../interfaces/rule.interface';
import { CurrencyEnum } from '../types/currency';
import { TransactionEnum } from '../types/transaction';

class Rule implements IRule {
	// _id: string;
	transactionType: TransactionEnum;
	currency?: CurrencyEnum;
	amount: number;
	numberOfGamePlay: number;
	// createdAt: Date;
	// updatedAt: Date;

	constructor(ruleData: Partial<IRule>) {
		// this._id = ruleData._id;
		this.transactionType = ruleData.transactionType;
		this.transactionType = ruleData.transactionType;
		this.currency = ruleData?.currency;
		this.amount = ruleData.amount;
		this.numberOfGamePlay = ruleData.numberOfGamePlay;
		// this.createdAt = ruleData.createdAt;
		// this.updatedAt = ruleData.updatedAt;
	}
}

export { Rule };
