import { IRule } from './rule';

interface ICampaign {
	_id: string;
	name: string;
	type: string;
	releaseType: string;
	bonusAmount: {
		value: number;
		type: string;
		maxBonusAmount: number;
		source: string;
	};
	repeatCount: number;
	startDate: Date;
	endDate: Date;
	priority: number;
	eligibilityCriteria: IRule[];
	releaseSchedule: IReleaseSchedule[];
}

interface IReleaseSchedule {
	id: string;
	amount: number;
	type: string;
	releaseCriteria: IRule[];
}

enum ReleaseType {
	UNLOCKED = 'unlocked',
	LOCKED = 'locked',
}

// export { ICampaign, IReleaseSchedule, ReleaseType };
