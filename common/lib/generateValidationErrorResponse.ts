import Joi from 'joi';

import { ResponseCodes } from '../config/responseCodes';

const errorResponseMap: Record<
	string,
	(typeof ResponseCodes)[keyof typeof ResponseCodes]
> = {
	'"password" is required': ResponseCodes.PASSWORD_REQUIRED_ERROR,
	'"email" is required': ResponseCodes.EMAIL_REQUIRED_ERROR,
	'"transactionType" is required': ResponseCodes.TRANSACTION_TYPE_REQUIRE,
	'"numberOfGamePlay" is required':
		ResponseCodes.NUMBEROFGAMEPLAY_REQUIRE_ERROR,
	'"currency" is required': ResponseCodes.CURRENCY_REQUIRE_ERROR,
	'"amount" is required': ResponseCodes.AMOUNT_REQUIRE_ERROR,

	'"user" is required': ResponseCodes.USER_ID_REQUIRED,
	'"requestData.customerName" is required':
		ResponseCodes.CUSTOMER_NAME_REQUIRED,
	'"requestData.amount" is required': ResponseCodes.AMOUNT_REQUIRED,
	'"requestData.email" is required': ResponseCodes.EMAIL_REQUIRED,
	'"requestData.mobileNumber" is required':
		ResponseCodes.MOBILE_NUMBER_REQUIRED,
	'"requestData.userId" is required': ResponseCodes.USER_ID_REQUIRED,
	// Add more mappings for other validation errors as needed
};
const generateResponseCode = (
	error: Joi.ValidationError,
): (typeof ResponseCodes)[keyof typeof ResponseCodes] | null => {
	// Get the error message from the validation error
	const errorMessage = error.details[0]?.message;

	// Check if the error message exists in the mapping
	if (errorMessage && errorResponseMap[errorMessage]) {
		return errorResponseMap[errorMessage];
	}

	// If no matching error message found, return null
	return null;
};

export { generateResponseCode };
