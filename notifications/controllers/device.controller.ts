import { Container } from 'typedi';
import { Request } from 'express';
import { IDevice } from '../interfaces/device';
import { DeviceService } from '../services/device.service';
import getLogger from '../../common/logger';

const log = getLogger(module);

export default class DeviceController {
	public static async registerDevice(req: Request) {
		log.debug('Registering device', req.body);
		const device = req.body as IDevice;
		const deviceService = Container.get(DeviceService);
		await deviceService.registerDevice(device);
	}
}

export { DeviceController };
