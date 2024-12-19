import { Service } from 'typedi';
import config from '../config';
import { IMessage } from '../interfaces/message';
import { IPublish } from '../interfaces/publish';
import { RedisPublish } from '../providers/redis_publish';

@Service()
class PublisherService {
	private publisher: IPublish;
	constructor() {
		if (config.pub_sub.provider === 'redis')
			this.publisher = new RedisPublish();
	}

	async publishMessage(message: IMessage, channel: string) {
		const ret = await this.publisher.publish(message, channel);
		return ret;
	}
}

export { PublisherService };
