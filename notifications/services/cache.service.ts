import { Service } from 'typedi';
import { createClient } from 'redis';
import config from '../../common/config';
import getLogger from '../../common/logger';

const log = getLogger(module);

@Service()
export default class CacheService {
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
		}).on('error', (err) => log.error('Redis Client Error', err));
		this.redisClient.connect();
		log.debug('Cache service initialized');
	}

	/**
	 * Set a key-value pair in the cache.
	 *
	 * @param {string} key - The key to set.
	 * @param {string} value - The value to set.
	 */
	public async set(key: string, value: string) {
		log.debug(`Setting cache: Key: ${key}, Value ${value}`);
		this.redisClient.set(key, value);
	}

	public async get(key: string) {
		// return this.redisClient.flushall();
		log.debug(`Getting cache: ${key}`);
		return this.redisClient.get(key);
	}
}

export { CacheService };
