import { model, Schema } from 'mongoose';
import {
	IUserSessionLog,
	IUserSessionLogModel,
	IUserSessionLogQueryHelpers,
} from '../../common/interfaces/userSessionLog.interface';

const userSessionLogSchema = new Schema<
	IUserSessionLog,
	{},
	{},
	IUserSessionLogQueryHelpers
>(
	{
		phoneNumber: {
			type: String,
			required: [true, 'Phone number is required'],
		},
		loginTime: {
			type: Date,
			required: [true, 'Login time is required'],
		},
		logoutTime: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

const UserSessionLog = model<IUserSessionLog, IUserSessionLogModel>(
	'UserSessionLog',
	userSessionLogSchema,
);

export default UserSessionLog;
