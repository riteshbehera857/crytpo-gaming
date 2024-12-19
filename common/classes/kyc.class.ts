import { Schema } from 'mongoose';
import { IKyc, IKycDocProof } from '../interfaces/kyc.interface';
import { KycStatus } from '../types/kyc';

class Kyc implements IKyc {
	_id: Schema.Types.ObjectId;
	player: Schema.Types.ObjectId;
	addressProof: IKycDocProof;
	ageProof: IKycDocProof;
	status: KycStatus;
	isApproved: boolean;

	constructor(data: Partial<IKyc>) {
		this.player = data.player;
		this.addressProof = data.addressProof;
		this.ageProof = data.ageProof;
		this.status = data.status;
		this.isApproved = data.isApproved;
	}
}

export { Kyc };
