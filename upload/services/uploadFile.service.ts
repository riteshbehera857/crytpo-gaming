import getLogger from '../../common/logger';
import { Response } from '../../common/config/response';
import { ResponseCodes } from '../../common/config/responseCodes';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import { UploadFileDao } from '../dao/uploadFile.dao';
import KycService from '../../kyc/services/kyc.service';

export default class UploadFileService {
	private logger = getLogger(module);
	private commonPlayerDao: CommonPlayerDao;
	private uploadFileDao: UploadFileDao;

	constructor() {
		this.commonPlayerDao = new CommonPlayerDao();
		this.uploadFileDao = new UploadFileDao();
	}

	public async uploadFile(uploadData: any): Promise<Response> {
		try {
			const kycService = new KycService();

			const playerData = await this.commonPlayerDao.getPlayerById(
				uploadData._doc._id,
			);

			if (!playerData) {
				return new Response(
					ResponseCodes.PLAYER_NOT_FOUND.code,
					ResponseCodes.PLAYER_NOT_FOUND.message,
				);
			}

			const newUploadFile = await this.uploadFileDao.uploadFile(
				uploadData,
				playerData._id,
			);

			const response = await kycService.createPlayerKyc(
				uploadData,
				playerData._id,
			);

			return new Response(
				ResponseCodes.FILE_UPLOAD_SUCCESSFUL.code,
				ResponseCodes.FILE_UPLOAD_SUCCESSFUL.message,
				newUploadFile,
			);
		} catch (err) {
			throw err;
		}
	}
}
