import { Schema, model } from 'mongoose';
import {
	IKyc,
	IKycModel,
	KycQueryHelpers,
} from '../../common/interfaces/kyc.interface';
import { KycStatus } from '../../common/types/kyc';

const kycLogSchema = new Schema<IKyc, {}, {}, KycQueryHelpers>(
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

const KycLog = model<IKyc, IKycModel>('KycLog', kycLogSchema);

export { KycLog };
