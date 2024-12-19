import { Joi, Segments } from 'celebrate';

const socialAuthValidation = {
    [Segments.BODY]: Joi.object().keys({
        code: Joi.string().required().messages({
            "string.base": "Authorization code must be a string.",
            "string.empty": "Authorization code cannot be empty.",
            "any.required": "Authorization code is required."
        }),
        codeType: Joi.string().valid("CODE", "ACCESS_TOKEN").required().messages({
            "any.only": "Code type must be either 'CODE' or 'ACCESS_TOKEN'.",
            "any.required": "Code type is required."
        }),
        deviceId: Joi.string().required().messages({
            "string.base": "Device ID must be a string.",
            "string.empty": "Device ID cannot be empty.",
            "any.required": "Device ID is required."
        })
    }),
    [Segments.QUERY]: Joi.object().keys({
        authProvider: Joi.string().valid("google", "facebook").required().messages({
            "any.only": "Auth provider must be either 'google' or 'facebook'.",
            "any.required": "Auth provider is required."
        })
    })
};

export { socialAuthValidation };
