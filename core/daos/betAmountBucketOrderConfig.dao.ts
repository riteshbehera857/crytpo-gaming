import { Model } from 'mongoose';
import { IBetAmountBucketOrder } from '../../common/interfaces/betAmountBucketOrder.interface';
import BetAmountBucketOrder from '../models/betAmountBucketOrder.model';

class BetAmountBucketOrderConfigDao {
	private betAmountBucketOrderModel: Model<IBetAmountBucketOrder>;
	public betAmountBucketOrder: IBetAmountBucketOrder;

	constructor() {
		this.betAmountBucketOrderModel = BetAmountBucketOrder;
		this.betAmountBucketOrder = null;
	}

	public async createBetAmountBucketOrder(
		order: IBetAmountBucketOrder,
	): Promise<IBetAmountBucketOrder> {
		return await this.betAmountBucketOrderModel.create(order);
	}

	public async getBetAmountBucketOrder(): Promise<IBetAmountBucketOrder> {
		this.betAmountBucketOrder = await this.betAmountBucketOrderModel.findOne(
			{},
		);

		return this.betAmountBucketOrder;
	}
}

export { BetAmountBucketOrderConfigDao };
