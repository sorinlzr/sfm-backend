import mongoose, { Document } from "mongoose";

export enum ActivityTypeEnum {
    Training,
    Game,
    OtherActivity = "Other activity"
}
export interface ActivityType extends Document {
    name: string;
}

const ActivityTypeSchema = new mongoose.Schema<ActivityType>({
    name: {
        type: String,
        enum: Object.values(ActivityTypeEnum),
        default: ActivityTypeEnum.OtherActivity.valueOf(),
        required: true,
        unique: true
    }
});

const ActivityTypeModel = mongoose.model<ActivityType>('ActivityType', ActivityTypeSchema);
export default ActivityTypeModel
