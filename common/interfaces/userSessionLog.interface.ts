import { Model, Schema } from 'mongoose';

interface IUserSessionLog {
	_id?: Schema.Types.ObjectId;
	phoneNumber: string;
	loginTime: Date;
	logoutTime: Date;
}

interface IUserSessionLogQueryHelpers {}

interface IUserSessionLogModel
	extends Model<IUserSessionLog, IUserSessionLogQueryHelpers> {}

export { IUserSessionLog, IUserSessionLogQueryHelpers, IUserSessionLogModel };
