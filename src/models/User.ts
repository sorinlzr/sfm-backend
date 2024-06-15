import mongoose, { Schema, Document } from "mongoose";
import axios from "axios";
import bcrypt from "bcrypt";
import { IUser } from "../interfaces/IUser";

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String, required: false }
});

userSchema.pre("save", async function (this: IUserDocument, next: Function) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (!this.avatar) {
        const lockNumber = () => Math.floor(Math.random() * 99999) + 1;
        const avatarUrl = await generateRandomUserAvatar(lockNumber());
        this.avatar = avatarUrl;
    }
    next();
});

userSchema.methods.validatePassword = async function (passwordTry: string) {
    return bcrypt.compare(passwordTry, this.password);
};

async function generateRandomUserAvatar(lockNumber: number): Promise<string> {
    try {
        const url = `https://loremflickr.com/640/480/people?lock=${lockNumber}`;
        const response = await axios.get(url);
        const responseUrl = response.request.res.responseUrl;
        return responseUrl;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Network Error: ${error.message}`);
        } else {
            throw error;
        }
    }
}

const User = mongoose.model<IUserDocument>("User", userSchema);
export default User;
