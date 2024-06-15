import mongoose, { Document } from "mongoose";

export enum RoleEnum {
    Player,
    Manager
}

export interface Role extends Document {
    name: string;
}

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: Object.values(RoleEnum),
        required: true,
        unique: true
    }
});

const RoleModel = mongoose.model<Role>('Role', RoleSchema);
export default RoleModel;
