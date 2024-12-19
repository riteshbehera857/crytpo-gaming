import {
	FilterQuery,
	Model,
	QueryOptions,
	UpdateQuery,
	UpdateWriteOpResult,
} from 'mongoose';
import { IUserSessionLog } from '../../common/interfaces/userSessionLog.interface';
import UserSessionLog from '../models/userSessionLog.model';
import { timeStamp } from 'console';

class UserSessionLogDao {
	private userSessionLogModel: Model<IUserSessionLog>;

	constructor() {
		this.userSessionLogModel = UserSessionLog;
	}

	private async createUserSessionLog(
		data: Partial<IUserSessionLog>,
	): Promise<IUserSessionLog> {
		const userSessionLog = await this.userSessionLogModel.create(data);

		return userSessionLog;
	}

	private async getUserSessionLog(
		query: FilterQuery<IUserSessionLog>,
		options?: QueryOptions<IUserSessionLog>,
	): Promise<IUserSessionLog[]> {
		const userSessionLogs = await this.userSessionLogModel.find(
			query,
			options,
		);

		return userSessionLogs;
	}

	private async updateManyUserSessionLogs(
		query: FilterQuery<IUserSessionLog>,
		update: UpdateQuery<IUserSessionLog>,
		options?: QueryOptions<IUserSessionLog>,
	): Promise<UpdateWriteOpResult> {
		const updatedUserSessionLogs = await this.userSessionLogModel.updateMany(
			query,
			update,
		);

		return updatedUserSessionLogs;
	}

	private async updateUserSessionLog(
		query: FilterQuery<IUserSessionLog>,
		update: UpdateQuery<IUserSessionLog>,
		options?: QueryOptions<IUserSessionLog>,
	): Promise<IUserSessionLog> {
		const updatedUserSessionLog =
			await this.userSessionLogModel.findOneAndUpdate(
				query,
				update,
				options,
			);

		return updatedUserSessionLog;
	}

	public async findUserSessionLogsWhereLogoutIsNull(
		phoneNumber: string,
	): Promise<IUserSessionLog[]> {
		const query: FilterQuery<IUserSessionLog> = {
			phoneNumber,
			logoutTime: null,
		};

		const userSessionLogs = await this.getUserSessionLog(query);

		return userSessionLogs;
	}

	public async updateUserSessionLogsLogoutTime(
		phoneNumber: string,
	): Promise<UpdateWriteOpResult> {
		const query: FilterQuery<IUserSessionLog> = {
			phoneNumber,
			logoutTime: null,
		};

		const update: UpdateQuery<IUserSessionLog> = {
			$set: {
				logoutTime: new Date(),
			},
		};

		const updatedUserSessionLogs = await this.updateManyUserSessionLogs(
			query,
			update,
		);

		return updatedUserSessionLogs;
	}

	public async createUserSessionLogLoginTime(
		phoneNumber: string,
	): Promise<IUserSessionLog> {
		const data: Partial<IUserSessionLog> = {
			phoneNumber: phoneNumber,
			loginTime: new Date(),
		};

		const userSessionLog = await this.createUserSessionLog(data);

		return userSessionLog;
	}
}

export { UserSessionLogDao };
