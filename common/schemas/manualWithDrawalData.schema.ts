import Joi from 'joi';

const manualWithdrawalDataValidate = Joi.object({
    paymentId: Joi.string().required(),
    status: Joi.string().required(),
    note: Joi.string().required(),
});

export { manualWithdrawalDataValidate };