export enum EventTypes {
	AUTHENTICATION = 'authentication',
	GAMES = 'games',
	WALLET = 'wallet',
	WAGER = 'wager',
	NOTIFICATION = 'notification',
	DOWNLOAD = 'download',
	LOGIN = 'login'
}

export enum Trackier {
	COUNTRY = 'IN',
	CURRENCY = 'INR',
}

export enum SubTypes {
	REGISTER = 'REGISTER',
	LOGIN = 'LOGIN',
	BET = 'BET',
	WIN = 'WIN',
	DEPOSIT = 'DEPOSIT',
	PUSH_NOTIFICATION = 'CREATED',
	TRACKIERMESSAGEPROCESSOR = 'TrackierMessageProcessor',
}

interface IEvent {
	eventType: EventTypes;
	eventSubType: SubTypes;
	payload: any;
}

export { IEvent };
