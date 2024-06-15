import "dotenv/config";
import mongoose from "mongoose";
import RoleModel, { RoleEnum } from "../models/Role";
import ActivityTypeModel, { ActivityTypeEnum } from "../models/ActivityType";

const mongodbURI: string = `mongodb+srv://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

export const connectToDatabase = async (): Promise<void> => {
    try {
        console.log("MongoDB: Establishing a database connection...");
        await mongoose.connect(mongodbURI, {
            authSource: "admin",
        });

        console.log("MongoDB is Connected...");
    } catch (err: any) {
        console.log("There was an issue connecting to MongoDB");
        console.error(err.message);
    }
};

export const initializeEnums = async(): Promise<void> => {
    const roles = Object.values(RoleEnum).filter(value => typeof value === 'string');
    console.debug("Roles: ", roles);
    for (const role of roles) {
      const existingRole = await RoleModel.findOne({ name: role });
      if (!existingRole) {
        console.debug("Creating new role: ", role)
        const newRole = new RoleModel({ name: role });
        await newRole.save();
        console.debug('Role created: ', role);
      }
    }

    const activityTypes = Object.values(ActivityTypeEnum).filter(value => typeof value === 'string');
    console.debug("Activity types: ", activityTypes);
    for (const type of activityTypes) {
      const existingType = await ActivityTypeModel.findOne({ name: type });
      if (!existingType) {
        console.debug("Creating new activity type: ", type)
        const newType = new ActivityTypeModel({ name: type });
        await newType.save();
        console.debug('Activity type created: ', type);
      }
    }
}
