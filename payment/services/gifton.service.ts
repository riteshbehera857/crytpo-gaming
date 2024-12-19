import Container, { Service } from 'typedi';
import axios from 'axios';
import getLogger from '../../common/logger';
import { Model, Schema } from 'mongoose';

import { TransactionStatusEnum } from '../../common/types/transactionStatus';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { PaymentRequestDao } from '../daos/paymentRequestLogDao';
import { TransactionDao } from '../daos/transactionDao';
import * as crypto from 'crypto';
import config from '../../common/config';
import { ConfigDao } from '../daos/configDao';
import { IConfig } from '../../common/interfaces/config.interface';
import { Config } from '../models/config.model';
import {
	PaymentDetails,
	PaymentObject,
} from '../../common/interfaces/payment.service.interface';
import { giftonSchema } from '../../common/schemas/gifton.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { IPaymentRequestLog } from '../../common/interfaces/paymentRequestLog.interface';
import md5 from 'md5';
import {
	ITransaction,
	ITransactionDetailsForPayments,
} from '../../common/interfaces/transaction.interface';
import { CurrencyEnum } from '../../common/types/currency';
import { errorMap } from '../../common/config/paymentErrorMap';
import TransactionService from '../../wallet/services/transaction.service';
import { IExternalTransaction } from '../../common/interfaces/externalTransaction.interface';
import { TransactionEnum } from '../../common/types/transaction';
import { ExternalTransactionDao } from '../daos/externalTransactionDao';
import { ExternalPGService } from './externalPG.service';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { EventTypes, SubTypes } from '../../common/interfaces/event.interface';
import { IMessage } from '../../notifications/interfaces/message';
import { PublisherService } from '../../notifications/services/publisher.service';

@Service()
export class GiftonPaymentService {
	// Initialize logger, base URL, client secret, and program ID
	private logger = getLogger(module);
	private BASE_URL = config.giftonConnection.baseUrl; // Replace 'your_base_url_here' with your actual base URL
	private clientSecret = config.giftonConnection.clientSecret; // Replace 'your_client_secret_here' with your actual client secret
	private programId = config.giftonConnection.programId; // Replace 'your_program_id_here' with your actual program ID
	private apiKey = config.giftonConnection.apiKey; // Replace 'your_program_id_here' with your actual program ID
	private salt = config.giftonConnection.salt; // Replace 'your_program_id_here' with your actual program ID

	private skillzLiveApiKey = config.skillzLive.apiKey;
	private skillzLiveSalt = config.skillzLive.salt;

	private configModel: Model<IConfig>;
	private paymentRequestDao: PaymentRequestDao;
	private paymentResponseDao;
	private transactionDao: TransactionDao;
	private configDao: ConfigDao;
	private config;
	private transactionService: TransactionService;
	private commonPlayerDao: CommonPlayerDao;
	private publisherService: PublisherService;

	constructor() {
		// Get repository instances from dataSource
		this.configModel = Config;
		this.configDao = new ConfigDao();
		this.config = this.configDao.findOne();
		this.paymentRequestDao = new PaymentRequestDao();
		this.transactionDao = new TransactionDao();
		this.transactionService = new TransactionService();
		this.commonPlayerDao = new CommonPlayerDao();
		this.publisherService = new PublisherService();
	}

	public async getPaymentUrl(
		payment: PaymentDetails,
		skin: string,
		customerCode: string,
	): Promise<Response> {
		const { error, value } = giftonSchema.validate(payment);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		let paymentUrl: string;

		if (skin && skin == 'crashncash') {
			paymentUrl = await this.getPaymentUrlForCrashncashSkin(payment);
		} else if (!skin && customerCode == 'skillz.live') {
			paymentUrl = await this.getPaymentUrlForSkillzliveCustomer(
				payment,
				customerCode,
			);
		}

		// const configModel = await this.config;

		return new Response(
			ResponseCodes.PAYMENT_URL_GENERATE_SUCCESS.code,
			ResponseCodes.PAYMENT_URL_GENERATE_SUCCESS.message,
			paymentUrl,
		);
	}

	public async getPaymentUrlForCrashncashSkin(
		payment: PaymentDetails,
		customerCode?: string,
	): Promise<string> {
		try {
			const requestData: Partial<IPaymentRequestLog['requestData']> = {
				amount: payment.amount,
				customerName: payment.customerName,
				country: payment.country,
				state: payment.state,
				zipCode: parseInt(payment.zipCode),
				city: payment.city,
				email: payment.email,
				mobileNumber: parseInt(payment.mobileNumber),
			};

			// Prepare payment request object
			const paymentRequest: Partial<IPaymentRequestLog> = {
				user: payment.userId,
				requestType: payment.transactionType,
				requestData,
				referenceId: this.generateUniqueReferenceId(
					payment.userId as unknown as string,
				),
			};

			this.paymentRequestDao.create(paymentRequest);

			const return_url = `${config.giftonConnection.redirectUrl}/payment-success?order_id=${paymentRequest.referenceId}`;

			const paymentObject = {
				order_id: paymentRequest.referenceId,
				amount: payment.amount.toString(),
				currency: 'INR',
				udf1: payment.userId.toString(),
				udf2: 'crashncash',
				...(payment.bonusCode ? { udf3: payment.bonusCode } : {}),
				description: 'payment fro user',
				name: payment.customerName,
				email: payment.email,
				phone: payment.mobileNumber,
				city: payment.city,
				state: payment.state,
				country: payment.country,
				zip_code: payment.zipCode,
				// show_convenience_fee: configModel.depositCommission,
				return_url: return_url,
				return_url_failure: `${config.giftonConnection.redirectUrl}/payment-failure`,
				return_url_cancel: `${config.giftonConnection.redirectUrl}/payment-cancelled`,

				api_key: this.apiKey,
				mode: 'LIVE',
			};

			console.log({ paymentObject });

			// Get payment URL from external service
			const paymentUrl = await this.getPaymentUrlFromData(
				paymentObject,
				this.salt,
			);

			return paymentUrl as unknown as string;
		} catch (error) {
			throw error;
		}
	}

	public async getPaymentUrlForSkillzliveCustomer(
		payment: PaymentDetails,
		customerCode: string,
	) {
		try {
			// const requestData: Partial<IPaymentRequestLog['requestData']> = {
			// 	amount: payment.amount,
			// 	customerName: payment.customerName,
			// 	country: payment.country,
			// 	state: payment.state,
			// 	zipCode: parseInt(payment.zipCode),
			// 	city: payment.city,
			// 	email: payment.email,
			// 	mobileNumber: parseInt(payment.mobileNumber),
			// };

			const order_id = this.generateUniqueReferenceId(
				payment.userId as unknown as string,
			);

			const return_url = `${config.skillzLive.redirectUrl}/payment/status?order_id=${order_id}`;
			const failure_url = `${config.skillzLive.redirectUrl}/payment-failure?order_id=${order_id}`;
			const cancel_url = `${config.skillzLive.redirectUrl}/payment-cancelled?order_id=${order_id}`;

			const paymentObject = {
				order_id: order_id,
				amount: payment.amount.toString(), //2
				currency: 'INR',
				udf1: payment.userId.toString(),
				udf2: customerCode,
				description: 'payment fro user',
				name: payment.customerName,
				email: payment.email.toLowerCase(),
				phone: payment.mobileNumber,
				city: payment.city,
				state: payment.state,
				country: payment.country,
				zip_code: payment.zipCode,
				// show_convenience_fee: configModel.depositCommission,
				return_url: return_url,
				return_url_failure: failure_url,
				return_url_cancel: cancel_url,

				api_key: this.skillzLiveApiKey,
				mode: 'LIVE',
			};

			console.log({ paymentObject });
			console.log({ salt: this.skillzLiveSalt });

			const paymentUrl = await this.getPaymentUrlFromData(
				paymentObject,
				this.skillzLiveSalt,
			);

			return paymentUrl as unknown as string;
		} catch (error) {
			throw error;
		}
	}

	private async getPaymentUrlFromData(
		payment: PaymentObject,
		salt: string,
	): Promise<Response> {
		const { error, value } = giftonSchema.validate(payment);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}
		// Check if payment object is valid
		if (!payment) {
			return new Response(
				ResponseCodes.INVALID_PAYMENT_DETAILS.code,
				ResponseCodes.INVALID_PAYMENT_DETAILS.message,
			);
		}

		console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++', {
			...payment,
			hash: this.generateHash(payment, salt),
		});

		try {
			// Send POST request to external service to generate payment URL
			const response = await axios.post(
				`${this.BASE_URL}/v2/getpaymentrequesturl`,
				{
					...payment,
					hash: this.generateHash(payment, salt),
				},
				{
					headers: {
						client_secret: this.clientSecret,
						program_id: this.programId,
					},
				},
			);

			return response.data;
		} catch (error) {
			return new Response(
				ResponseCodes.PAYMENT_GATEWAY_ERROR.code,
				ResponseCodes.PAYMENT_GATEWAY_ERROR.message,
			);
		}
	}

	public async capturePayment(
		payment: Record<string, string>,
	): Promise<Response> {
		const { error, value } = giftonSchema.validate(payment);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		this.logger.info(`Payment captured request: ${JSON.stringify(payment)}`);
		// if (!this.responseHashCheck(this.salt, payment)) {
		// 	await this.paymentResponseDao.create(
		// 		payment,
		// 		payment.order_id,
		// 		'hatchNotMatch',
		// 	);
		// 	return new Response(
		// 		ResponseCodes.ERR_WHILE_AUTHENTICATE_PAYMENT_GETAWAY.code,
		// 		ResponseCodes.ERR_WHILE_AUTHENTICATE_PAYMENT_GETAWAY.message,
		// 	);
		// }
		try {
			const paymentRequestLog =
				await this.paymentRequestDao.getRequestByReferenceId({
					referenceId: payment.order_id,
				});

			const config = await this.config;

			const amountWithCommission = (
				parseInt(payment.amount!) -
				(parseInt(payment.amount!) / 100) * config!.depositCommission
			).toFixed(2);

			// Log payment response
			// const response = await this.paymentResponseDao.create(
			// 	payment,
			// 	payment.order_id,
			// 	'capturePaymentResponse',
			// );

			// Save payment response
			if (payment.response_code == '0') {
				if (payment.udf2 == 'skillz.live') {
					const externalTransactionData: Partial<IExternalTransaction> = {
						amount: parseInt(payment.amount),
						currency: payment.currency as CurrencyEnum,
						customerId: payment.udf2,
						details: {
							paymentGateway: 'gifton',
							amountWithCommission: parseInt(amountWithCommission),
							orderId: payment.order_id,
							paymentTransactionId: payment.transaction_id,
						},
						isTransactionSuccess: true,
						userId: payment.udf1,
						transactionType: TransactionEnum.DEPOSIT,
					};

					const response =
						await ExternalTransactionDao.createExternalTransaction(
							externalTransactionData,
						);

					const externalPGService = Container.get(ExternalPGService);

					const skillzLiveUpdatedUserTransaction =
						await externalPGService.updateUserBalance({
							userId: payment.udf1,
							currency: response.currency,
							amount: response.amount,
							externalTransactionId:
								response.details.paymentTransactionId,
						});

					console.log({ skillzLiveUpdatedUserTransaction });

					return new Response(
						ResponseCodes.PAYMENT_CAPTURE_SUCCESS.code,
						ResponseCodes.PAYMENT_CAPTURE_SUCCESS.message,
						payment,
					);
				}

				const player = await this.commonPlayerDao.getPlayerById(
					payment.udf1,
				);

				const openingBalance = player.currentBalance;
				const closingBalance = openingBalance + parseInt(payment.amount);

				// Update the payment request update data
				const updatePaymentRequestData: Partial<IPaymentRequestLog> = {
					transactionId: payment.transaction_id,
					isPending: false,
					transactionCompletedAt: new Date(Date.now()),
					status: TransactionStatusEnum.SUCCESS,
				};

				const paymentRequestLog =
					await this.paymentRequestDao.updatePaymentRequestLogByReferenceId(
						payment.order_id,
						updatePaymentRequestData,
					);

				const transactionData: Partial<
					ITransaction<ITransactionDetailsForPayments>
				> = {
					player: payment.udf1 as unknown as Schema.Types.ObjectId,
					openingBalance: openingBalance,
					closingBalance: closingBalance,
					amount: parseInt(payment.amount),
					currency: payment.currency as CurrencyEnum,
					transactionType: paymentRequestLog.requestType,
					isTransactionSuccess: true,
					details: {
						paymentMethod: payment.payment_method,
						paymentGateway: 'gifton',
						amountWithCommission: parseInt(amountWithCommission),
						orderId: payment.order_id,
						paymentTransactionId: payment.transaction_id,
					},
				};

				const transaction =
					await this.transactionDao.create(transactionData);

				const response = await this.transactionService.createTransaction(
					{
						amount: transaction.amount,
						transactionType: transaction.transactionType,
						details: {
							requestUuid: paymentRequestLog._id as unknown as string,
							transactionUuid: paymentRequestLog.transactionId,
						},
						currency: transaction.currency,
					},
					transaction.player,
				);

				const depositEvent: IMessage = {
					type: EventTypes.WALLET,
					subType: SubTypes.DEPOSIT,
					ts: Date.now(),
					userId: player._id as unknown as string,
					payload: {
						playerId: player._id,
						amount: transaction.amount,
						currency: transactionData.currency,
						...(payment.udf3 != '' ? { code: payment.udf3 } : {}),
						status: 'SUCCESS',
						timestamp: new Date(),
						message: 'Deposit successful',
					},
				};

				await this.publisherService.publishMessage(
					depositEvent,
					'notification',
				);

				this.logger.info(
					`amount of ${payment.amount} is captured. transaction id ${transaction._id}`,
				);
				return new Response(
					ResponseCodes.PAYMENT_CAPTURE_SUCCESS.code,
					ResponseCodes.PAYMENT_CAPTURE_SUCCESS.message,
					payment,
				);
			} else {
				if (payment.udf2 == 'skillz.live') {
					const externalTransactionData: Partial<IExternalTransaction> = {
						amount: parseInt(payment.amount),
						currency: payment.currency as CurrencyEnum,
						customerId: payment.udf2,
						details: {
							paymentGateway: 'gifton',
							amountWithCommission: parseInt(amountWithCommission),
							orderId: payment.order_id,
							paymentTransactionId: payment.transaction_id,
						},
						isTransactionSuccess: false,
						userId: payment.udf1,
						transactionType: TransactionEnum.DEPOSIT,
						reasonOfFailure: {
							errorCode: payment.response_code,
							errorName: errorMap.get(parseInt(payment.response_code)),
							errorDesc: payment.error_desc,
						},
					};

					const response =
						await ExternalTransactionDao.createExternalTransaction(
							externalTransactionData,
						);

					// const externalPGService = Container.get(ExternalPGService);

					// const skillzLiveUpdatedUserTransaction =
					// 	await externalPGService.updateUserBalance({
					// 		userId: payment.udf1,
					// 		currency: response.currency,
					// 		amount: response.amount,
					// 		externalTransactionId:
					// 			response.details.paymentTransactionId,
					// 	});

					// console.log({ skillzLiveUpdatedUserTransaction });

					return new Response(
						ResponseCodes.PAYMENT_FAILED.code,
						ResponseCodes.PAYMENT_FAILED.message,
					);
				}

				const updatePaymentRequestData: Partial<IPaymentRequestLog> = {
					transactionId: payment.transaction_id,
					isPending: false,
					transactionCompletedAt: new Date(Date.now()),
					status: TransactionStatusEnum.FAIL,
					reasonOfFailure: {
						errorCode: payment.response_code,
						errorName: errorMap.get(parseInt(payment.response_code)),
						errorDesc: payment.error_desc,
					},
				};

				const paymentRequestLog =
					await this.paymentRequestDao.updatePaymentRequestLogByReferenceId(
						payment.order_id,
						updatePaymentRequestData,
					);

				const transactionData: Partial<
					ITransaction<ITransactionDetailsForPayments>
				> = {
					player: payment.udf1 as unknown as Schema.Types.ObjectId,
					amount: parseInt(payment.amount),
					currency: payment.currency as CurrencyEnum,
					transactionType: paymentRequestLog.requestType,
					isTransactionSuccess: false,
					details: {
						paymentMethod: payment.payment_method,
						paymentGateway: 'gifton',
						amountWithCommission: parseInt(amountWithCommission),
						orderId: payment.order_id,
						paymentTransactionId: payment.transaction_id,
					},
				};

				const deposit = await this.transactionDao.create(transactionData);
				this.logger.info(
					`amount of ${payment.amount} is captured Error. transaction id ${deposit._id}`,
				);
				return new Response(
					ResponseCodes.ERR_WHILE_CAPTURE_PAYMENT_EXIT.code,
					ResponseCodes.ERR_WHILE_CAPTURE_PAYMENT_EXIT.message,
				);
			}
		} catch (error) {
			this.logger.info(`Payment captured Error: ${error}`);
			this.paymentResponseDao.create(
				payment,
				payment.order_id,
				'capturePaymentResponseError',
			);
			return new Response(
				ResponseCodes.ERR_WHILE_CAPTURE_PAYMENT_EXIT.code,
				ResponseCodes.ERR_WHILE_CAPTURE_PAYMENT_EXIT.message,
			);
		}
	}

	/**
	 * Generates a unique reference ID by combining current timestamp with a random 6-digit number.
	 * @returns The generated unique reference ID.
	 */

	private generateUniqueReferenceId(param: string): string {
		// Get current timestamp
		const timestamp: string = new Date(Date.now()).getTime().toString();

		// Combine timestamp and random number to create unique reference ID
		const referenceId: string = md5(timestamp + param);
		return referenceId;
	}

	private generateHash(
		parameters: Record<string, string>,
		salt: string,
		hashingMethod: string = 'sha512',
	): string {
		let secureHash: string | null = null;
		const hashData: string[] = [salt];

		Object.keys(parameters)
			.sort()
			.forEach((key) => {
				const value = parameters[key];
				// if (value.toString().trim().length > 0) {
				hashData.push(value);
				// }
			});

		const concatenatedData = hashData.join('|');

		if (concatenatedData.length > 0) {
			secureHash = crypto
				.createHash(hashingMethod)
				.update(concatenatedData)
				.digest('hex')
				.toUpperCase();
		}

		return secureHash;
	}
	private sha512(data: string): string {
		const hash = crypto
			.createHash('sha512')
			.update(data)
			.digest('hex')
			.toUpperCase();
		return hash;
	}
	private hashCalculate(salt: string, input: Record<string, any>): string {
		const hashColumns = Object.keys(input).sort();
		let hashData = salt;

		for (const column of hashColumns) {
			if (
				input[column] !== undefined &&
				input[column] !== null &&
				input[column].toString().trim().length > 0
			) {
				hashData += '|' + input[column].toString().trim();
			}
		}

		const hash = this.sha512(hashData);
		return hash;
	}
	private responseHashCheck(
		salt: string,
		responseArray: Record<string, any>,
	): boolean {
		// If hash field is null no need to check hash for such response
		if (responseArray.hash === null) {
			return true;
		}

		const responseHash = responseArray.hash;
		const inputWithoutHash: Record<string, any> = { ...responseArray };
		delete inputWithoutHash.hash;

		// Now we have response json without the hash
		const calculatedHash = this.hashCalculate(salt, inputWithoutHash);
		return responseHash === calculatedHash;
	}
}
