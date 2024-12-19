import { Service } from 'typedi';
import config from '../../common/config';
import axios from 'axios';

@Service()
class SmsService {
	constructor() {}

	public async sendSms(mobileNumber: string, otp: any) {
		try {
			const smsProviderUrl = new URL(config.smsProvider.baseUrl);

			smsProviderUrl.searchParams.append(
				'username',
				config.smsProvider.username,
			);
			smsProviderUrl.searchParams.append(
				'apikey',
				config.smsProvider.apiKey,
			);
			smsProviderUrl.searchParams.append(
				'senderid',
				config.smsProvider.sender,
			);
			smsProviderUrl.searchParams.append('route', config.smsProvider.route);
			smsProviderUrl.searchParams.append('mobile', mobileNumber.toString());
			// smsProviderUrl.searchParams.append('type', config.smsProvider.type);
			smsProviderUrl.searchParams.append('PID', config.smsProvider.product);
			smsProviderUrl.searchParams.append('TID', config.smsProvider.template);

			const message = config.smsProvider.message.replace('<OTP>', otp);

			smsProviderUrl.searchParams.append('text', message);

			console.log(`SMS_URL: ${JSON.stringify(smsProviderUrl.href)}`);

			const response = await axios.get(smsProviderUrl.href);

			return response;
		} catch (error) {
			throw error;
		}
	}
}

export { SmsService };
