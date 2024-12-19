import { Model } from 'mongoose';

interface IBetAmountBucketOrder {
	priority1: BalanceBuckets;
	priority2: BalanceBuckets;
	priority3: BalanceBuckets;
}

enum BalanceBuckets {
	DEPOSIT_BUCKET = 'depositBalance',
	WITHDRAWAL_BUCKET = 'withdrawalBalance',
	BONUS_BUCKET = 'bonusBalance.unlocked',
}

interface IBetAmountBucketOrderQueryHelpers {}

interface IBetAmountBucketOrderModel
	extends Model<IBetAmountBucketOrder, IBetAmountBucketOrderQueryHelpers> {}

export {
	IBetAmountBucketOrder,
	BalanceBuckets,
	IBetAmountBucketOrderQueryHelpers,
	IBetAmountBucketOrderModel,
};
