import { Schema } from "mongoose";

export interface INotificationLog {
    userId: Schema.Types.ObjectId;
    notificationId: Schema.Types.ObjectId;
    action: 'seen' | 'deleted';
    timestamp?: Date;
}