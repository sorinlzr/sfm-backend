import { Types } from "mongoose";


export interface ITeam {
    name: string;
    typeOfSport: string;
    manager: Types.ObjectId;
    listOfMembers: Types.ObjectId[];
    pendingMembers: Types.ObjectId[];
    activities: Types.ObjectId[];
    inviteCode: string;
}