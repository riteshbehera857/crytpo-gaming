import Joi from 'joi';

const giftonSchema = Joi.object({
	userId: Joi.string().required(),
	customerName: Joi.string().required(),
	mobileNumber: Joi.number(),
	amount: Joi.number().required(),
	email: Joi.string().required(),
	city: Joi.number().required(),
	state: Joi.number().required(),
	country: Joi.string().required(),
	zipCode: Joi.string().required(),
});

export { giftonSchema };
