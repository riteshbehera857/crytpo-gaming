import { Request, NextFunction } from 'express';
import getLogger from '../../common/logger';
import UploadFileService from '../services/uploadFile.service';
import { ResponseCodes } from '../../common/config/responseCodes';
import { Response } from '../../common/config/response';
import { IUploadFile } from '../../common/interfaces/uploadFile.interface';
import { base64_encode } from '../../common/lib/utils';
import fs from 'fs';

export default class UploadFileController {
	private static log = getLogger(module);

	public static async uploadFile(req: Request, next: NextFunction) {
		this.log.debug('Calling api / upload ', JSON.stringify(req.body));

		const uploadFileService = new UploadFileService();

		try {
			const data: IUploadFile = {
				...req.body,
				...req.file,
				...req.currentUser,
			};

			if (!req.file) {
				return new Response(
					ResponseCodes.NO_FILE_FOUND_ERROR.code,
					ResponseCodes.NO_FILE_FOUND_ERROR.message,
				);
			}

			const response = await uploadFileService.uploadFile(data);

			return response;
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}
}
