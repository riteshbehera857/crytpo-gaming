interface ICampaignUsage {
	campaignId: string;
	userId: string;
	status: string;
	eligibleTimestamp?: number;
	usedCount: number;
	eligibleRules: string[];
	initialLockedAmount?: number;
	releasedSchedules: IReleaseScheduleUsage[];
}

interface IReleaseScheduleUsage {
	scheduleId: string;
	status: string;
	eligibleTimestamp: number;
	releaseAmount: number;
}

interface ICampaignUsageCache {
	idList?: string[];
	list: ICampaignUsage[];
}

enum CampaignStatus {
	NOT_ELIGIBLE = 'not-eligible',
	ELIGIBLE = 'eligible',
	RELEASE_IN_PROGRESS = 'in-progress',
	COMPLETED = 'completed',
}

export {
	ICampaignUsage,
	IReleaseScheduleUsage,
	CampaignStatus,
	ICampaignUsageCache,
};
