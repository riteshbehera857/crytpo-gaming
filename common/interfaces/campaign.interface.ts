import mongoose, { ObjectId, Schema } from 'mongoose';

interface IReleaseSchedule {
	id: string;
	amount: number;
	type: BonusAmountType;
	releaseCriteria: IRule[];
}
interface IRule {
	id: string;
	eventType: string;
	conditions: ICondition[];
	games?: string[];
	status?: string;
	name?: string;
}

interface ICondition {
	scope: string; // scope can be payload, stats, etc
	field: string; // field can be amount, code, etc
	value: any; // value can be 1000, BONUS100, etc
	op: Op; // condition can be gte, eq, etc
	status?: string;
}

enum Op {
	GTE = 'gte',
	EQ = 'eq',
}

enum ReleaseType {
	LOCKED = 'locked',
	UNLOCKED = 'unlocked',
}

enum BonusAmountType {
	PERCENTAGE = 'percentage',
	FIXED = 'fixed',
}

enum BonusAmountSource {
	DEPOSIT = 'deposit',
	SIGNUP = 'signup',
	LOGIN = 'login',
}

interface BonusAmount {
	value: number;
	type: BonusAmountType;
	maxBonusAmount: number;
	source: BonusAmountSource;
}

interface ICampaign {
	_id: Schema.Types.ObjectId;
	id: string;
	name: string;
	description: string;
	type: string;
	releaseType: ReleaseType;
	approved: boolean;
	bonusAmount: BonusAmount;
	repeatCount: number;
	autoOptIn: boolean;
	startDate: Date;
	endDate: Date;
	priority: number;
	eligibilityCriteria: IRule[];
	releaseSchedule: IReleaseSchedule[];
	createdBy: Schema.Types.ObjectId;
	updatedBy: Schema.Types.ObjectId;
	channel: Schema.Types.ObjectId;
	cover: string;
	templateUrl: string | null;
	affiliateLink: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	assignBonusUser: string[];
}
export {
	ICampaign,
	IReleaseSchedule,
	IRule,
	ICondition,
	ReleaseType,
	BonusAmountType,
	BonusAmountSource,
	BonusAmount,
	Op,
};
