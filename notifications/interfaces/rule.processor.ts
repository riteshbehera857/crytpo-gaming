import config from '../config';
import { IMessage } from './message';
import { ICondition, IRule } from './rule';
import Container from 'typedi';
import { ICampaignUsage, IReleaseScheduleUsage } from './campaign.usage';
import getLogger from '../../common/logger';
import { ICampaign } from '../../common/interfaces/campaign.interface';

const log = getLogger(module);
const eventTypeProcessorMap = config.ruleProcessors;
class RuleProcessor {
	public async processMessage(
		message: IMessage,
		campaign: ICampaign,
		rule: IRule,
		campaignUsage: ICampaignUsage,
	): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public match(condition: ICondition, value: any): boolean {
		log.silly(
			`Condition: ${JSON.stringify(
				condition,
			)}, Value: ${value}, typeof: ${typeof value}`,
		);
		if (condition.op === 'eq') {
			return value === condition.value;
		} else if (condition.op === 'neq') {
			return value !== condition.value;
		} else if (typeof value === 'number') {
			if (condition.op === 'gte' && typeof value === 'number') {
				return value >= condition.value;
			} else if (condition.op === 'lte' && typeof value === 'number') {
				return value <= condition.value;
			} else if (condition.op === 'gt' && typeof value === 'number') {
				return value > condition.value;
			} else if (condition.op === 'lt' && typeof value === 'number') {
				return value < condition.value;
			}
		} else if (Array.isArray(condition.value)) {
			if (condition.op === 'in') {
				return condition.value.includes(value);
			} else if (condition.op === 'nin') {
				return !condition.value.includes(value);
			}
		}
		return false;
	}

	/**
	 * Check if the condition matches with the payload.
	 *
	 * This method will return false if the condition's scope is not "payload".
	 * Otherwise, it will check if the payload has the condition's field and if the
	 * value matches the condition.
	 *
	 * @param condition the condition to check
	 * @param payload the payload to check against
	 * @returns true if the condition matches, false otherwise
	 */
	public matchPayloadCondition(
		condition: ICondition,
		payload: any,
		campaign: ICampaign,
	): boolean {
		if (condition.scope !== 'payload') {
			log.silly(
				`Condition scope is not "payload", so we return false. Condition: ${JSON.stringify(
					condition,
				)}`,
			);
			return false;
		}

		// Check if the payload has the condition's field
		let value: any;

		if (payload && payload[condition.field]) {
			log.silly(`Payload has the condition's field: ${condition.field}`);
			value = payload[condition.field];
		} else {
			log.silly(
				`Payload does not have the condition's field: ${condition.field}`,
			);
			return false;
		}

		// Check if the value matches the condition
		let isMatch = false;

		if (value && this.match(condition, value)) {
			log.silly(`Value matches the condition: ${JSON.stringify(condition)}`);
			isMatch = true;
		} else {
			log.silly(
				`Value does not match the condition: ${JSON.stringify(condition)}`,
			);
		}

		log.silly(
			`Condition matched : ${isMatch}, condition : ${JSON.stringify(
				condition,
			)}, value : ${value}`,
		);
		return isMatch;
	}

	/**
	 * Check if all criteria in the list match for the given message and campaign usage.
	 *
	 * @param message the message to check against
	 * @param criteriaList the criteria list to check
	 * @param campaignUsage the campaign usage to store the matched rules
	 * @returns true if all criteria match, false otherwise
	 */
	public static async isCriteriaMatched(
		message: IMessage,
		campaign: ICampaign,
		criteriaList: IRule[],
		campaignUsage: ICampaignUsage,
	): Promise<boolean> {
		// Iterate over the criteria list and check if each rule matches
		for (let i = 0; i < criteriaList.length; i++) {
			let rule = <IRule>criteriaList[i];

			// If the rule has already been matched for this campaign, skip it
			if (
				campaignUsage.eligibleRules &&
				campaignUsage.eligibleRules.includes(rule.id)
			) {
				log.debug(
					`Rule ${rule.name} already matched for rule ${rule.id}, skipping`,
				);
				continue;
			}

			// If the rule's event type matches the message's type, try to match the rule
			if (rule.eventType === message.type) {
				log.debug(
					`Rule ${rule.name} has matching event type, trying to match`,
				);

				const updatedMessage: IMessage = {
					...message,
				};

				let ruleProcessor = <RuleProcessor>(
					Container.get(eventTypeProcessorMap[rule.eventType])
				);

				if (
					await ruleProcessor.processMessage(
						updatedMessage,
						campaign,
						rule,
						campaignUsage,
					)
				) {
					log.debug(`Rule ${rule.name} matched for rule ${rule.id}`);
					rule.status = 'completed';
					campaignUsage.eligibleRules.push(rule.id);
					continue;
				}
			}

			// If the rule does not match, log it and return false
			log.debug(`Rule ${rule.name} did not match for rule ${rule.id}`);

			return false;
		}

		// If all criteria match, return true
		return true;
	}
}

export { RuleProcessor };
