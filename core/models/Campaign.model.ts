// import mongoose, { Schema } from 'mongoose';
// import { ICampaign } from '../../common/interfaces/campaign.interface';

// const campaignSchema = new Schema<ICampaign>(
// 	{
// 		name: { type: String, required: true },
// 		description: { type: String, required: true },
// 		approved: { type: Boolean, required: true, default: true },
// 		createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
// 		updatedBy: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
// 		channel: { type: Schema.Types.ObjectId, required: true, ref: 'Channel' }, // Reference the Channel model
// 		cover: { type: String },
// 		templateUrl: { type: String, default: null },
// 		commissionId: {
// 			type: Schema.Types.ObjectId,
// 			required: true,
// 			ref: 'Commissions',
// 		}, // Assuming Commission model exists
// 		affiliateLink: { type: String },
// 		deletedAt: { type: Date, default: null },
// 	},
// 	{
// 		toJSON: {
// 			virtuals: true,
// 		},
// 		timestamps: true,
// 	},
// );

// const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

// export default Campaign;
