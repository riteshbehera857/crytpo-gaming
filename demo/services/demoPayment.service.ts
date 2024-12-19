import { Service } from 'typedi';
import { IPlayer } from '../../common/interfaces/player.interface';
import getLogger from '../../common/logger';
import { IMessage } from '../../notifications/interfaces/message';
import { EventTypes, SubTypes } from '../../common/interfaces/event.interface';
import { PublisherService } from '../../notifications/services/publisher.service';

const logger = getLogger(module);

@Service()
class DemoPaymentService {
	private publisherService: PublisherService;

	constructor() {
		this.publisherService = new PublisherService();
	}
	public async demoDeposit(player: IPlayer, depositData: Record<string, any>) {
		try {
			const depositEvent: IMessage = {
				type: EventTypes.WALLET,
				subType: SubTypes.DEPOSIT,
				ts: Date.now(),
				userId: player._id as unknown as string,
				payload: {
					playerId: player._id,
					amount: 200,
					currency: depositData.currency,
					code: depositData.bonusCode,
					status: 'SUCCESS',
					timestamp: new Date(),
					message: 'Deposit successful',
				},
			};

			await this.publisherService.publishMessage(
				depositEvent,
				'notification',
			);

			return { Hello: '123' };
		} catch (error) {
			throw error;
		}
	}
}

export { DemoPaymentService };
