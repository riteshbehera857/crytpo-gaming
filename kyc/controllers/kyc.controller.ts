import { Request, NextFunction } from 'express';
import getLogger from '../../common/logger';
import { IKyc } from '../../common/interfaces/kyc.interface';
import KycService from '../services/kyc.service';
import { Schema } from 'mongoose';

export default class KycController {
	private static log = getLogger(module);

	public static async createKyc(req: Request, next: NextFunction) {
		this.log.debug('Calling api / kyc ', JSON.stringify(req.body));

		const kycService = new KycService();
		console.log('request data');

		try {
			const data: IKyc = { ...req.body };
			const currentPlayer = req.currentUser;

			const response = await kycService.createPlayerKyc(data, currentPlayer);
			return {
				user: response?.data?.phoneNumber,
				status: response?.message,
				KycStatus: response.data.status,
			};
		} catch (error) {
			this.log.error('🔥 error: ' + error?.message);
			return next(error);
		}
	}

	public static async updateKyc(req: Request, next: NextFunction) {
		this.log.debug('Calling api / kyc /update', JSON.stringify(req.body));
		const kycService = new KycService();
		const kycId: any = req.params.id;
		try {
			const data: IKyc = { ...req.body };
			const response = await kycService.updatePlayerKyc(data, kycId);
			return {
				user: response?.data?.phoneNumber,
				status: response?.message,
				KycStatus: response.data.status,
			};
		} catch (error) {
			this.log.error('🔥 error: ', error?.message);
			return next(error);
		}
	}
}
