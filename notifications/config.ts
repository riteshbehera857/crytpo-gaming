import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (!envFound) {
	// This error should crash whole process
	throw new Error("⚠️	Couldn't find .env file	⚠️");
}

export default {
	cache: {
		redis_url: process.env.REDIS_HOST || 'redis://localhost:6379',
	},
	pub_sub: {
		provider: process.env.PUB_SUB_PROVIDER || 'redis',
		channel: process.env.PUB_SUB_CHANNEL || 'notification',
	},
	process_rules: [
		{
			name: 'bonus processor',
			ruleType: 'events',
			eventType: ['wallet', 'authentication', 'login'],
			processors: ['BonusCampaignProcessor'],
		},
		{
			name: 'bonus release processor',
			ruleType: 'events',
			eventType: ['wager'],
			processors: ['BonusReleaseProcessor'],
		},
		{
			ruleType: 'regex',
			eventType: '.*',
			processors: [
				'TrackierMessageProcessor',
				'LogMessageProcessor',
				'FirebaseMessageProcessor',
			],
		},
	] as const,
	ruleProcessors: {
		login: 'LoginRuleProcessor',
		authentication: 'AuthenticationRuleProcessor',
		wallet: 'DepositRuleProcessor',
		wager: 'GameRuleProcessor',
	} as const,
};
