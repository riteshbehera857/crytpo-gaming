import Joi from 'joi';

const paymentSchema = Joi.object({
	userId: Joi.string().required(),
	currency: Joi.string().required(),
	customerName: Joi.string().required(),
	mobileNumber: Joi.string().required(),
	amount: Joi.number().required(),
	accountDetail: Joi.object({
		accountNo: Joi.string().required(),
		ifsc: Joi.string().required(),
		bankName: Joi.string().required(),
	}).required(),
	email: Joi.string().allow(null), // Allow null as emailId is undefined in the provided object
	selection: Joi.string().allow(null), // Allow null as selection is undefined in the provided object
	city: Joi.string().allow(null), // Allow null as city is undefined in the provided object
	state: Joi.string().allow(null), // Allow null as state is undefined in the provided object
	country: Joi.string().allow(null), // Allow null as country is undefined in the provided object
	zipCode: Joi.string().allow(null), // Allow null as zipCode is undefined in the provided object
});
export { paymentSchema };
