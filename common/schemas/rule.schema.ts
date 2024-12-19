import Joi from 'joi';

const createRuleSchema = Joi.object({
	transactionType: Joi.string().required(),
	currency: Joi.string().required(),
	amount: Joi.number(),
	numberOfGamePlay: Joi.number().required(),
});

export { createRuleSchema };
