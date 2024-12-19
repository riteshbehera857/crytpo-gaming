import { Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { ConfigService } from '../services/config.service';
import getLogger from '../../common/logger';
import { IConfig } from '../../common/interfaces/config.interface';
import { Config } from '../../common/classes/config.class';

export default class ConfigController {
	private static log = getLogger(module);

	public static async getConfig(req: Request, next: NextFunction) {
		try {
			const configService = Container.get(ConfigService);
			const config = await configService.getConfig();
			return config;
		} catch (error) {
			return next(error);
		}
	}

	public static async updateConfig(req: Request, next: NextFunction) {
		try {
			const configService = Container.get(ConfigService);
			const data: IConfig = { ...req.body };
			const newConfig = new Config(data);

			const config = await configService.updateConfig(newConfig);
			return config;
		} catch (error) {
			return next(error);
		}
	}
}
