interface IMessage {
	// required parameters
	type: string;
	subType: string;
	userId: string;
	ts: number;
	payload: any;
	isForAllUser?: boolean;

	// game information
	game?: string;
	roundId?: string;
	eligibleTimestamp?: number;

	// This should be an enum, but for simplicity, we will use string. Possible values: 'user', 'bonus', 'payment'
	sendTo?: string;

	// Optional fields to display the message when app is in background
	title?: string;
	body?: string;
}

export { IMessage };
