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
			socket: {
				host: config.redis.host,
				port: Number(config.redis.port),
				tls: tlsEnabled,
			},
		}).on('error', (err) => log.error(`Redis Client Error ${err}`));
		this.redisClient.connect();
		log.info('Cache service initialized');
	}

	public getRedisClient() {
		return this.redisClient;
	}
}

export { RedisClient };
