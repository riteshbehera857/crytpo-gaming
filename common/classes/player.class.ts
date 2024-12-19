import { Schema } from 'mongoose';
import { BankDetail, IPlayer } from '../interfaces/player.interface';
import { RoleEnum } from '../types/role';
import { KycStatus } from '../types/kyc';

class Player implements IPlayer {
	_id?: Schema.Types.ObjectId;
	email: string;
	isActive: boolean;
	affiliateId?: Schema.Types.ObjectId;
	channel?: Schema.Types.ObjectId;
	campaign?: Schema.Types.ObjectId;
	role?: RoleEnum;
	referredBy: Schema.Types.ObjectId;
	balance: {
		depositBalance: number;
		withdrawalBalance: number;
		bonusBalance: { locked: number; unlocked: number };
		inPlayBalance: number;
	};
	phoneNumber: string;
	otp?: {
		value?: string;
		createdAt?: Date;
		validatedAt?: Date;
		isValidated?: boolean;
	};
	nonce: string;
	googleId: string;
	metaAddress: string;
	skinId?: string;
	password: string;
	name: string;
	source: string;
	city: string;
	state: string;
	country: string;
	kyc: { isVerified: boolean; kycStatus: KycStatus; reasonOfReject: string };
	addressLine1: string;
	addressLine2: string;
	tags: string[];
	zipCode: string;
	// wallets?: WalletType;
	createdAt?: Date;
	updatedAt?: Date;
	bankDetails?: BankDetail[];
	currentBalance?: number;
	campaignId?: Schema.Types.ObjectId;
	channelId?: Schema.Types.ObjectId;
	lastLoginDate?: Date;

	constructor(data: Partial<IPlayer>) {
		this._id = data?._id;
		this.email = data.email;
		this.isActive = data.isActive;
		this.role = data.role;
		this.referredBy = data.referredBy;
		this.balance = data.balance;
		this.nonce = data.nonce;
		this.googleId = data.googleId;
		this.skinId = 'crashncash';
		this.metaAddress = data.metaAddress;
		this.password = data.password;
		this.name = data.name;
		this.source = data.source;
		this.phoneNumber = data.phoneNumber;
		this.otp = data.otp;
		this.city = data.city;
		this.state = data.state;
		this.country = data.country;
		this.zipCode = data.zipCode;
		this.kyc = data.kyc;
		this.addressLine1 = data.addressLine1;
		this.addressLine2 = data.addressLine2;
		this.tags = data.tags;
		this.bankDetails = data.bankDetails;
		this.currentBalance = data.currentBalance;
		this.campaignId = data.campaignId;
		this.channelId = data.channelId;
		this.lastLoginDate = data.lastLoginDate;
	}
}

export { Player };
