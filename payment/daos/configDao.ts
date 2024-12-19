import { Model, Schema, UpdateWriteOpResult } from 'mongoose';
import { IConfig } from '../../common/interfaces/config.interface';
import { Config } from '../models/config.model';
import { Priority } from '../../common/classes/priority.class';
import { query } from 'express';

class ConfigDao {
	private ConfigModel: Model<IConfig>;

	constructor() {
		this.ConfigModel = Config;
	}

	public async create(config: Partial<IConfig>): Promise<IConfig> {
		const newConfig = await this.ConfigModel.create({
			...config,
		});

		return newConfig;
	}

	public async update(
		config: Partial<IConfig>,
		validPriority: Priority[],
	): Promise<UpdateWriteOpResult> {
		const updatedConfig = await this.ConfigModel.updateMany(
			{
				deleted_at: null,
				valid_priority: validPriority,
			},
			{ $set: config },
		);

		return updatedConfig;
	}

	public async findOne(): Promise<IConfig | null> {
		const config = (await this.ConfigModel.findOne({
			deletedAt: null,
		})) as IConfig | null;
		return config;
	}
}

export { ConfigDao };
