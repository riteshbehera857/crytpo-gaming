import { Schema } from 'mongoose';
import { IUploadFile } from '../interfaces/uploadFile.interface';

class UploadFile implements IUploadFile {
	player: Schema.Types.ObjectId;
	docProofType: string;
	docType: string;
	image: {
		data: Buffer;
		contentType: string;
	};

	constructor(uploadFileData: Partial<IUploadFile>) {
		this.player = uploadFileData.player;
		this.docType = uploadFileData.docType;
		this.image = uploadFileData.image;
		this.docProofType = uploadFileData.docProofType;
	}
}

export { UploadFile };
