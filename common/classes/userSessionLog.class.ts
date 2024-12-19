import { Schema } from 'mongoose';
import { IUserSessionLog } from '../interfaces/userSessionLog.interface';

class UserSessionLog implements IUserSessionLog {
	_id?: Schema.Types.ObjectId;
	phoneNumber: string;
	loginTime: Date;
	logoutTime: Date;

	constructor(data: Partial<IUserSessionLog>) {
		this._id = data._id;
		this.phoneNumber = data.phoneNumber;
		this.loginTime = data.loginTime;
		this.logoutTime = data.logoutTime;
	}
}

export { UserSessionLog };
