class ResponseCodes {
	static USER_AUTHENTICATION_FAILED = {
		code: 'L101',
		message: 'User authentication failed',
	} as const;
	static PHONE_NUMBER_IS_REQUIRED = {
		code: 'P500',
		message: 'Phone number is required',
	} as const;
	static SESSION_VALIDATED_SUCCESSFULLY = {
		code: 'S300',
		message: 'Session validated successfully',
	} as const;
	static UNAUTHORIZED = {
		code: 'A401',
		message: 'Unauthorized',
	} as const;
	static PERMISSION_DENIED = {
		code: 'A403',
		message: 'Permission denied',
	} as const;
	static PLAYER_BANK_FETCHED_SUCCESSFULLY = {
		code: 'B100',
		message: 'Player primary bank fetched successfully',
	} as const;
	static PLAYER_NOT_FOUND = {
		code: 'L102',
		message: 'Player not found',
	} as const;
	static USER_NOT_FOUND = {
		code: '400',
		message: 'User not found',
	} as const;
	static PLAYER_ID_NOT_FOUND = {
		code: 'P103',
		message: 'Player id not found',
	} as const;
	static INVALID_TOKEN = {
		code: 'T400',
		message: 'Invalid token',
	} as const;
	static INVALID_USERNAME_PASSWORD = {
		code: 'L103',
		message: 'Invalid username or password',
	} as const;
	static PLAYER_ALREADY_EXISTS = {
		code: 'L104',
		message: 'Player already exists',
	} as const;
	static REGISTRATION_SUCCESS = {
		code: 'R201',
		message: 'Player registration successful',
	} as const;
	static OTP_HAS_EXPIRED = {
		code: 'OTP500',
		message: 'Otp has expired, please try again.',
	} as const;
	static LOGIN_SUCCESS = {
		code: 'L200',
		message: 'Player login successful',
	} as const;
	static SESSION_UPDATED_SUCCESSFULLY = {
		code: 'S600',
		message: 'Session updated successfully',
	} as const;
	static SESSION_ALREADY_EXISTS = {
		code: 'PS405',
		message: 'Session already exists',
	} as const;
	static SESSION_TERMINATED = {
		code: 'PS406',
		message: 'Your session has been terminated',
	} as const;
	static PREV_SESSION_TERMINATED = {
		code: 'PS407',
		message: 'Previous session has been terminated',
	} as const;
	static SESSION_NOT_FOUND = {
		code: 'PS410',
		message: 'Session not found',
	} as const;
	static PLAYER_FETCHED_SUCCESS = {
		code: 'C200',
		message: 'Player fetched successfully',
	} as const;
	static PLAYER_UPDATED_SUCCESS = {
		code: 'C201',
		message: 'Player updated successfully',
	} as const;
	static DEPOSIT_ADDRESS_MISMATCH = {
		code: 'D101',
		message: 'Deposit address mismatch',
	} as const;
	static DEPOSIT_FAILED = {
		code: 'D102',
		message: 'Deposit failed',
	} as const;
	static DEPOSIT_NOT_FOUND = {
		code: 'PD101',
		message: 'Deposit record not found',
	} as const;
	static DEPOSIT_RECORD_METAMASK_ADDRESS_DOES_NOT_MATCH_WITH_THE_PLAYER_METAMASK_ADDRESS =
		{
			code: 'PD102',
			message: `Deposit record metamask address doesn't match with the player's metamask address`,
		} as const;
	static DEPOSIT_UNSUCCESSFUL = {
		code: 'PD103',
		message: 'Deposit is not successful, cannot update wallet balance',
	};
	static AUTHORIZATION_FAILED = {
		code: 'A101',
		message: 'You are not permitted to do this operation',
	} as const;
	static INSUFFICIENT_BALANCE_TRANSACTION_FAILED = {
		code: 'T101',
		message: 'Insufficient balance',
	} as const;
	static TRANSACTION_TYPE_FAILED = {
		code: 'T102',
		message: 'Transaction not supported',
	} as const;
	static RULE_NOT_FOUND = {
		code: 'R101',
		message: 'Rule not found',
	} as const;
	static SERVER_ERROR = {
		code: 'S101',
		message: 'Something went wrong please try again',
	} as const;
	static WALLET_BALANCE_FETCHED_SUCCESSFUL = {
		code: 'PW200',
		message: 'Wallet balance fetched successfully',
	} as const;
	static WALLET_UPDATED_SUCCESSFULLY = {
		code: 'W210',
		message: 'Wallet updated successfully',
	} as const;
	static BET_DOES_NOT_EXIST = {
		code: 'B101',
		message: 'Bet does not exist',
	} as const;
	static INVALID_PRIORITY = {
		code: 'P102',
		message: 'Not a valid Priority',
	} as const;
	static INVALID_PAYMENT = {
		code: 'P103',
		message: 'Not a valid payment types',
	} as const;
	static CONFIG_UPDATE_SUCCESS = {
		code: 'P104',
		message: 'Config update successful.',
	} as const;
	static PAYMENT_GATEWAY_ERROR = {
		code: 'P105',
		message: 'Error while generating payment URL.',
	} as const;
	static PAYMENT_URL_GENERATE_SUCCESS = {
		code: 'P106',
		message: 'Payment URL generated successfully.',
	} as const;
	static INVALID_PAYMENT_DETAILS = {
		code: 'P107',
		message: 'payment details is not valid.',
	} as const;
	static MANUAL_REFUND_GENERATED_SUCCESS = {
		code: 'P108',
		message: 'Manual refund generated successfully.',
	} as const;
	static WITHDRAWAL_PAYMENT_DETAILS_NOT_FOUND = {
		code: 'P109',
		message: 'Withdrawal payment details not found.',
	} as const;
	static WITHDRAWAL_PAYMENT_DETAILS_UPDATED_SUCCESS = {
		code: 'P110',
		message: 'Withdrawal payment details updated successfully.',
	} as const;
	static ERR_WHILE_UPDATE_MANUAL_PAYMENT = {
		code: 'P111',
		message: 'Error updating manual payment.',
	} as const;
	static PAYMENT_CAPTURE_SUCCESS = {
		code: 'P112',
		message: 'Payment was successfully captured.',
	} as const;
	static ERR_INVALID_PAYMENT_METHOD = {
		code: 'P113',
		message: 'Error invalid payment method.',
	} as const;
	static ERR_INVALID_WITHDRAWAL_TYPE = {
		code: 'P114',
		message: 'Error invalid withdrawal type.',
	} as const;
	static ERR_CONFIG_NOT_EXIT = {
		code: 'P115',
		message: 'Configuration is not available.',
	} as const;
	static ERR_WHILE_CAPTURE_PAYMENT_EXIT = {
		code: 'P116',
		message: 'Error while capturing payment.',
	} as const;
	static ERR_WHILE_AUTHENTICATE_PAYMENT_GETAWAY = {
		code: 'P117',
		message: 'Error while authorization request from payment server.',
	} as const;
	static PLAYER_UPDATE_QUERY_NOT_PROVIDED = {
		code: 'C116',
		message: 'A valid update must be provided.',
	} as const;
	static PLAYER_UPDATE_DATA_NOT_PROVIDED = {
		code: 'C117',
		message: 'Valid update data must be provided.',
	} as const;
	static RULE_CREATED_SUCCESSFULLY = {
		code: 'R201',
		message: 'Rule created successfully.',
	} as const;
	static TRANSACTION_SUCCESSFULLY = {
		code: 'T201',
		message: 'Transaction created successfully.',
	} as const;
	static BET_TRANSACTION_SUCCESSFULLY = {
		code: 'BT201',
		message: 'Bet transaction created successfully.',
	} as const;
	static WIN_TRANSACTION_SUCCESSFULLY = {
		code: 'WT201',
		message: 'Win transaction created successfully.',
	} as const;
	static PASSWORD_REQUIRED_ERROR = {
		code: 'RP400',
		message: 'Password is required',
	} as const;
	static EMAIL_REQUIRED_ERROR = {
		code: 'RE400',
		message: 'Email is required',
	} as const;
	static TRANSACTION_TYPE_REQUIRE = {
		code: 'T401',
		message: 'Transaction type require.',
	} as const;
	static CURRENCY_REQUIRE_ERROR = {
		code: 'T402',
		message: 'Currency is required.',
	} as const;
	static AMOUNT_REQUIRE_ERROR = {
		code: 'T403',
		message: 'Amount is require.',
	} as const;
	static NUMBEROFGAMEPLAY_REQUIRE_ERROR = {
		code: 'T404',
		message: 'Number of game play is require.',
	} as const;
	static OTP_SENT_SUCCESSFULLY = {
		code: 'L200',
		message: 'Otp sent successfully',
	} as const;
	static OTP_VERIFIED_SUCCESSFULLY = {
		code: 'L200',
		message: 'Otp verified successfully',
	} as const;
	static OTP_SENDING_FAILED = {
		code: 'L405',
		message: 'Otp sending failed',
	} as const;
	static INVALID_OTP = {
		code: 'L400',
		message: 'Invalid otp, please try again',
	} as const;
	static PLAYER_REGISTRATION_DETAILS_UPDATE_SUCCESS = {
		code: 'PRU200',
		message: 'Player registration updated successfully',
	} as const;
	static INVALID_PHONE_NUMBER = {
		code: 'L401',
		message: 'Invalid phone number',
	} as const;
	static GET_CONFIG_SUCCESSFUL = {
		code: 'C200',
		message: 'Config data get successfully',
	} as const;
	static GAMES_FETCHED_SUCCESSFULLY = {
		code: 'G200',
		message: 'Games fetched successfully',
	} as const;
	static GAME_LAUNCH_URL_FETCHED_SUCCESSFULLY = {
		code: 'G201',
		message: 'Game launch url fetched successfully',
	} as const;
	static LOGGED_IN_USER_FETCHED_SUCCESSFULLY = {
		code: 'CU200',
		message: 'Logged in user fetched successfully',
	};
	static RS_OK = {
		code: 'RS200',
		message: 'RS_OK',
	} as const;
	static RS_ERROR_UNKNOWN = {
		code: 'RS400',
		message: 'RS_ERROR_UNKNOWN',
	} as const;
	static RS_ERROR_INVALID_PARTNER = {
		code: 'RS401',
		message: 'RS_ERROR_INVALID_PARTNER',
	} as const;
	static RS_ERROR_INVALID_TOKEN = {
		code: 'RS402',
		message: 'RS_ERROR_INVALID_TOKEN',
	} as const;
	static RS_ERROR_INVALID_GAME = {
		code: 'RS403',
		message: 'RS_ERROR_INVALID_GAME',
	} as const;
	static RS_ERROR_WRONG_CURRENCY = {
		code: 'RS404',
		message: 'RS_ERROR_WRONG_CURRENCY',
	} as const;
	static RS_ERROR_NOT_ENOUGH_MONEY = {
		code: 'RS405',
		message: 'RS_ERROR_NOT_ENOUGH_MONEY',
	} as const;
	static RS_ERROR_USER_DISABLED = {
		code: 'RS406',
		message: 'RS_ERROR_USER_DISABLED',
	} as const;
	static RS_ERROR_INVALID_SIGNATURE = {
		code: 'RS407',
		message: 'RS_ERROR_INVALID_SIGNATURE',
	} as const;
	static RS_ERROR_TOKEN_EXPIRED = {
		code: 'RS408',
		message: 'RS_ERROR_TOKEN_EXPIRED',
	} as const;
	static RS_ERROR_WRONG_SYNTAX = {
		code: 'RS409',
		message: 'RS_ERROR_WRONG_SYNTAX',
	} as const;
	static RS_ERROR_WRONG_TYPES = {
		code: 'RS410',
		message: 'RS_ERROR_WRONG_TYPES',
	} as const;
	static RS_ERROR_DUPLICATE_TRANSACTION = {
		code: 'RS411',
		message: 'RS_ERROR_DUPLICATE_TRANSACTION',
	} as const;
	static RS_ERROR_TRANSACTION_DOES_NOT_EXIST = {
		code: 'RS412',
		message: 'RS_ERROR_TRANSACTION_DOES_NOT_EXIST',
	} as const;
	static RS_ERROR_INVALID_PUBLIC_KEY = {
		code: 'RS413',
		message: 'RS_ERROR_INVALID_PUBLIC_KEY',
	} as const;
	static RS_ERROR_BET_DOES_NOT_EXIST = {
		code: 'RS414',
		message: 'RS_ERROR_BET_DOES_NOT_EXIST',
	} as const;
	static PLAYER_PAYMENT_REQUESTS_FETCHED_SUCCESSFULLY = {
		code: 'PR200',
		message: 'Players payment requests fetched successfully',
	} as const;
	static PLAYER_KYC_CREATED_SUCCESSFULLY = {
		code: 'K200',
		message: 'Players kyc created successfully',
	} as const;
	static PLAYER_KYC_UPDATED_SUCCESSFULLY = {
		code: 'K201',
		message: 'Players kyc updated successfully',
	} as const;
	static PLAYER_KYC_NOT_FOUND = {
		code: 'K400',
		message: 'Players kyc not found',
	} as const;
	static POKER_SERVER_TOKEN_DETAILS_NOT_FOUND = {
		code: 'PS400',
		message: "Token details doesn't exits",
	} as const;
	static POKER_SERVER_TOKEN_DETAILS_FETCHED_SUCCESSFULLY = {
		code: 'PS200',
		message: 'Token details fetched successfully',
	} as const;
	static POKER_SERVER_USER_FETCHED_SUCCESSFULLY = {
		code: 'PSU200',
		message: 'Poker server user fetched successfully',
	};
	static FILE_UPLOAD_ERROR = {
		code: 'F400',
		message: 'File upload error',
	} as const;
	static NO_FILE_FOUND_ERROR = {
		code: 'F401',
		message: 'No File file found to upload ',
	} as const;
	static FILE_UPLOAD_SUCCESSFUL = {
		code: 'F200',
		message: 'Players document upload successfully',
	} as const;
	static INSUFFICIENT_WITHDRAWAL_AMOUNT = {
		code: 'W400',
		message: 'Insufficient withdrawal amount',
	} as const;
	static WITHDRAWAL_REQUEST_INITIATED_SUCCESSFULLY = {
		code: 'W200',
		message:
			"Withdrawal request initiated successfully, you'll be informed as soon as it's approved",
	} as const;
	static USER_ID_REQUIRED = {
		code: 'U400',
		message: 'User id is required',
	} as const;
	static CUSTOMER_NAME_REQUIRED = {
		code: 'CN400',
		message: 'Customer name is required',
	} as const;
	static MOBILE_NUMBER_REQUIRED = {
		code: 'M400',
		message: 'Mobile number is required',
	} as const;
	static EMAIL_REQUIRED = {
		code: 'CE400',
		message: 'Email is required',
	} as const;
	static AMOUNT_REQUIRED = {
		code: 'WA400',
		message: 'Withdrawal amount is required',
	} as const;
	static INVALID_USER_NAME = {
		code: 'SL400',
		message: 'Username should not contain any integer values',
	} as const;
	static PAYMENT_FAILED = {
		code: 'SL500',
		message: 'Payment failed, please try again',
	} as const;
	static EXTERNAL_TRANSACTION_FETCHED_SUCCESSFULLY = {
		code: 'EX200',
		message: 'Transaction fetched successfully',
	} as const;
	static TRANSACTION_TYPES_FETCHED_SUCCESSFULLY = {
		code: 'TT200',
		message: 'Transaction types fetched successfully',
	} as const;
	static TRANSACTIONS_FETCHED_SUCCESSFULLY = {
		code: 'TT202',
		message: 'Transactions fetched successfully',
	} as const;
	static INVALID_WITHDRAWAL_AMOUNT = {
		code: 'WT400',
		message: 'Withdrawal amount must be greater than zero',
	} as const;
	static INVALID_FILE_FORMAT_ERROR = {
		code: 'FU400',
		message: 'Only JPG, JPEG, or PDF files are allowed',
	} as const;
	static INVALID_AMOUNT = {
		code: 'IDA400',
		message:
			'Amount is exceeding the maximum limit, please try again with a different amount less than ',
	} as const;
	static NOTIFICATION_NOT_FOUND = {
		code: 'NO400',
		message: 'Notification not found.',
	} as const;
	static NOTIFICATION_FETCHED_SUCCESS = {
		code: 'NOT200',
		message: 'Notification fetch successfully.',
	} as const;
	static NOTIFICATION_CREATED_QUERY_NOT_PROVIDED = {
		code: 'RTC200',
		message: 'Notification id not provided.',
	} as const;
	static NOTIFICATION_CREATED_SUCCESS = {
		code: 'NTC200',
		message: 'Notification seen updated successfully.',
	} as const;
	static NOTIFICATIONS_FETCHED_SUCCESS = {
		code: 'NTC202',
		message: 'Notification fetch successfully.',
	} as const;
	static NOTIFICATIONS_DELETE_SUCCESS = {
		code: 'NTC204',
		message: 'Notification deleted successfully.',
	} as const;
}

export { ResponseCodes };
