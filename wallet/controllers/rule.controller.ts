import { NextFunction, Request } from 'express';
import { RuleService } from '../services/rule.service';
import { PlayerService } from '../../core/services/player.service';
import { Rule } from '../../common/classes/rule.class';

export default class RuleController {
	// Controller for create rule
	public static async createRule(req: Request, next: NextFunction) {
		// Create a new instance of RuleService
		const ruleService = new RuleService();
		try {
			const playerService = new PlayerService();

			const player = await playerService.getPlayerById(req.id);

			const ruleData = { ...req.body };

			const newRule = new Rule(ruleData);
			console.log(player);

			// Attempt to create rule using the RuleService
			const rule = await ruleService.createRule(player, newRule);
			// Return the result of create rule
			return rule;
		} catch (error) {
			// If an error occurs during create rule
			return next(error);
		}
	}
}
