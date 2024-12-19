import { Schema, model } from 'mongoose';
import { INotificationLog } from '../../common/interfaces/notificationLog.interface'; // Import your INotificationLog interface

const notificationLogSchema = new Schema<INotificationLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the User schema
            required: true,
        },
        notificationId: {
            type: Schema.Types.ObjectId,
            ref: 'Notification', // Reference to the Notification schema
            required: true,
        },
        action: {
            type: String,
            enum: ['seen', 'deleted'], // Define possible actions
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now, // Log the time of the action
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        timestamps: true, // Automatically manages `createdAt` and `updatedAt` fields
    }
);

const NotificationLog = model<INotificationLog>('NotificationLog', notificationLogSchema);

export default NotificationLog;
