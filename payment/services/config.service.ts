import Container, { Inject, Service } from 'typedi';
import getLogger from '../../common/logger';
import { Response } from '../../common/config/response';

import { ResponseCodes } from '../../common/config/responseCodes';
import { ConfigDao } from '../daos/configDao';
import { IConfig } from '../../common/interfaces/config.interface';
import { configSchema } from '../../common/schemas/config.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { Priority } from '../../common/interfaces/payment.service.interface';

// Define the type for the priority object
// type Priority = {
// 	name: string;
// 	limits: string;
// 	active: boolean;
// 	paymentType: string[];
// 	maxLimits:string;
// 	createdAt: Date; // You may want to use Date instead of string
// 	updatedAt: Date; // You may want to use Date instead of string
// };

@Service()
export class ConfigService {
	private logger = getLogger(module);
	private configDao;
	private config;

	constructor() {
		this.configDao = new ConfigDao();
		this.config = this.configDao.findOne();
	}

	// Method to get the configuration
	public async getConfig(): Promise<Response> {
		const config = await this.config as unknown as IConfig;
		if (!config) {
			// throw new ApiError('Config not exit', 400, 'ERR_INVALID_CONFIG');
			return new Response(
				ResponseCodes.ERR_CONFIG_NOT_EXIT.code,
				ResponseCodes.ERR_CONFIG_NOT_EXIT.message,
			);
		}
		return new Response(
			ResponseCodes.GET_CONFIG_SUCCESSFUL.code,
			ResponseCodes.GET_CONFIG_SUCCESSFUL.message,
			config,
		);
	}

	// Method to update the configuration
	public async updateConfig(configData: IConfig): Promise<Response> {
		const { error, value } = configSchema.validate(configData);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}
		// Retrieve the existing config data
		const allConfigData = await this.config as unknown as IConfig;
		const priority: Priority[] = allConfigData.priority;

		// Filter the provided priority to ensure it matches the existing one
		const validPriority = value.priority.filter((element) =>
			this.checkIsPayment(element.name, priority),
		);

		if (validPriority.length !== priority.length) {
			return new Response(
				ResponseCodes.INVALID_PRIORITY.code,
				ResponseCodes.INVALID_PRIORITY.message,
			);
		}

		// Check if payment types match with existing configuration
		if (!this.paymentTypeAreEqual(priority, value.priority)) {
			return new Response(
				ResponseCodes.INVALID_PAYMENT.code,
				ResponseCodes.INVALID_PAYMENT.message,
			);
		}

		// Update the configuration in the database
		await this.configDao.update(value, validPriority);

		// Return the updated configuration
		const config = (await this.config) as unknown as IConfig;
		return new Response(
			ResponseCodes.CONFIG_UPDATE_SUCCESS.code,
			ResponseCodes.CONFIG_UPDATE_SUCCESS.message,
			config,
		);
	}

	// Helper method to check if a payment is valid based on name
	private checkIsPayment(
		paymentName: string,
		paymentData: Priority[],
	): boolean {
		return paymentData.some((element) => {
			if (element.name === paymentName) {
				return true;
			}
		});
	}

	// Helper method to check if payment types are equal
	private paymentTypeAreEqual(
		array1: Priority[],
		array2: Priority[],
	): boolean {
		return array1.every((element, index) => {
			const paymentType: Priority = this.searchByName(array2, element.name);
			return this.arraysAreEqual(
				paymentType.paymentType,
				element.paymentType,
			);
		});
	}

	// Helper method to search for a payment by name
	private searchByName(array1: Priority[], name: string): Priority {
		return array1.find((item) => item.name === name);
	}

	// Helper method to check if arrays are equal
	private arraysAreEqual(array1: string[], array2: string[]): boolean {
		return (
			array1.length === array2.length &&
			array1.every((element, index) => element === array2[index])
		);
	}
}
