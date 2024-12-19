import mongoose, { Schema, Document } from "mongoose";

// seenNotification.interface.ts
export interface ISeenNotification extends Document {
    userId: Schema.Types.ObjectId;
    notificationId: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISeenNotificationModel extends mongoose.Model<ISeenNotification> { }
