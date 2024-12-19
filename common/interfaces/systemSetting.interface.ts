import { Schema } from 'mongoose';

export interface ISystemSetting {
	useSMSGateway: boolean;
	createdBy: Schema.Types.ObjectId;
	updatedBy?: Schema.Types.ObjectId;
}
