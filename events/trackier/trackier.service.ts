import axios from 'axios';
import config from '../../common/config';
import { IEvent, Trackier } from '../../common/interfaces/event.interface';
import { IMessage } from '../../notifications/interfaces/message';
import { SubTypes } from '../../common/interfaces/event.interface';
import { Service } from 'typedi';

@Service()
export default class TrackierService {
	private BASE_URL: string;
	private trackierKey: string;

	constructor() {
		this.BASE_URL = config.trackierConfig.trackier_baseUrl;
		this.trackierKey = config.trackierConfig.trackier_sdk_key;
	}

	public async postMessage(message: IMessage): Promise<any> {
		let trackierService: string;
		let payload: any;
		let registerActivity: any;

		payload = {
			app_token: this.trackierKey,
			tr_id: config.trackierConfig.trackier_sdk_id,
		};

		switch (message?.subType) {
			case SubTypes.LOGIN:
				payload.event_id = config.trackierConfig.trackier_login_event;
				payload.customer_uid = message.payload.playerId;
				break;
			case SubTypes.REGISTER:
				payload.event_id = config.trackierConfig.trackier_register_event;
				payload.customer_uid = message.payload.playerId;
				break;
			case SubTypes.BET:
				payload.event_id = config.trackierConfig.trackier_bet_event;
				payload.customer_uid = message.payload.playerId;
				payload.revenue = message.payload.amount;
				payload.currency = message.payload.currency;
				break;
			case SubTypes.WIN:
				payload.event_id = config.trackierConfig.trackier_win_event;
				payload.customer_uid = message.payload.playerId;
				payload.revenue = message.payload.amount;
				payload.currency = message.payload.currency;
				break;
			case SubTypes.DEPOSIT:
				payload.event_id = config.trackierConfig.trackier_deposit_event;
				payload.customer_uid = message.payload.playerId;
				payload.revenue = message.payload.amount;
				payload.currency = message.payload.currency;
				break;
			default:
				break;
		}

		const headers = {
			'x-api-key': '',
		};

		try {
			const response = await axios.post(`${this.BASE_URL}`, payload, {
				headers,
			});

			return response.data;
		} catch (error) {
			// Handle specific axios error
			if (axios.isAxiosError(error)) {
				console.error(
					'Axios error:',
					error.response?.data || error.message,
				);
			} else {
				// Handle other types of errors (if any)
				console.error('Unexpected error:', error);
			}
		}
	}
}
