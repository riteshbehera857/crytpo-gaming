// src/models/systemSetting.model.ts
import { Schema, model } from 'mongoose';
import { ISystemSetting } from '../../common/interfaces/systemSetting.interface';

const systemSettingSchema = new Schema<ISystemSetting>(
	{
		useSMSGateway: {
			type: Boolean,
			required: true,
			default: false,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User', // Reference to the User schema
			// required: true,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User', // Reference to the User schema
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	},
);

const SystemSetting = model<ISystemSetting>(
	'SystemSetting',
	systemSettingSchema,
);

export default SystemSetting;
