import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';
import getLogger from '../../common/logger';
import { verifyUser } from '../../common/middlewares/verfiyUser';
import { catchAsync } from '../../common/lib';
import RuleController from '../controllers/rule.controller';
import { checkPermission } from '../../common/lib/passport-config';
import { role } from '../../common/lib/roleAndPermissions';

const route = Router();
const log = getLogger(module);

export default (app: Router) => {
	app.use('/rule', route);
	/**
	 * @openapi
	 * /wallet/rule:
	 *   post:
	 *     tags:
	 *       - Wallet
	 *     summary: create a new rule
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               transactionType:
	 *                 type: string
	 *                 required: true
	 *               currency:
	 *                 type: string
	 *                 required: true
	 *               amount:
	 *                 type: number
	 *               numberOfGamePlay:
	 *                 type: number
	 *     responses:
	 *       '200':
	 *         description: Rule created successfully.
	 */

	route.post(
		'/',
		verifyUser(),
		checkPermission([role.admin]),
		celebrate({
			// Validate the request body using Joi schema
			[Segments.BODY]: Joi.object({
				transactionType: Joi.string().required(),
				currency: Joi.string().required(),
				amount: Joi.number(),
				numberOfGamePlay: Joi.number().required(),
			}),
		}),
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			// Call the register method of the RuleController
			const response = await RuleController.createRule(req, next);
			// Send the response
			return res.status(200).json(response);
		}),
	);
};
