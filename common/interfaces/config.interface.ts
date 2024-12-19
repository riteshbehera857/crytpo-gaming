import { WithdrawalTypeEnum } from '../types/withdrawal';
import { IPriority } from './priority.interface';
import { Model, Schema } from 'mongoose';

interface IConfig {
	_id?: Schema.Types.ObjectId;
	withdrawalType: WithdrawalTypeEnum;
	paymentType: string;
	priority: IPriority[];
	updatedBy: Schema.Types.ObjectId;
	deletedAt: Date;
	depositCommission: number;
	withdrawalCommission: number;
	createdAt: Date;
	updatedAt: Date;
}

interface ConfigQueryHelpers {}

interface IConfigModel extends Model<IConfig, ConfigQueryHelpers> {}

export { IConfig, IConfigModel, ConfigQueryHelpers };
