import { Model, Schema } from 'mongoose';
import { CommissionTypeEnum } from '../types/commission';

interface IAffiliate {
	_id?: Schema.Types.ObjectId;
	email: string;
	password: string;
	name: string;
	revenueSharePercentage: number;
	perUsersCommission: number;
	parentAffiliateId: Schema.Types.ObjectId | null;
	// permissions: [string];
	role: string;
	commissionType: CommissionTypeEnum;
	// roles: [string];
	activated: boolean;
	createdBy: Schema.Types.ObjectId | null;
	updatedBy: Schema.Types.ObjectId | null;
	deletedAt: Date | null;
}

interface IAffiliateModel extends Model<IAffiliate> {}

export { IAffiliate, IAffiliateModel };
