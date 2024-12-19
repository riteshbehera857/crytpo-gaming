import getLogger from '../../common/logger';
import { IMessage } from '../interfaces/message';
import { RuleProcessor } from '../interfaces/rule.processor';

import { Container, Service } from 'typedi';
import { ICampaign } from '../../common/interfaces/campaign.interface';
import { IRule } from '../interfaces/rule';

const log = getLogger(module);

@Service()
export default class LoginRuleProcessor extends RuleProcessor{
    public async processMessage(
		message: IMessage,
		campaign: ICampaign,
		rule: IRule,
	): Promise<boolean> {
		log.info(
			`Processing authentication rule : ${JSON.stringify(rule)},  Payload : ${JSON.stringify(message)}`,
		);

		const clonedCampaign = JSON.parse(JSON.stringify(campaign));

		for (const condition of rule.conditions) {
			log.silly(`Processing condition : ${JSON.stringify(rule)}`);

			if (clonedCampaign.autoOptIn && condition.scope === 'payload') {
				log.silly('Campaign is auto opt in');
				return true;
			}

			if (
				condition.scope === 'payload' &&
				this.matchPayloadCondition(condition, message.payload, campaign)
			) {
				continue;
			}
			log.silly(`Condition not matched : ${JSON.stringify(condition)}`);
			return false;
		}
		return true;
	}
}


log.info('Registering LoginRuleProcessor');

Container.set(LoginRuleProcessor.name, new LoginRuleProcessor());

export { LoginRuleProcessor }
