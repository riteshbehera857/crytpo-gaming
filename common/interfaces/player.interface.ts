import { Model, Schema } from 'mongoose';
import { RoleEnum } from '../types/role';
import { KycStatus } from '../types/kyc';

export type BankDetail = {
	accountName?: string;
	bankBranch?: string;
	accountNumber: string;
	ifscCode: string;
	bankName?: string;
	isVerified: boolean;
	isPrimary: boolean;
	createdAt: Date;
	updateAt: Date;
};

interface IRetrievedUserProfileInfoFromGoogle {
    id: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

interface IRetrievedUserProfileInfoFromFacebook {
    id: string;
    email?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    picture?: { data: { url: string } } | any;
}

export type UserProfile = IRetrievedUserProfileInfoFromFacebook | IRetrievedUserProfileInfoFromGoogle;

interface IPlayer {
	_id?: Schema.Types.ObjectId;
	email: string;
	isActive: boolean;
	role?: RoleEnum;
	lastLoginDate?: Date;
	affiliateId?: Schema.Types.ObjectId;
	channelId?: Schema.Types.ObjectId;
	campaignId?: Schema.Types.ObjectId;
	referredBy: Schema.Types.ObjectId;
	skinId?: string;
	bankDetails?: BankDetail[];
	balance: {
		depositBalance: number;
		withdrawalBalance: number;
		bonusBalance: {
			locked: number;
			unlocked: number;
		};
		inPlayBalance: number;
	};
	phoneNumber: string;
	otp?: {
		value?: string;
		createdAt?: Date;
		validatedAt?: Date;
		isValidated?: boolean;
	};
	kyc: {
		isVerified: boolean;
		kycStatus: KycStatus;
		reasonOfReject: string;
	};
	tags: string[];
	addressLine1: string;
	addressLine2: string;
	nonce: string;
	googleId: string;
	metaAddress: string;
	password: string;
	name: string;
	source: string;
	city: string;
	state: string;
	country: string;
	zipCode: string;
	// wallets?: WalletType;
	createdAt?: Date;
	updatedAt?: Date;
	currentBalance?: number;
	profileDetailsFromSocialProvider?: UserProfile | any;
	socialProviderId?: string;
}

interface IPlayerQueryHelpers {}

interface IPlayerModel extends Model<IPlayer, IPlayerQueryHelpers> {}

export { IPlayer, IPlayerModel, IPlayerQueryHelpers };
