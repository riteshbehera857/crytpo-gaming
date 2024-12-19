import getLogger from '../../common/logger';
import { IMessage } from '../interfaces/message';
import { IPublish } from '../interfaces/publish';
import { RedisClient } from './redis';

const log = getLogger(module);

class RedisPublish implements IPublish {
	private redisClient: RedisClient;

	constructor() {
		this.redisClient = new RedisClient();
	}

	getClient() {
		return this.redisClient.getRedisClient();
	}

	async publish(message: IMessage, channel: string): Promise<string> {
		const data = JSON.stringify(message);
		const ret = (await this.getClient().publish(channel, data)) as any;
		log.debug('Published message: ' + data + ' to channel: ' + channel);
		return ret;
	}
}

export { RedisPublish };
