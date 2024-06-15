import { Types } from "mongoose";


export interface IActivity  {
    subject: string;
    type: Types.ObjectId;
    hostingTeam: Types.ObjectId;
    opponent?: Types.ObjectId;
    date: Date;
    location: string;
    listOfGuests: Types.ObjectId[]
}