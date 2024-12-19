import { Schema, model } from 'mongoose';
import validator from 'validator';
import { INotification, INotificationModel } from '../../common/interfaces/notification.interface';

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'alert'], // example types, adjust as needed
            required: true,
        },
        scheduleTime: {
            type: Date,
            required: true,
        },
        recipients: {
            type: [String], // array of recipient identifiers (e.g., user IDs or phone numbers)
            validate: {
                validator: function (v: any) {
                    return v === null || (Array.isArray(v) && v.every((item) => validator.isMobilePhone(item, 'any', { strictMode: false })));
                },
                message: (props) => `${props.value} contains invalid phone numbers!`,
            },
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'], // example statuses, adjust as needed
            default: 'pending',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the User schema
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the User schema
            // required: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        timestamps: true,
    }
);

const Notification = model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;
