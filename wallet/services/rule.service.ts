import getLogger from '../../common/logger';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { RuleDao } from '../daos/rule.dao';
import { IRule } from '../../common/interfaces/rule.interface';
import { IPlayer } from '../../common/interfaces/player.interface';
import { createRuleSchema } from '../../common/schemas/rule.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';

class RuleService {
	private logger = getLogger(module);
	private ruleDao: RuleDao;

	constructor() {
		this.ruleDao = new RuleDao();
	}

	// methods for create rules
	public async createRule(
		player: { data: IPlayer },
		rule: IRule,
	): Promise<Response> {
		const { error, value } = createRuleSchema.validate(rule);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		if (player?.data.role != 'admin') {
			return new Response(
				ResponseCodes.AUTHORIZATION_FAILED.code,
				ResponseCodes.AUTHORIZATION_FAILED.message,
			);
		}

		// Create a new rule in the database with the provided data
		const newRule = await this.ruleDao.createRule(value);

		console.log('Rule created', newRule);
		// Return a success response with status code 200 and the newly created player data
		return new Response(
			ResponseCodes.RULE_CREATED_SUCCESSFULLY.code,
			ResponseCodes.RULE_CREATED_SUCCESSFULLY.message,
			newRule,
		);
	}
}

export { RuleService };
