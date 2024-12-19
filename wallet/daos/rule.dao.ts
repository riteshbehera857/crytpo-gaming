import { FilterQuery, Model } from 'mongoose';
import { Rule } from '../models/rule.model';
import { IRule } from '../../common/interfaces/rule.interface';

class RuleDao {
	private ruleModel: Model<IRule>;

	constructor() {
		this.ruleModel = Rule;
	}
	public async createRule(rule: Partial<IRule>): Promise<IRule> {
		console.log('createRule', rule);
		const newRule = await this.ruleModel.create({
			...rule,
		});

		return newRule;
	}

	public async findOneRule(query: FilterQuery<IRule>): Promise<IRule> {
		const rule = await this.ruleModel.findOne(query);

		return rule;
	}
}

export { RuleDao };
