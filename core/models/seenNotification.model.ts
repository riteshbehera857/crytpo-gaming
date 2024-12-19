import { Schema, model } from 'mongoose';
import { ISeenNotification } from '../../common/interfaces/IseenNotification';
// import { ISeenNotification } from '../../common/interfaces/IseenNotification';


const seenNotificationSchema = new Schema<ISeenNotification>(
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
    },
    {
        toJSON: {
            virtuals: true,
        },
        timestamps: true, // Automatically manages `createdAt` and `updatedAt` fields
    }
);

const SeenNotification = model<ISeenNotification>('SeenNotification', seenNotificationSchema);

export default SeenNotification;
