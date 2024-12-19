import { connect as mongooseConnect } from 'mongoose';
import logger from './../logger';

const log = logger(module);

export const connect = async (URL: string, dbName: string) => {
	try {
		const conn = await mongooseConnect(URL, {
			dbName,
			retryWrites: true,
			appName: 'meta-game',
		});
		

		return conn;
	} catch (err) {
		console.log(err);
		log.error(err);
	}
};
