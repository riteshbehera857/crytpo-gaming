import Joi from 'joi';

const createPaymentWithdrawalRequestSchema = Joi.object({
	user: Joi.any().required(),
	skinId: Joi.string(),
	requestData: Joi.object({
		userId: Joi.any().required(),
		customerName: Joi.string().optional(),
		mobileNumber: Joi.number().required(),
		amount: Joi.number().required(),
		email: Joi.string().email().optional(),
		bankDetail: Joi.object({
			bankName: Joi.string().optional(),
			bankBranch: Joi.string().optional(),
			accountName: Joi.string().optional(),
			accountNumber: Joi.string().required(),
			ifscCode: Joi.string().required(),
		}),
	}).required(),
});

export { createPaymentWithdrawalRequestSchema };
