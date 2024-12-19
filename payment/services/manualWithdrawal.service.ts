// Import getLogger from "../logger";
import { Service } from 'typedi';
import { TransactionStatusEnum } from '../../common/types/transactionStatus';
import { TransactionEnumPayment } from '../../common/types/transaction';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { TransactionDao } from '../daos/transactionDao';
import { PaymentRequestDao } from '../daos/paymentRequestLogDao';
import { IPlayer } from '../../common/interfaces/player.interface';
import { ConfigDao } from '../daos/configDao';
import { IPaymentWithdrawal } from '../../common/interfaces/paymentWithdrawal';
import {
	PaymentDetails,
	UpdateDetailsBody,
	WithdrawalRequestBody,
} from '../../common/interfaces/payment.service.interface';
import { createManualRefundRequest } from '../../common/schemas/createManualRefundRequest.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { manualWithdrawalDataValidate } from '../../common/schemas/manualWithDrawalData.schema';

// Define interfaces for the request body and update details

@Service()
export class ManualWithdrawalService {
	private transactionDao;
	private configDao;
	private paymentRequestDao;
	private paymentResponseDao;
	constructor() {
		this.transactionDao = new TransactionDao();
		this.paymentRequestDao = new PaymentRequestDao();
		// this.paymentResponseDao = new PaymentResponseDao();
		this.configDao = new ConfigDao();
	}

	// Method to create a manual refund request
	public async createManualRefundRequest(
		withdrawalRequest: PaymentDetails,
	): Promise<Response> {
		// Fetch config data
		const config = await this.configDao.findOne();

		// Calculate amount with commission
		const amountWithCommission = (
			withdrawalRequest.amount! -
			(withdrawalRequest.amount! / 100) * config!.withdrawalCommission
		).toFixed(2);
		const request = await this.paymentRequestDao.create(
			withdrawalRequest,
			this.generateUniqueReferenceId(),
			'createManualRefundRequest',
		);
		const withdrawal = await this.transactionDao.createManualRefund(
			withdrawalRequest,
			TransactionStatusEnum.PENDING,
			TransactionEnumPayment.Withdrawal,
			request.id,
			request.id,
			amountWithCommission,
			'manual_refund',
		);
		// Create withdrawal record
		return new Response(
			ResponseCodes.MANUAL_REFUND_GENERATED_SUCCESS.code,
			ResponseCodes.MANUAL_REFUND_GENERATED_SUCCESS.message,
			{ withdrawal },
		);
	}

	// Method to get all withdrawal records
	public async getWithdrawal() {
		const withdrawal = await this.transactionDao.findWithdrawal({});
		return withdrawal;
	}

	// Method to update withdrawal status and note
	public async manualWithdrawal(manualWithdrawalData: UpdateDetailsBody) {
		const { error, value } =
			manualWithdrawalDataValidate.validate(manualWithdrawalData);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}
		try {
			const withdrawal = await this.transactionDao.findOne(
				manualWithdrawalData.id,
			);

			// If withdrawal record not found, throw error
			if (!withdrawal) {
				return new Response(
					ResponseCodes.WITHDRAWAL_PAYMENT_DETAILS_NOT_FOUND.code,
					ResponseCodes.WITHDRAWAL_PAYMENT_DETAILS_NOT_FOUND.message,
				);
			}
			// Update withdrawal record
			await this.transactionDao.updateManualRefund(
				withdrawal._id,
				manualWithdrawalData.status,
				manualWithdrawalData.note,
			);
			// Return success response

			return new Response(
				ResponseCodes.WITHDRAWAL_PAYMENT_DETAILS_UPDATED_SUCCESS.code,
				ResponseCodes.WITHDRAWAL_PAYMENT_DETAILS_UPDATED_SUCCESS.message,
				{},
			);
		} catch (error) {
			return new Response(
				ResponseCodes.ERR_WHILE_UPDATE_MANUAL_PAYMENT.code,
				ResponseCodes.ERR_WHILE_UPDATE_MANUAL_PAYMENT.message,
			);
		}
	}

	// Method to generate a unique reference ID
	private generateUniqueReferenceId(): string {
		const timestamp: string = Date.now().toString(); // Get current timestamp
		const random: string = Math.floor(Math.random() * 1000000)
			.toString()
			.padStart(6, '0'); // Generate random 6-digit number
		const referenceId: string = timestamp + random; // Combine timestamp and random number
		return referenceId;
	}
}
