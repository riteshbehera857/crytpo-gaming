import { Model } from 'mongoose';
import { IKyc } from '../../common/interfaces/kyc.interface';
import { KycLog } from '../models/kycLog.model';

class KycLogDao {
	private kycLogModel: Model<IKyc>;

	constructor() {
		this.kycLogModel = KycLog;
	}

	public async createKycLog(kyc: Partial<IKyc>): Promise<IKyc> {
		const kycLog = await this.kycLogModel.create(kyc);

		return kycLog;
	}
}

export { KycLogDao };
