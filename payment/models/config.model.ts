import { Model, Schema, model } from 'mongoose';
import { IPriority } from '../../common/interfaces/priority.interface';
import {
	ConfigQueryHelpers,
	IConfig,
	IConfigModel,
} from '../../common/interfaces/config.interface';
import { WithdrawalTypeEnum } from '../../common/types/withdrawal';
import { boolean } from 'joi';

const prioritySchema = new Schema<IPriority>(
	{
		name: {
			type: String,
			required: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
		limits: {
			type: String,
			required: true,
		},
		depositSupported: Boolean,
		withdrawalSupported: Boolean,
		paymentType: [
			{
				type: String,
				required: true,
			},
		],
		maxLimits: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		updatedAt: {
			type: Date,
		},
	},
	{ _id: false },
);

const configSchema = new Schema<IConfig, {}, {}, ConfigQueryHelpers>(
	{
		withdrawalType: {
			type: String,
			enum: Object.values(WithdrawalTypeEnum),
			default: WithdrawalTypeEnum.AUTO,
		},
		paymentType: {
			type: String,
		},
		priority: [prioritySchema],
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'Player',
		},
		deletedAt: {
			type: Date,
		},
		depositCommission: {
			type: Number,
		},
		withdrawalCommission: {
			type: Number,
		},
	},
	{
		toJSON: { virtuals: true },
		timestamps: true,
	},
);

const Config = model<IConfig, IConfigModel>('Config', configSchema);

export { Config };
