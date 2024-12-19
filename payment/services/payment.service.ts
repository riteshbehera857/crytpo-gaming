import Container, { Inject, Service } from 'typedi';
import { GiftonPaymentService } from './gifton.service';
import { ManualWithdrawalService } from './manualWithdrawal.service';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { TransactionDao } from '../daos/transactionDao';
import { ConfigDao } from '../daos/configDao';
import { Priority } from '../../common/classes/priority.class';
import { PaymentDetails } from '../../common/interfaces/payment.service.interface';
import { paymentSchema } from '../../common/schemas/payment.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import {
	IPaymentWithdrawalRequestLog,
	IPaymentWithdrawalRequestLogModel,
} from '../../common/interfaces/paymentWithdrawalRequestLog.interface';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IPlayer } from '../../common/interfaces/player.interface';
import { PaymentWithdrawalRequestLogDao } from '../daos/paymentWithdrawalRequestLogDao';
import { PaymentWithdrawal } from '../../common/classes/paymentWithdrawal';
import { createPaymentWithdrawalRequestSchema } from '../../common/schemas/paymentWithdrawalRequest.schema';

@Service()
export class PaymentService {
	private transactionDao: TransactionDao;
	private configDao: ConfigDao;
	private commonPlayerDao: CommonPlayerDao;
	private paymentWithdrawalRequestLogDao: PaymentWithdrawalRequestLogDao;
	constructor() {
		// Initialize config repository
		this.transactionDao = new TransactionDao();
		this.configDao = new ConfigDao();
		this.commonPlayerDao = new CommonPlayerDao();
		this.paymentWithdrawalRequestLogDao =
			new PaymentWithdrawalRequestLogDao();
	}

	/**
	 * Process payment based on the provided details.
	 * @param body The payment details.
	 * @returns The payment response.
	 */
	public async paymentProcessing(
		paymentDetails: PaymentDetails,
		skin: string,
		customerCode: string,
	): Promise<Response> {
		const { error, value } = paymentSchema.validate(paymentDetails);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}
		// Retrieve configuration settings
		const config = await this.configDao.findOne();

		// Get priority list from configuration
		const priority: Priority[] = config.priority;

		// Check payment type
		if (config.paymentType == 'round') {
			// For round payment type, determine payment method based on amount
			const paymentMethod = this.searchByOrder(
				priority,
				Number(paymentDetails.amount),
			);

			const firstPaymentMethod = await this.configDao.findOne();

			const foundSelectedPaymentMethod = firstPaymentMethod?.priority.find(
				(priority) => priority.name === paymentDetails.selection,
			);

			if (
				!paymentMethod &&
				parseInt(foundSelectedPaymentMethod.maxLimits) <
					paymentDetails.amount
			) {
				return new Response(
					ResponseCodes.INVALID_AMOUNT.code,
					ResponseCodes.INVALID_AMOUNT.message +
						foundSelectedPaymentMethod.maxLimits,
				);
			}

			if (paymentMethod.name === 'gifton') {
				// If payment method is 'gifton', use GiftonPaymentService to process payment
				const giftonPaymentService = Container.get(GiftonPaymentService);
				const paymentResponse = await giftonPaymentService.getPaymentUrl(
					paymentDetails,
					skin,
					customerCode,
				);
				return paymentResponse;
			} else {
				return new Response(
					ResponseCodes.ERR_INVALID_PAYMENT_METHOD.code,
					ResponseCodes.ERR_INVALID_PAYMENT_METHOD.message,
				);
			}
		} else {
			// For other payment types, use selection to determine payment method
			const paymentMethod = this.searchByName(
				priority,
				paymentDetails.selection,
			);
			if (!paymentMethod) {
				return new Response(
					ResponseCodes.ERR_INVALID_PAYMENT_METHOD.code,
					ResponseCodes.ERR_INVALID_PAYMENT_METHOD.message,
				);
			}
			if (paymentMethod.name === 'gifton') {
				// If payment method is 'gifton', use GiftonPaymentService to process payment
				const giftonPaymentService = Container.get(GiftonPaymentService);
				const paymentResponse = await giftonPaymentService.getPaymentUrl(
					paymentDetails,
					skin,
					customerCode,
				);
				return paymentResponse;
			}
		}
	}

	public async getDeposits() {
		return await this.transactionDao.find();
	}

	/**
	 * Processes a withdrawal request for a player.
	 * @param {Partial<IPaymentWithdrawalRequestLog>} data - Partial data of the withdrawal request.
	 * @returns {Promise<Response>} A promise that resolves with a response indicating the result of the withdrawal request.
	 * @throws Throws an error if an error occurs during the withdrawal processing.
	 */
	public async processWithdrawal(
		data: Partial<IPaymentWithdrawalRequestLog>,
	): Promise<Response> {
		try {
			const { error, value } =
				createPaymentWithdrawalRequestSchema.validate(data);

			if (error) {
				const responseCode = generateResponseCode(error);
				if (responseCode) {
					if ('message' in responseCode && 'code' in responseCode) {
						// Return a response with the generated response code
						return new Response(responseCode.code, responseCode.message);
					}
				}
			}

			if (data.requestData.amount <= 0) {
				return new Response(
					ResponseCodes.INVALID_WITHDRAWAL_AMOUNT.code,
					ResponseCodes.INVALID_WITHDRAWAL_AMOUNT.message,
				);
			}

			// Retrieve player information based on user ID
			const player = await this.commonPlayerDao.getPlayerById(data.user);

			// Check if player exists
			if (!player) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			// Check if player has sufficient balance for withdrawal
			if (player.balance.withdrawalBalance < data.requestData.amount) {
				return new Response(
					ResponseCodes.INSUFFICIENT_WITHDRAWAL_AMOUNT.code,
					ResponseCodes.INSUFFICIENT_WITHDRAWAL_AMOUNT.message,
				);
			}

			let paymentWithdrawalRequest: IPaymentWithdrawalRequestLog;

			// Retrieve configuration settings
			const config = await this.configDao.findOne();

			// Get priority list from configuration
			const priority: Priority[] = config.priority;

			// Search for suitable payment method for withdrawal based on priority list
			const paymentMethod =
				this.searchPaymentGatewayWhichSupportsWithdrawal(priority);

			// Check if player is VIP
			const isPlayerVIP = this.hasVipAndDiamondTags(player);

			// If suitable payment method is found and player is VIP
			if (paymentMethod && isPlayerVIP) {
				// Implement logic for withdrawal process for VIP players
				// For example, prioritize faster withdrawal processing or offer additional benefits
			}

			// If no suitable payment method is found
			if (!paymentMethod) {
				// Process manual withdrawal
				paymentWithdrawalRequest = await this.processManualWithdrawal(data);
			}

			const updatedUser =
				await this.commonPlayerDao.updateUserBalanceAfterWithdrawalRequest(
					paymentWithdrawalRequest.user,
					paymentWithdrawalRequest.requestData.amount,
				);

			// Return response indicating successful initiation of withdrawal request
			return new Response(
				ResponseCodes.WITHDRAWAL_REQUEST_INITIATED_SUCCESSFULLY.code,
				ResponseCodes.WITHDRAWAL_REQUEST_INITIATED_SUCCESSFULLY.message,
				paymentWithdrawalRequest,
			);
		} catch (error) {
			// Throw error if encountered during withdrawal processing
			throw error;
		}
	}

	private async processManualWithdrawal(
		data: Partial<IPaymentWithdrawalRequestLog>,
	): Promise<IPaymentWithdrawalRequestLog> {
		try {
			const paymentWithdrawalRequest =
				await this.paymentWithdrawalRequestLogDao.createPaymentWithdrawalRequestLog(
					data,
				);

			return paymentWithdrawalRequest;
		} catch (error) {
			throw error;
		}
	}

	public async processInstantWithdrawal() {}

	/**
	 * Process withdrawal based on the provided details.
	 * @param body The withdrawal details.
	 * @returns The withdrawal response.
	 */
	// public async WithdrawalProcessing(
	// 	paymentDetails: PaymentDetails,
	// ): Promise<Response> {
	// 	const { error, value } = paymentSchema.validate(paymentDetails);
	// 	if (error) {
	// 		const responseCode = generateResponseCode(error);
	// 		if (responseCode) {
	// 			if ('message' in responseCode && 'code' in responseCode) {
	// 				// Return a response with the generated response code
	// 				console.log(`responseCode`, responseCode.message);

	// 				return new Response(responseCode.code, responseCode.message);
	// 			}
	// 		}
	// 	}
	// 	// Retrieve configuration settings
	// 	const config = await this.configDao.findOne();

	// 	// Check withdrawal type
	// 	if (config.withdrawalType == 'manual') {
	// 		// If withdrawal type is 'manual', use ManualWithdrawalService to process withdrawal
	// 		const ManualWithdrawal = Container.get(ManualWithdrawalService);
	// 		const paymentResponse =
	// 			await ManualWithdrawal.createManualRefundRequest(paymentDetails);
	// 		return paymentResponse;
	// 	} else {
	// 		return new Response(
	// 			ResponseCodes.ERR_INVALID_WITHDRAWAL_TYPE.code,
	// 			ResponseCodes.ERR_INVALID_WITHDRAWAL_TYPE.message,
	// 		);
	// 	}
	// }

	/**
	 * Search for an item in the priority list by name.
	 * @param array1 The priority list.
	 * @param name The name to search for.
	 * @returns The matching priority item.
	 */
	private searchByName(array1: Priority[], name: string): Priority {
		return array1.find((item) => item.name === name);
	}

	private hasVipAndDiamondTags(player: IPlayer) {
		// Check if the "tags" property exists and is an array
		if (Array.isArray(player.tags)) {
			// Check if both "VIP" and "DIAMOND" are included in the tags array
			return player.tags.includes('VIP') || player.tags.includes('DIAMOND');
		}
		return false; // Return false if "tags" property is missing or not an array
	}

	/**
	 * Search for an item in the priority list based on limits.
	 * @param array1 The priority list.
	 * @param limits The limits to search for.
	 * @returns The matching priority item.
	 */
	private searchByOrder(array1: Priority[], limits: number): Priority {
		return array1.find(
			(item) =>
				Number(item.limits) >= limits &&
				Number(item.maxLimits) > limits &&
				item.active == true,
		);
	}

	private searchPaymentGatewayWhichSupportsWithdrawal(
		priority: Priority[],
	): Priority {
		return priority.find((item) => item.withdrawalSupported === true);
	}
}
