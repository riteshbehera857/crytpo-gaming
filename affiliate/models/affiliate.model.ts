import { Schema, model } from 'mongoose';
import validator from 'validator';

// interface IAffiliate {
// 	email: string;
// 	password: string;
// 	name: string;
// 	activated: boolean;
// 	createdBy: Schema.Types.ObjectId | null;
// 	deletedAt: Date | null;
// }
import { IAffiliate } from '../../common/interfaces/affiliate.interface';
import { RoleEnum } from '../../common/types/role';
import { CommissionTypeEnum } from '../../common/types/commission';

const affiliateSchema = new Schema<IAffiliate>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function (v: any) {
					return validator.isEmail(v);
				},
				message: (props) => `${props.value} is not a valid email!`,
			},
		},
		commissionType: {
			type: String,
			enum: Object.values(CommissionTypeEnum),
			required: true,
		},
		parentAffiliateId: {
			type: Schema.Types.ObjectId,
			ref: 'Affiliate', // Reference to the same schema for createdBy user
			default: null,
		},
		revenueSharePercentage: {
			type: Number,
			default: 0,
		},
		perUsersCommission: {
			type: Number,
			default: 0,
		},
		password: {
			type: String,
			required: true,
			// select: false,
		},
		name: {
			type: String,
			required: true,
		},
		activated: {
			type: Boolean,
			default: true,
		},
		role: {
			type: String,
			enum: Object.values(RoleEnum),
			required: true,
			default: RoleEnum.AFFILIATE,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'BackOfficeUser', // Reference to the same schema for createdBy user
			default: null,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'BackOfficeUser', // Reference to the same schema for createdBy user
			default: null,
		},
		deletedAt: {
			type: Date,
			default: null, // Or any default value you prefer
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	},
);

const Affiliate = model<IAffiliate>('Affiliate', affiliateSchema);

export default Affiliate;
