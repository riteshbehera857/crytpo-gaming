import mongoose, { Schema } from "mongoose";

// notification.interface.ts
export interface INotification {
    _id?: Schema.Types.ObjectId,
    title: string;
    body: string;
    type: 'info' | 'warning' | 'alert'; // example types
    scheduleTime: Date;
    recipients: string[] | null;
    status: 'pending' | 'sent' | 'failed'; // example statuses
    createdBy: Schema.Types.ObjectId; // ID of the admin/user who created the notification
    updatedBy?: Schema.Types.ObjectId; // ID of the admin/user who last updated the notification
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export interface INotificationModel extends mongoose.Model<INotification> { }
