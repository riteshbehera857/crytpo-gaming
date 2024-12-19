import axios, { isAxiosError } from 'axios';
import { Service } from 'typedi';
import config from '../../common/config';
import { ResponseCodes } from '../../common/config/responseCodes';
import { Response } from '../../common/config/response';
import { createHash } from 'node:crypto';
import { JwtService } from '../../core/services/jwt.service';
import jwt from 'jsonwebtoken';
import { ExternalTransactionDao } from '../daos/externalTransactionDao';

@Service()
class ExternalPGService {
	private externalTransactionDao: ExternalTransactionDao;

	constructor() {
		this.externalTransactionDao = new ExternalTransactionDao();
	}

	public async authenticate(
		authenticationData: Record<string, string>,
		authenticationQuery: Record<string, string>,
	) {
		try {
			const signature = this.generateSignature(authenticationQuery);

			const decodedTokenDetails = await this.getTokenDetails(
				authenticationData,
				signature,
			);

			if (!decodedTokenDetails) {
				return new Response(
					ResponseCodes.POKER_SERVER_TOKEN_DETAILS_NOT_FOUND.code,
					ResponseCodes.POKER_SERVER_TOKEN_DETAILS_NOT_FOUND.message,
				);
			}

			const user = await this.getUserById(
				decodedTokenDetails[0].attributes['user-id'],
			);

			console.log(
				'++++++++++++++++++++++++++++++++++++++++++++',
				user.data[0],
			);

			const invalidUsername = /\d/.test(user.data[0]?.attributes.nick);

			if (invalidUsername) {
				return new Response(
					ResponseCodes.INVALID_USER_NAME.code,
					ResponseCodes.INVALID_USER_NAME.message,
				);
			}

			const token = this.generateToken({
				city: user.data[0]?.attributes.city,
				country: user.data[0]?.attributes.country,
				customerName: user.data[0]?.attributes.nick,
				email: user.data[0]?.attributes.email,
				mobileNumber: user.data[0]?.attributes['phone-number'].toString(),
				state: user.data[0]?.attributes.state,
				userId: user.data[0]?.attributes.id.toString(),
				zipCode: user.data[0]?.attributes['zip-code'].toString(),
			});

			console.log('Token--------------------------', { token });

			return new Response(
				ResponseCodes.POKER_SERVER_TOKEN_DETAILS_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.POKER_SERVER_TOKEN_DETAILS_FETCHED_SUCCESSFULLY.message,
				{ token },
			);
		} catch (error) {
			throw error;
		}
	}

	private generateToken(data: any) {
		return jwt.sign(data, config.jwtSecret, {
			algorithm: 'HS256',
			expiresIn: '1h',
		});
	}

	private async getTokenDetails(
		authenticationData: Record<string, string>,
		signature: string,
	) {
		try {
			console.log({
				URL: `${config.pokerServer.baseUrl}/v2/app/tokens/${authenticationData.auth}?clientId=${config.pokerServer.clientId}`,
			});

			const response = await axios.get(
				`
${config.pokerServer.baseUrl}/v2/app/tokens/${authenticationData.auth}?clientId=${config.pokerServer.clientId}`,
				{
					headers: {
						sign: signature,
					},
				},
			);

			console.log({
				GETTOKENDETAILS: JSON.stringify(response.data.data),
			});

			return response.data.data;
		} catch (error) {
			throw error;
		}
	}

	public async getUserById(userId: string) {
		try {
			console.log('Get user by query-----------------------------', userId);

			const signature = this.generateSignature({
				userId,
				clientId: config.pokerServer.clientId,
			});

			console.log({
				GETUSER_URL: `${config.pokerServer.baseUrl}/v2/app/users/${userId}?clientId=${config.pokerServer.clientId}`,
			});

			// TODO: Add it to env config
			const user = await axios.get(
				`${config.pokerServer.baseUrl}/v2/app/users/${userId}?clientId=${config.pokerServer.clientId}`,
				{
					headers: {
						sign: signature,
					},
				},
			);

			console.log({ user: JSON.stringify(user.data) });

			return user.data;
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(
					'-------------------------------------',
					JSON.stringify({ ERROR: error.response.data }),
				);
			}
			throw error;
		}
	}

	public async updateUserBalance(transaction: Record<string, any>) {
		try {
			const { userId, currency, amount, externalTransactionId } =
				transaction;

			const clientId = config.pokerServer.clientId;

			const signature = this.generateSignature({
				clientId,
				userId,
				currency: 'RUBY',
				amount,
				externalTransactionId,
			});

			console.log(
				'---------------------',
				{
					updateUserBalanceURL: `${config.pokerServer.baseUrl}/v2/app/users/${userId}/wallet/deposit?clientId=${clientId}&currency=${currency}&amount=${amount}&externalTransactionId=${externalTransactionId}`,
				},
				'---------------------',
			);

			console.log(
				'---------------------------Request Body-----------------------',
				{
					amount,
					currency,
					externalTransactionId,
				},
			);

			const response = await axios.post(
				`${config.pokerServer.baseUrl}/v2/app/users/${userId}/wallet/deposit?clientId=${clientId}&currency=RUBY&amount=${amount}&externalTransactionId=${externalTransactionId}`,
				{
					amount: amount,
					currency: 'RUBY',
					externalTransactionId: externalTransactionId,
				},
				{
					headers: {
						sign: signature,
					},
				},
			);

			return response.data.data;
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(
					'Update user balance error____________________________',
					{ Error: JSON.stringify(error.response.data) },
				);
			}
			throw error;
		}
	}

	public async getTransactionByOrderId(orderId: string) {
		try {
			const transaction =
				await ExternalTransactionDao.getTransactionByOrderId(orderId);

			return new Response(
				ResponseCodes.EXTERNAL_TRANSACTION_FETCHED_SUCCESSFULLY.code,
				ResponseCodes.EXTERNAL_TRANSACTION_FETCHED_SUCCESSFULLY.message,
				transaction,
			);
		} catch (error) {
			throw error;
		}
	}

	private generateSignature(authenticationQuery: Record<string, string>) {
		if ('clientId' in authenticationQuery) {
			delete authenticationQuery['clientId'];
		}

		const sortedQuery = this.sortObjectRecursive(authenticationQuery);

		const queryString = this.implodeRecursive(sortedQuery);

		const queryStringWithSecret = queryString + config.pokerServer.secretKey;

		const signature = this.generateSHA256Signature(queryStringWithSecret);

		return signature;
	}

	private sortObjectRecursive(obj: Record<string, any>): Record<string, any> {
		const keys = Object.keys(obj).sort();
		const sortedObject: Record<string, any> = {};

		keys.forEach((key) => {
			const value = obj[key];
			if (value instanceof Object || value instanceof Array) {
				sortedObject[key] = this.sortObjectRecursive(value);
			} else {
				sortedObject[key] = value;
			}
		});

		return sortedObject;
	}

	private implodeRecursive(obj: Record<string, any>, separator = ''): string {
		let str = '';

		for (const key in obj) {
			if (!obj.hasOwnProperty(key)) {
				continue;
			}

			const value = obj[key];
			if (value instanceof Object || value instanceof Array) {
				str += this.implodeRecursive(value, separator) + separator;
			} else {
				str += value + separator;
			}
		}

		return str.substring(0, str.length - separator.length);
	}

	private generateSHA256Signature(string: string): string {
		const hash = createHash('sha256');

		hash.update(string);

		return hash.digest('hex');
	}
}

export { ExternalPGService };
