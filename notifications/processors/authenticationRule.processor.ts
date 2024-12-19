import { ICampaign } from '../../common/interfaces/campaign.interface';
import getLogger from '../../common/logger';
import { IMessage } from '../interfaces/message';
import { IRule } from '../interfaces/rule';
import { RuleProcessor } from '../interfaces/rule.processor';
import { Container, Service } from 'typedi';

const log = getLogger(module);
@Service()
export default class AuthenticationRuleProcessor extends RuleProcessor {
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

log.info('Registering AuthenticationRuleProcessor');

Container.set(
	AuthenticationRuleProcessor.name,
	new AuthenticationRuleProcessor(),
);

export { AuthenticationRuleProcessor };
