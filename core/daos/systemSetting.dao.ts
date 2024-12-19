import { Model } from 'mongoose';
import { ISystemSetting } from '../../common/interfaces/systemSetting.interface';
import SystemSetting from '../models/systemSetting.model';

class SystemSettingDao {
	private systemSettingModel: Model<ISystemSetting>;

	constructor() {
		this.systemSettingModel = SystemSetting;
	}

	public async getSystemSetting(): Promise<ISystemSetting> {
		const res = await this.systemSettingModel.findOne({});

		return res;
	}
}

export { SystemSettingDao };
