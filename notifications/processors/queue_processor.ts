import { Container } from 'typedi';
import config from '../config';
import { IMessage } from '../interfaces/message';
import { SubscribeService } from '../services/subscribe.service';
import { MessageProcessor } from '../interfaces/message_processor';
import getLogger from '../../common/logger';

const log = getLogger(module);

class QueueProcessor {
	private subscriberService: SubscribeService;

	constructor() {
		this.subscriberService = new SubscribeService();
	}

	async subscribe() {
		this.subscriberService.subscribe(config.pub_sub.channel, this.process);
	}

	async processRecord(processorName: string, message: IMessage) {
		if (!Container.has(processorName)) {
			log.error(`Processor ${processorName} not found`);
			return;
		}
		try {
			log.debug(
				`Processing message with processor: ${processorName} for type: ${message.type}`,
			);
			let messageProcessor = Container.get<MessageProcessor>(processorName);
			(<MessageProcessor>messageProcessor).processMessage(message);
		} catch (error) {
			log.error(`Error processing message: ${error}`);
		}
	}

	async process(message: IMessage) {
		log.debug('Processing message : ' + JSON.stringify(message));

		const rules: any[] = [];

		for (let rule of config.process_rules) {
			if (
				rule.ruleType == 'regex' &&
				rule.eventType &&
				typeof rule.eventType == 'string'
			) {
				let match = message.type.match(rule.eventType);

				log.debug(
					`String: ${message.type}, Regex: ${rule.ruleType}, Result: ${match}`,
				);

				if (match && match[0] != message.type) continue;
			} else if (
				rule.ruleType == 'events' &&
				rule.eventType &&
				Array.isArray(rule.eventType)
			) {
				// Check if the message type is included in the event types specified in the rule.
				// If not, skip this rule.
				if (!rule.eventType.includes(message.type)) continue;
			}
			// If the rule type is not regex or events, skip it.
			else continue;

			log.debug(
				`String: ${message.type}, Regex: ${rule.ruleType}, Matched Processors: ${rule.processors}`,
			);

			rules.push(rule);
		}

		log.debug(`Rules: ${JSON.stringify(rules)}`);

		for (let rule of rules) {
			let processors = rule.processors; // BonusCampaignProcessor

			log.debug(`Type: ${message.type}, Eligible Processor - ${processors}`);

			for (let processorName of processors) {
				if (!Container.has(processorName)) {
					log.error(`Processor ${processorName} not found`);
					continue;
				}

				try {
					log.debug(
						`Processing message with processor: ${processorName} for type: ${message.type}`,
					);

					const updatedMessage: IMessage = {
						...message,
					};

					let messageProcessor =
						Container.get<MessageProcessor>(processorName);
					(<MessageProcessor>messageProcessor).processMessage(
						updatedMessage,
					);
				} catch (error) {
					log.error(`Error processing message: ${error}`);
				}
			}
		}
	}
}

export { QueueProcessor };
