import Joi from 'joi';

const configSchema = Joi.object({
	withdrawalType: Joi.string().required(),
	paymentType: Joi.string().required(),
	priority: Joi.number(),
	updatedBy: Joi.number().required(),
	deletedAt: Joi.string().required(),
	depositCommission: Joi.number().required(),
	withdrawalCommission: Joi.number().required(),
	createdAt: Joi.string().required(),
	updatedAt: Joi.string().required(),
});

export { configSchema };
