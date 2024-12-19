import { Schema } from 'mongoose';
import { IConfig } from '../interfaces/config.interface';
import { WithdrawalTypeEnum } from '../types/withdrawal';
import { IPriority } from '../interfaces/priority.interface';

class Config implements IConfig {
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

	constructor(data: Partial<IConfig>) {
		this.withdrawalType = data.withdrawalType;
		this.paymentType = data.paymentType;
		this.priority = data.priority;
		this.updatedBy = data.updatedBy;
		this.deletedAt = data.deletedAt;
		this.depositCommission = data.depositCommission;
		this.withdrawalCommission = data.withdrawalCommission;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt;
	}
}

export { Config };
