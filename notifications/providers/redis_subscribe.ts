import getLogger from '../../common/logger';
import { IMessage } from '../interfaces/message';
import { ISubscribe } from '../interfaces/subscribe';
import { RedisClient } from './redis';

const log = getLogger(module);

class RedisSubscribe implements ISubscribe {
	private redisClient: RedisClient;

	constructor() {
		this.redisClient = new RedisClient();
	}

	async subscribe(channel: string, process_event: Function): Promise<void> {
		const client = this.redisClient.getRedisClient();
		log.debug('Subscribing to channel: ' + channel);
		await client.subscribe(channel, (message) => {
			log.debug('Received message: ' + message);
			const m: IMessage = JSON.parse(message);
			process_event(m);
		});
	}
}

export { RedisSubscribe };
