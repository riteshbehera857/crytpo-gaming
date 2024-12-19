import { Schema, model } from 'mongoose';
import {
	IKyc,
	IKycModel,
	KycQueryHelpers,
} from '../../common/interfaces/kyc.interface';
import { KycStatus } from '../../common/types/kyc';

const kycSchema = new Schema<IKyc, {}, {}, KycQueryHelpers>(
	{
		player: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		addressProof: {
			docType: String,
			document: {
				data: Buffer,
				contentType: String,
			},
		},
		ageProof: {
			docType: String,
			document: {
				data: Buffer,
				contentType: String,
			},
		},
		status: {
			type: String,
			enum: Object.values(KycStatus),
			default: KycStatus.PROCESSING,
		},
		isApproved: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const Kyc = model<IKyc, IKycModel>('Kyc', kycSchema);

export { Kyc };
