import { Model } from 'mongoose';

import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { IUploadFile } from '../../common/interfaces/uploadFile.interface';
import { uploadFile } from '../models/upload.model';
import { IPlayer } from '../../common/interfaces/player.interface';

class UploadFileDao {
	private uploadFileModel: Model<IUploadFile>;
	private commonPlayerDao: CommonPlayerDao;

	constructor() {
		this.uploadFileModel = uploadFile;
		this.commonPlayerDao = new CommonPlayerDao();
	}

	public async uploadFile(uploadData: any, player: any): Promise<IUploadFile> {
		const newUpload = this.uploadFileModel.create({
			player: player._id,
			docProofType: uploadData.docProofType,
			image: {
				data: uploadData.originalname,
				contentType: uploadData.mimetype,
			},
		});

		return newUpload;
	}
}

export { UploadFileDao };
