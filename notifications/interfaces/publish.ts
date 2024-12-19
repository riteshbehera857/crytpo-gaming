import { IMessage } from './message';

// Method interface to publish
interface IPublish {
	publish(message: IMessage, channel: string): Promise<string>;
}

export { IPublish };
