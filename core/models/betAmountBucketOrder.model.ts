import { Model, Schema, Types, model } from 'mongoose';
import validator from 'validator';
import {
	IBetAmountBucketOrder,
	IBetAmountBucketOrderModel,
	IBetAmountBucketOrderQueryHelpers,
	BalanceBuckets,
} from '../../common/interfaces/betAmountBucketOrder.interface';

const betAmountBucketOrderSchema = new Schema<
	IBetAmountBucketOrder,
	{},
	{},
	IBetAmountBucketOrderQueryHelpers
>(
	{
		priority1: {
			type: String,
			enum: Object.values(BalanceBuckets),
			default: BalanceBuckets.DEPOSIT_BUCKET,
		},
		priority2: {
			type: String,
			enum: Object.values(BalanceBuckets),
			default: BalanceBuckets.BONUS_BUCKET,
		},
		priority3: {
			type: String,
			enum: Object.values(BalanceBuckets),
			default: BalanceBuckets.WITHDRAWAL_BUCKET,
		},
	},
	{
		timestamps: true,
		collection: 'betAmountBucketOrder',
	},
);

const BetAmountBucketOrder = model<
	IBetAmountBucketOrder,
	IBetAmountBucketOrderModel
>('BetAmountBucketOrder', betAmountBucketOrderSchema);

export default BetAmountBucketOrder;
