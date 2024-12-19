import { Model, Schema } from 'mongoose';

interface IUploadFile {
	_id?: Schema.Types.ObjectId;
	player: Schema.Types.ObjectId;
	docProofType: string;
	docType: string;
	image: {
		data: Buffer;
		contentType: string;
	};
	createdAt?: Date;
	updatedAt?: Date;
}

interface IUploadQueryHelpers {}

interface IUploadFileModel extends Model<IUploadFile, IUploadQueryHelpers> {}

export { IUploadFile, IUploadFileModel, IUploadQueryHelpers };
