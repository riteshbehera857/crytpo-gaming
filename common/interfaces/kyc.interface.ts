import { Model, Schema } from 'mongoose';
import { KycStatus } from '../types/kyc';

interface IKycDocProof {
	docType: string;
	document: {
		data: Buffer;
		contentType: string;
	};
}

interface IKyc {
	_id: Schema.Types.ObjectId;
	player: Schema.Types.ObjectId;
	addressProof: IKycDocProof;
	ageProof: IKycDocProof;
	status: KycStatus;
	isApproved: boolean;
}

interface KycQueryHelpers {}

interface IKycModel extends Model<IKyc, KycQueryHelpers> {}

export { IKyc, IKycModel, KycQueryHelpers, IKycDocProof };
