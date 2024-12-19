import { Schema, model } from 'mongoose';
import {
	IUploadFile,
	IUploadFileModel,
	IUploadQueryHelpers,
} from '../../common/interfaces/uploadFile.interface';

const uploadFileSchema = new Schema<IUploadFile, {}, {}, IUploadQueryHelpers>(
	{
		player: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		docProofType: {
			type: String,
			required: true,
		},
		image: {
			data: Buffer,
			contentType: String,
		},
	},
	{
		timestamps: true,
	},
);

const uploadFile = model<IUploadFile, IUploadFileModel>(
	'uploadFile',
	uploadFileSchema,
);

export { uploadFile };
