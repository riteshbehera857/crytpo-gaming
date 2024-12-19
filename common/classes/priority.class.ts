import { IPriority } from '../interfaces/priority.interface';

class Priority implements IPriority {
	name: string;
	active: boolean;
	limits: string;
	paymentType: string[];
	maxLimits: string;
	depositSupported: boolean;
	withdrawalSupported: boolean;
	updatedAt: Date;
	createdAt: Date;
	depositCommission: number;
	gatewayApiKey: string;
	gatewayBaseUrl: string;
	gatewayClientSecret: string;
	gatewayEncryptionSalt: string;
	gatewayProgramId: string;
	maxPaymentProcessingLimit: string;
	withdrawalCommission: number;

	constructor(data: Partial<IPriority>) {
		this.name = data.name;
		this.active = data.active;
		this.limits = data.limits;
		this.paymentType = data.paymentType;
		this.maxLimits = data.maxLimits;
		this.updatedAt = data.updatedAt;
		this.createdAt = data.createdAt;
		this.depositSupported = data.depositSupported;
		this.withdrawalSupported = data.withdrawalSupported;
		this.depositCommission = data.depositCommission;
		this.withdrawalCommission = data.withdrawalCommission;
		this.gatewayApiKey = data.gatewayApiKey;
		this.gatewayBaseUrl = data.gatewayBaseUrl;
		this.gatewayClientSecret = data.gatewayClientSecret;
		this.gatewayEncryptionSalt = data.gatewayEncryptionSalt;
		this.gatewayProgramId = data.gatewayProgramId;
		this.maxPaymentProcessingLimit = data.maxPaymentProcessingLimit;
	}
}

export { Priority };
