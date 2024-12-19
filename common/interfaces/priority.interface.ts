interface IPriority {
	name: string;
	active: boolean;
	limits: string;
	maxPaymentProcessingLimit: string;
	depositCommission: number;
	withdrawalCommission: number;
	gatewayBaseUrl: string;
	depositSupported: boolean;
	withdrawalSupported: boolean;
	gatewayClientSecret: string;
	gatewayProgramId: string;
	gatewayApiKey: string;
	gatewayEncryptionSalt: string;
	paymentType: string[];
	maxLimits: string;
	updatedAt: Date;
	createdAt: Date;
}

export { IPriority };
