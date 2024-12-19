import { Model, Schema, Types, model } from 'mongoose';
import validator from 'validator';
import { AuthSource } from '../../common/config/constants';
import {
	BankDetail,
	IPlayer,
	IPlayerModel,
	IPlayerQueryHelpers,
} from '../../common/interfaces/player.interface';
import { RoleEnum } from '../../common/types/role';
import { KycStatus } from '../../common/types/kyc';

interface IPlayerMethods {
	getPrimaryBank(): BankDetail;
}

const playerSchema = new Schema<
	IPlayer,
	{},
	IPlayerMethods,
	IPlayerQueryHelpers
>(
	{
		email: {
			type: String,
			validate: {
				validator: function (v: any) {
					return validator.isEmail(v);
				},
				message: (props) => `${props.value} is not a valid email!`,
			},
		},
		nonce: {
			type: String,
		},
		googleId: {
			type: String,
		},
		metaAddress: {
			type: String,
		},
		password: {
			type: String,
			select: false,
		},
		name: {
			type: String,
		},
		phoneNumber: {
			type: String,
		},
		skinId: {
			type: String,
			default: 'crashncash',
		},
		tags: [String],
		bankDetails: [
			{
				bankName: String,
				bankBranch: String,
				accountName: String,
				accountNumber: String,
				ifscCode: String,
				isVerified: Boolean,
				isPrimary: Boolean,
				createdAt: {
					type: Date,
					default: Date.now(),
				},
				updatedAt: {
					type: Date,
				},
			},
		],
		otp: {
			value: {
				type: String,
				select: false,
			},
			createdAt: {
				type: Date,
				select: false,
			},
			validatedAt: {
				type: Date,
				select: false,
			},
			isValidated: {
				type: Boolean,
				default: false,
				select: false,
			},
		},
		affiliateId: {
			type: Schema.Types.ObjectId,
			required: false,
		},
		channelId: {
			type: Schema.Types.ObjectId,
			required: false,
		},
		campaignId: {
			type: Schema.Types.ObjectId,
			required: false,
		},
		role: {
			type: String,
			enum: Object.values(RoleEnum),
			default: RoleEnum.PLAYER,
		},
		kyc: {
			isVerified: {
				type: Boolean,
				default: false,
			},
			kycStatus: {
				type: String,
				enum: Object.values(KycStatus),
				default: KycStatus.INCOMPLETE,
			},
			reasonOfReject: String,
		},
		lastLoginDate: {
			type: Date,
			required: false,
		},
		addressLine1: String,
		addressLine2: String,
		city: String,
		state: String,
		country: String,
		zipCode: String,
		source: {
			type: String,
			enum: Object.values(AuthSource),
			default: AuthSource.EMAIL,
		},
		balance: {
			depositBalance: { type: Number, default: 0 },
			withdrawalBalance: { type: Number, default: 0 },
			bonusBalance: {
				locked: {
					default: 0,
					type: Number,
				},
				unlocked: {
					default: 0,
					type: Number,
				},
			},
			inPlayBalance: { type: Number, default: 0 },
		},
		// wallets: [
		// 	{
		// 		type: Schema.Types.ObjectId,
		// 		ref: 'Wallet',
		// 	},
		// ],

		/**
		 * These two fields are used when a user registers through a social provider,
		 * such as Google or Facebook. The 'source' field in this model is also updated 
		 * to indicate the user's registration source (e.g., 'Google' or 'Facebook').
		 */
		profileDetailsFromSocialProvider: {
			type: Object,
			required: false,  // Profile information from social providers (e.g., Google, Facebook) such as name and profile picture.
		},
		socialProviderId: {
			type: String,
			required: false, // ID from the social provider (e.g., Google ID)
		},
	},
	{
		timestamps: true,
	},
);

playerSchema.methods.getPrimaryBank = function () {
	return this.bankDetails.find((bank) => bank.isPrimary);
};

const Player = model<IPlayer, IPlayerModel>('Player', playerSchema);

export default Player;
