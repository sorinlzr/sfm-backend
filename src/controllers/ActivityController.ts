import Team from "../models/Team";
import Activity from "../models/Activity";
import asyncHandler from "express-async-handler";
import authController from "./AuthController";
import { capitalizeFirstLetter } from "../util/Utils";
import { IActivity } from "../interfaces/IActivity";
import User from "../models/User";
import ActivityTypeModel, { ActivityTypeEnum } from "../models/ActivityType";

interface ActivityController {
    createActivity?: any;
    getActivities?: any;
    addActivity?: any;
    updateActivity?: any;
    deleteActivity?: any;
}

const activityController: ActivityController = {};

const createActivity = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        } else {
            if (team.manager.id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
            }
            const newActovityType = await ActivityTypeModel.findOne({ "name": capitalizeFirstLetter(req.body.activityType) });

            //TODO check if this shady logic for the activity type is correct
            
            const newActivity: IActivity = {
                subject: req.body.subject,
                type: newActovityType ? newActovityType.id : ActivityTypeEnum.OtherActivity.valueOf(),
                hostingTeam: team.id,
                opponent: req.body.opponent,
                date: req.body.date,
                location: req.body.location,
                listOfGuests: req.body.listOfGuests
            }

            const newDoc = await Activity.create(newActivity);

            team.activities.push(newDoc.id);
            await team.save();
            res.status(200).json({ data: team.activities });
        }
    } catch (error: any) {
        console.error(`An error has occured trying to create an activity for the team\n`, error);
        res.status(404).json({ error: "An error has occured trying to create an activity for the team" });
    }
});

const getActivities = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        } else {
            const currentUser = await User.findOne({ "id": jwtUserId });
            if (currentUser) {
                if (team.manager.id.toString() !== jwtUserId || !team.listOfMembers.includes(currentUser.id)) {
                    res.status(401).json({ error: "You are not a member or manager of this team" });
                }
                res.status(200).json({ data: team.activities });
            }
        }
    } catch (error: any) {
        console.error(`An error has occured trying to get the team activities\n`, error);
        res.status(404).json({ error: "An error has occured trying to get the team activities" });
    }
});

const addActivity = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        } else {
            if (team.manager.id.toString()  !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
            }
            team.activities.push(req.body.activity);
            await team.save();
            res.status(200).json({ data: team.activities });
        }
    } catch (error: any) {
        console.error(`An error has occured trying to add an activity to the team\n`, error);
        res.status(404).json({ error: "An error has occured trying to add an activity to the team" });
    }  
})

const updateActivity = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        } else {
            if (team.manager.id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
            }
            const activity = await Activity.findById(req.body.activity);
            if (!activity) {
                res.status(404).json({ error: "Could not find the activity with the specified id" });
            } else {
                if (req.body.subject) {
                    activity.subject = req.body.subject;
                }
                if (req.body.type) {
                    activity.type = req.body.type;
                }
                if (req.body.opponent) {
                    activity.opponent = req.body.opponent;
                }
                if (req.body.date) {
                    activity.date = req.body.date;
                }
                if (req.body.location) {
                    activity.location = req.body.location;
                }
                if (req.body.listOfGuests) {
                    activity.listOfGuests = req.body.listOfGuests;
                }
                await activity.save();
                res.status(200).json({ data: activity });
            }
        }
    } catch (error: any) {
        console.error(`An error has occured trying to update the activity\n`, error);
        res.status(404).json({ error: "An error has occured trying to update the activity" });
    }
});

const deleteActivity = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        } else {
            if (team.manager.id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
            }
            const activity = await Activity.findById(req.body.activity);
            if (!activity) {
                res.status(404).json({ error: "Could not find the activity with the specified id" });
            } else {
                team.activities = team.activities.filter((act) => act.id !== activity.id);
                await team.save();
                await Activity.findByIdAndDelete(activity.id);
                res.status(200).json({ message: "Activity deleted successfully" });
            }
        }
    } catch (error: any) {
        console.error(`An error has occured trying to delete the activity\n`, error);
        res.status(404).json({ error: "An error has occured trying to delete the activity" });
    }
});

activityController.createActivity = createActivity;
activityController.getActivities = getActivities;
activityController.addActivity = addActivity;
activityController.updateActivity = updateActivity;
activityController.deleteActivity = deleteActivity;

export default activityController;