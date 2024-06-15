import mongoose, { Document, Schema } from "mongoose";
import { IActivity } from "../interfaces/IActivity";

export interface IActivityDocument extends IActivity, Document {}

const ActivitySchema = new mongoose.Schema<IActivityDocument>({
    subject: { type: String, required: true },
    hostingTeam: { type: Schema.Types.ObjectId, ref: 'Team' },
    type: {type: Schema.Types.ObjectId, ref: 'ActivityType', required: true },
    opponent: { type: Schema.Types.ObjectId, ref: 'Team', required: false },
    date: { type: Date },
    location: { type: String },
    listOfGuests: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        attendance: { type: Boolean }
    }]
});

const Activity = mongoose.model<IActivityDocument>('Activity', ActivitySchema);
export default Activity
