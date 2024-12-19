import { Service } from 'typedi';
import { RedisClientType, createClient } from 'redis';
import { Logger } from 'winston';
import getLogger from '../../common/logger';
import config from '../../common/config';

@Service()
class RedisService {
	private static instance: RedisService;
	private logger: Logger;
	private client: RedisClientType;

	constructor() {
		const tlsEnabled =
			config.redis.tls.toLowerCase() === 'false' ? false : true;

		this.logger = getLogger(module);
		this.client = createClient({
  url : "rediss://default:********@humorous-feline-22987.upstash.io:6379"
});
	}

	public static getInstance(): RedisService {
		if (!RedisService.instance) {
			RedisService.instance = new RedisService();
		}

		return RedisService.instance;
	}

	public async connect() {
		this.client.on('error', (error) => {
			this.logger.error(`Error connecting to redis: ${error}`);
		});

		this.logger.info(`Connecting to redis`);
		await this.client.connect();
		this.logger.info(`Connected to redis`);
	}

	public getClient(): RedisClientType {
		return this.client;
	}

	public async createSession(data: Record<string, any>): Promise<string> {
		const session = await this.client.set(
			`session-${data.phoneNumber}`,
			JSON.stringify({
				phoneNumber: data.phoneNumber,
				deviceId: data.deviceId,
				isActive: true,
			}),
		);

		return session;
	}

	public async getSession(phoneNumber: string): Promise<string> {
		const session = await this.client.get(`session-${phoneNumber}`);
		return session;
	}

	// public async getSessionByPhoneNumber(
	// 	phoneNumber: string,
	// ): Promise<Record<string, any>> {
	// 	const pattern = `session-${phoneNumber}-*`;
	// 	const regex = new RegExp(`^session-${phoneNumber}-[\\w-]+$`);
	// 	let cursor = 0;
	// 	let sessionKey: string | null = null;

	// 	do {
	// 		const reply = await this.client.scan(cursor, {
	// 			MATCH: pattern,
	// 			COUNT: 100, // Adjust the COUNT as needed
	// 		});
	// 		cursor = reply.cursor;
	// 		const keys = reply.keys;

	// 		const matchingKeys = keys.filter((key) => regex.test(key));
	// 		if (matchingKeys.length > 0) {
	// 			sessionKey = matchingKeys[0]; // Assuming you want the first matching key
	// 			break;
	// 		}
	// 	} while (cursor !== 0);

	// 	console.log('Session Key', sessionKey);

	// 	const session = sessionKey ? await this.client.get(sessionKey) : null;

	// 	return { session, sessionKey };
	// }

	public async deleteSession(phoneNumber): Promise<number> {
		const deletedSession = await this.client.del(`session-${phoneNumber}`);

		return deletedSession;
	}
}

const redisService = RedisService.getInstance();

export { redisService };
