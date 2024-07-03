import asyncHandler from "express-async-handler";
import moment from 'moment';

import Team from "../models/Team";
import Activity from "../models/Activity";
import authController from "./AuthController";
import { capitalizeFirstLetter } from "../util/Utils";
import { IActivity } from "../interfaces/IActivity";
import User from "../models/User";
import ActivityTypeModel, { ActivityTypeEnum } from "../models/ActivityType";

interface ActivityController {
    createActivity?: any;
    getActivities?: any;
    getUserActivities?: any;
    addActivity?: any;
    updateActivity?: any;
    deleteActivity?: any;
}

const activityController: ActivityController = {};

const createActivity = asyncHandler(async (req, res) => {
    try {
        console.log(req.body);

        const jwtUserId = authController.getUserIdFromJwtToken(req);
        if (!jwtUserId) {
            res.status(401).json({ error: "You must be logged in to perform this action" });
            return;
        }
        console.log(`[ActivityController] JwtUserId: ${jwtUserId}`);

        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });

        let opponent;
        if (req.body.opponent) {
            opponent = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.opponent)) });

        } else {
            opponent = team
        }
        if (!team || !opponent) {
            res.status(404).json({ error: "Could not find the team with the specified name. Please check your input" });
            return;
        } else {
            if (team.manager._id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
                return;
            }

            let activityType;
            if (Object.values(ActivityTypeEnum).includes(req.body.activityType)) {
                activityType = await ActivityTypeModel.findOne({ "name": capitalizeFirstLetter(req.body.activityType) });
            } else {
                activityType = await ActivityTypeModel.findOne({ "name": ActivityTypeEnum.OtherActivity.valueOf() });
            }

            console.log("========================req.body.date")
            // console.log(req.body.date)

            // const dateFormat = 'YYYY-MM-DDTHH:mm:ss+Z';
            // if (!moment(req.body.date, dateFormat, true).isValid()) {
            //     res.status(400).json({ error: "Invalid date format. Please use ISO 8601 format (e.g., 2023-06-18T15:30:00+Z)." });
            //     return;
            // }

            // const listOfGuests = req.body.listOfGuests.map((guest: any) => {
            //     if (typeof guest === 'string') {
            //         return { _id: guest, attendance: true }; // default attendance is true when creating the activity
            //     }
            //     return guest;
            // });

            const newActivity: IActivity = {
                subject: req.body.subject,
                type: activityType?.id,
                hostingTeam: team.id,
                opponent: opponent.id,
                date: new Date(),
                location: req.body.location,
                listOfGuests: [{ _id: jwtUserId, attendance: true }] 
            }

            const newDoc = await Activity.create(newActivity);

            team.activities.push(newDoc.id);
            await team.save();
            opponent.activities.push(newDoc.id);
            await opponent.save();

            const activities = await Activity.find({ _id: { $in: team.activities } })
                            .populate('hostingTeam', 'name typeOfSport manager')
                            .populate('type', 'name')
                            .populate('opponent', 'name typeOfSport manager')
                            .populate('listOfGuests._id', 'firstname lastname username avatar');


            res.status(200).json({ data: activities });

        }   
    } catch (error: any) {
        console.error(`An error has occured trying to create an activity for the team\n`, error);
        res.status(404).json({ error: "An error has occured trying to create an activity for the team" });
    }
});

const getActivities = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        const team = await Team.findOne({ name: capitalizeFirstLetter(String(req.query.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
            return;
        }

        const currentUser = await User.findById(jwtUserId);
        if (!currentUser || (team.manager._id.toString() !== jwtUserId && !team.listOfMembers.includes(currentUser.id))) {
            res.status(401).json({ error: "You are not a member or manager of this team" });
            return;
        }

        const activities = await Activity.find({ _id: { $in: team.activities } });
        res.status(200).json({ data: activities });
    } catch (error: any) {
        console.error("An error has occurred trying to get the team activities\n", error);
        res.status(500).json({ error: "An error has occurred trying to get the team activities" });
    }
});

const getUserActivities = asyncHandler(async (req, res) => {
    try {
        console.log("Getting user activities")
        const jwtUserId = authController.getUserIdFromJwtToken(req);
        if (!jwtUserId) {
            res.status(401).json({ error: "You must be logged in to perform this action" });
            return;
        }

        // const username = req.body.username;
        // if (!username) {
        //     res.status(400).json({ error: "User ID is required" });
        //     return;
        // }

        const user = await User.findById(jwtUserId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const activities = await Activity.find({ "listOfGuests._id": jwtUserId })
            .populate('hostingTeam', 'name typeOfSport manager')
            .populate('type', 'name')
            .populate('opponent', 'name typeOfSport manager')
            .populate('listOfGuests._id', 'firstname lastname username avatar');

        res.status(200).json({ data: activities });
    } catch (error) {
        console.error("An error has occurred trying to get the user activities\n", error);
        res.status(500).json({ error: "An error has occurred trying to get the user activities" });
    }
});

const addActivity = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
    
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
            return;
        } else {
            if (team.manager._id.toString()  !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
                return; 
            }
            const activity = await Activity.findById(req.body.activity);
            if (!activity) {
                res.status(404).json({ error: "Could not find the activity with the specified id" });
                return;
            } else {
                team.activities.push(req.body.activity);
                await team.save();
                res.status(200).json({ data: team.activities });
            }
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
        const opponent = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.opponent)) });
        if (!team || !opponent) {
            res.status(404).json({ error: "Could not find the team with the specified name. Please check your input" });
            return;
        } else {
            if (team.manager._id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
                return;
            }
            const activity = await Activity.findById(req.body.activity);
            if (!activity) {
                res.status(404).json({ error: "Could not find the activity with the specified id" });
                return;
            } else {
                if (req.body.subject) {
                    activity.subject = req.body.subject;
                }
                if (req.body.activityType) {
                    let activityType;
                    if (Object.values(ActivityTypeEnum).includes(req.body.activityType)) {
                        activityType = await ActivityTypeModel.findOne({ "name": capitalizeFirstLetter(req.body.activityType) });
                    } else {
                        activityType = await ActivityTypeModel.findOne({ "name": ActivityTypeEnum.OtherActivity.valueOf() });
                    }
                    activity.type = activityType?.id;
                }
                if (req.body.opponent) {
                    activity.opponent = opponent.id;
                }
                if (req.body.date) {
                    const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ';
                    if (!moment(req.body.date, dateFormat, true).isValid()) {
                        res.status(400).json({ error: "Invalid date format. Please use ISO 8601 format (e.g., 2023-06-18T15:30:00Z)." });
                        return;
                    }
                    activity.date = new Date(req.body.date)
                }
                if (req.body.location) {
                    activity.location = req.body.location;
                }
                if (req.body.listOfGuests) {
                    for (const guest of req.body.listOfGuests) {
                        if (!guest._id || typeof guest.attendance !== 'boolean') {
                            res.status(400).json({ error: "Each guest must have an _id and an attendance field with a boolean value" });
                            return;
                        }
                        const user = await User.findById(guest._id);
                        if (!user) {
                            res.status(404).json({ error: `User with id ${guest._id} does not exist` });
                            return;
                        }
                    }
                    activity.listOfGuests = req.body.listOfGuests;
                }
                await activity.save();
                const activities = await Activity.find({ _id: { $in: team.activities } })
                            .populate('hostingTeam', 'name typeOfSport manager')
                            .populate('type', 'name')
                            .populate('opponent', 'name typeOfSport manager')
                            .populate('listOfGuests._id', 'firstname lastname username avatar');

                            

            res.status(200).json({ data: activities });
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
            return;
        } else {
            if (team.manager._id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
                return;
            }
            const activity = await Activity.findById(req.body.activity);
            if (!activity) {
                res.status(404).json({ error: "Could not find the activity with the specified id" });
                return;
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
activityController.getUserActivities = getUserActivities;
activityController.addActivity = addActivity;
activityController.updateActivity = updateActivity;
activityController.deleteActivity = deleteActivity;

export default activityController;