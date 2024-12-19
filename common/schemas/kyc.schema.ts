import Joi from 'joi';

const kycSchema = Joi.object({
	docType: Joi.string(),
	uploadDocType: Joi.string(),
});

const updateKycSchema = Joi.object({
	status: Joi.string().required(),
});

export { kycSchema, updateKycSchema };
