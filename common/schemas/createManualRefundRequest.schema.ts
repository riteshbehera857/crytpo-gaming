import Joi from 'joi';

const createManualRefundRequest = Joi.object({
    userId: Joi.string().required(),
    customerName: Joi.string().required(),
    mobileNumber: Joi.string().required(),
    amount: Joi.number().required(),
    currency: Joi.string().required(),
    accountDetail: Joi.object({
        accountNo: Joi.string().required(),
        ifsc: Joi.string().required(),
        bankName: Joi.string().required(),
    }),
});

export { createManualRefundRequest };
