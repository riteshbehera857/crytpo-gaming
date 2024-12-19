import { IMessage } from '../interfaces/message';
import { ICondition, IRule } from '../interfaces/rule';
import { RuleProcessor } from '../interfaces/rule.processor';
import { Container, Service } from 'typedi';
import { GameService } from '../services/game.service';
import getLogger from '../../common/logger';
import { ICampaign } from '../../common/interfaces/campaign.interface';

const log = getLogger(module);
@Service()
export default class GameRuleProcessor extends RuleProcessor {
	private gameService: GameService;

	constructor() {
		super();
		this.gameService = Container.get(GameService);
	}

	public async processMessage(
		message: IMessage,
		campaign: ICampaign,
		rule: IRule,
	): Promise<boolean> {
		log.info(
			`Processing deposit rule : ${JSON.stringify(rule)},  Payload : ${JSON.stringify(message)}`,
		);
		let eligibleTimestamp = message.eligibleTimestamp;

		for (const condition of rule.conditions) {
			log.silly(`Processing condition : ${JSON.stringify(rule)}`);
			if (this.matchPayloadCondition(condition, message.payload, campaign)) {
				continue;
			}

			let value = await this.getValue(
				condition,
				rule,
				eligibleTimestamp,
				message,
			);

			if (this.match(condition, value)) {
				log.silly(
					`Condition matched : true, condition : ${JSON.stringify(condition)}, value : ${value}`,
				);
				continue;
			}
			log.silly(`Condition not matched : ${JSON.stringify(condition)}`);
			return false;
		}
		return true;
	}

	private async getValue(
		condition: ICondition,
		rule: IRule,
		eligibleTimestamp: number,
		message: IMessage,
	) {
		let value;

		if ('stats' === condition.scope) {
			if ('rounds' === condition.field) {
				if (rule.games && rule.games.length > 0) {
					value = await this.gameService.getGameCountAfterIn(
						eligibleTimestamp,
						message.userId,
						rule.games,
					);
				} else {
					value = await this.gameService.getGameCountAfter(
						eligibleTimestamp,
						message.userId,
					);
				}
			}
		}
		return value;
	}
}

log.info('Registering GameRuleProcessor');

Container.set(GameRuleProcessor.name, new GameRuleProcessor());

export { GameRuleProcessor };
