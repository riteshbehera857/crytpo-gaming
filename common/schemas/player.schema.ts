import Joi, { number } from 'joi';

const registerSchema = Joi.object({
	email: Joi.string().required(),
	password: Joi.string().required(),
	name: Joi.string().optional().allow('', null),
	scope: Joi.string().optional().allow('', null),
	role: Joi.string().optional().allow('', null),
	phoneNumber: Joi.string().optional().allow('', null),
});

const loginSchema = Joi.object({
	email: Joi.string().required(),
	password: Joi.string().required(),
});

const getPlayerByIdSchema = Joi.object({
	email: Joi.string().hex().length(24),
});

const updatePlayerWithdrawalBalanceSchema = Joi.object({
	transactionType: Joi.string().required(),
	numberOfGamePlay: Joi.number().required(),
});

export {
	registerSchema,
	loginSchema,
	getPlayerByIdSchema,
	updatePlayerWithdrawalBalanceSchema,
};
