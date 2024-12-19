import mongoose, { Schema } from 'mongoose';
import {
	BonusAmountSource,
	BonusAmountType,
	ICampaign,
	Op,
	ReleaseType,
} from '../../common/interfaces/campaign.interface';

const campaignSchema = new Schema<ICampaign>(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		type: String,
		releaseType: {
			type: String,
			enum: Object.values(ReleaseType),
			default: ReleaseType.UNLOCKED,
		},
		approved: { type: Boolean, default: true },
		bonusAmount: {
			type: {
				type: String,
				enum: Object.values(BonusAmountType),
				default: BonusAmountType.PERCENTAGE,
			},
			value: Schema.Types.Mixed,
			maxBonusAmount: Number,
			source: {
				type: String,
				enum: Object.values(BonusAmountSource),
				default: BonusAmountSource.DEPOSIT,
			},
		},
		repeatCount: Number,
		priority: Number,
		startDate: {
			type: Date,
			default: new Date(),
		},
		endDate: {
			type: Date,
			default: new Date(),
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'BackOfficeUser',
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			default: null,
			ref: 'BackOfficeUser',
		},
		channel: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Channel',
		},
		cover: String,
		templateUrl: String,
		affiliateLink: String,
		deletedAt: { type: Date, default: null },
		eligibilityCriteria: [
			{
				eventType: String,
				conditions: [
					{
						scope: String,
						field: String,
						value: Schema.Types.Mixed,
						op: {
							type: String,
							enum: Object.values(Op),
						},
					},
				],
				name: String,
			},
		],
		releaseSchedule: [
			{
				amount: Number,
				type: {
					type: String,
					enum: Object.values(BonusAmountType),
				},
				releaseCriteria: [
					{
						eventType: String,
						conditions: [
							{
								scope: String,
								field: String,
								value: Schema.Types.Mixed,
								op: {
									type: String,
									enum: Object.values(Op),
								},
							},
						],
						games: [
							{
								type: String,
							},
						],
						name: String,
					},
				],
			},
		],
		assignBonusUser: [
			{
				type: String,
				ref: 'User',
			},
		],
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	},
);

const Campaign =
	mongoose.models.Campaign ||
	mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign;
