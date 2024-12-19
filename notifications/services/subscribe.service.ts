import config from '../config';
import { ISubscribe } from '../interfaces/subscribe';
import { RedisSubscribe } from '../providers/redis_subscribe';

class SubscribeService {
	private subscriber: ISubscribe;
	constructor() {
		if (config.pub_sub.provider === 'redis')
			this.subscriber = new RedisSubscribe();
	}

	async subscribe(channel: string, process_event: Function) {
		this.subscriber.subscribe(channel, process_event);
	}
}

export { SubscribeService };
