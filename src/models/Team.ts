import mongoose, { Document, Schema } from "mongoose";
import ShortUniqueId from 'short-unique-id';
import { ITeam } from '../interfaces/ITeam';

export interface ITeamDocument extends ITeam, Document {}

const TeamSchema = new mongoose.Schema<ITeamDocument>({
    name: { type: String, required: true },
    typeOfSport: { type: String, required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listOfMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pendingMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    activities: [{ type: Schema.Types.ObjectId, ref: 'Activity'}],
    inviteCode: { type: String, unique: true }
});

TeamSchema.pre("save", function (this: ITeamDocument, next: Function) {
    if (this.isNew) {
        const invUid = new ShortUniqueId({ dictionary: "alphanum_upper", length: 6 });
        this.inviteCode = invUid.rnd();
    }
    next();
});
    
const Team = mongoose.model<ITeamDocument>("Team", TeamSchema);
export default Team;
