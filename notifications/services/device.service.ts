import { Container, Service } from 'typedi';
import { CacheService } from '../services/cache.service';
import { IDevice } from '../interfaces/device';
import getLogger from '../../common/logger';

const log = getLogger(module);
const DEVICE_PREFIX = 'device:';

@Service()
class DeviceService {
	public static generateKey(userId: string) {
		return `${DEVICE_PREFIX}${userId}`;
	}

	public async registerDevice(device: IDevice) {
		log.debug(`Registering device: ${JSON.stringify(device)} `);
		const key = DeviceService.generateKey(device.userId);
		const cacheService = Container.get(CacheService);
		const devicesStr = await cacheService.get(key);
		const devices = JSON.parse(devicesStr || '{}');
		devices[device.id] = device;
		log.debug(
			`Devices for userid :	${device.userId}, ${JSON.stringify(devices)}`,
		);
		await cacheService.set(key, JSON.stringify(devices));
	}

	public async getTokens(userId: string) {
		const key = DeviceService.generateKey(userId);
		const cacheService = Container.get(CacheService);
		const devicesStr = await cacheService.get(key);
		if (!devicesStr) {
			return [];
		}
		const devices = JSON.parse(devicesStr);
		log.debug(`Devices for userid :	${userId} - ${JSON.stringify(devices)}`);
		const tokens = Object.values(devices).flatMap(
			(device: IDevice) => device.token,
		);
		log.debug(`Tokens for userid : ${userId} - ${tokens}`);
		return tokens;
	}
}

export { DeviceService };
