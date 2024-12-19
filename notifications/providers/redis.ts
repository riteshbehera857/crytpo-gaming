import { createClient } from 'redis';
import config from '../../common/config';
import getLogger from '../../common/logger';

const log = getLogger(module);
export default class RedisClient {
	private redisClient: any;
	constructor() {
		const tlsEnabled =
			config.redis.tls.toLowerCase() === 'false' ? false : true;

		this.redisClient = createClient({
  url : "rediss://default:********@humorous-feline-22987.upstash.io:6379"
}).on('error', (err) => log.error(`Redis Client Error ${err}`));
		this.redisClient.connect();
		log.info('Cache service initialized');
	}

	public getRedisClient() {
		return this.redisClient;
	}
}

export { RedisClient };
