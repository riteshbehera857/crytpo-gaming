import Joi from 'joi';

const createTransactionSchema = Joi.object({
	transactionUuid: Joi.string().required(),
	transactionType: Joi.string().required(),
	round: Joi.string().optional(),
	requestUuid: Joi.string().required(),
	gameCode: Joi.string().optional(),
	currency: Joi.string().required(),
	amount: Joi.number().required(),
});

const createBetTransactionSchema = Joi.object({
	transactionUuid: Joi.string().required(),
	supplierUser: Joi.string(),
	roundClosed: Joi.boolean(),
	round: Joi.string().required(),
	rewardId: Joi.string(),
	requestUuid: Joi.string().required(),
	isFree: Joi.boolean(),
	isAggregated: Joi.boolean(),
	gameId: Joi.number(),
	gameCode: Joi.string(),
	currency: Joi.string().required(),
	bet: Joi.string(),
	amount: Joi.number().required(),
});

const refundTransactionSchema = Joi.object({
	transactionUuid: Joi.string().required(),
	requestUuid: Joi.string().required(),
	currency: Joi.string().required(),
	amount: Joi.number().required(),
});

export {
	createTransactionSchema,
	createBetTransactionSchema,
	refundTransactionSchema,
};
