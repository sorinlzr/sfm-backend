import { ITeam} from '../interfaces/ITeam';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import authController from './AuthController';
import Team from '../models/Team';
import { capitalizeFirstLetter } from '../util/Utils';

interface TeamController {
    getTeam?: any;
    getAllTeams?: any;
    createTeam?: any;
    deleteTeam?: any;
    updateTeam?: any;
    addUserToTeam?: any;
}

const teamController: TeamController = {};

const createTeam = asyncHandler(async (req, res) => {
    try {
        const { name, type } = req.body;
        const teamExists  = await Team.findOne({ "name": capitalizeFirstLetter(String(name)) });
        if (teamExists ) {
            res.status(409);
            throw new Error("A team with this name already exists");
        }

        const jwtUserId = authController.getUserIdFromJwtToken(req);
        const user = await User.findById(jwtUserId);
        
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        console.log("[TeamController] User Id: " + user.id)
        
        const newTeam: ITeam = {
            name: capitalizeFirstLetter(String(name)),
            typeOfSport: capitalizeFirstLetter(String(type)),
            manager: user.id,
            listOfMembers: [user.id],
            activities: [],
            inviteCode: ""
        };

        const newDoc = await Team.create(newTeam);

        const payload = {
            id: newDoc._id,
            name: newDoc.name,
            typeOfSport: newDoc.typeOfSport,
            manager: newDoc.manager,
            members: newDoc.listOfMembers,
            activities: newDoc.activities,
            inviteCode: newDoc.inviteCode
        };
        res.status(201).json({ data: payload });
        
    } catch (error: any) {
        console.error(`Could not create the team with the specified data ${req.body}\n`, error);
        res.status(404).json({ error: "Could not create the team with the specified data. Please check your input" });
    }
});

const deleteTeam = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        const team = await Team.findOne({ "name": name });
        if (!team) {
            res.status(404);
            throw new Error("Team not found");
        }
        const manager = team?.manager;
        console.log("Current user id: ", jwtUserId);
        console.log("Team manager id: ", manager.id);

        if (manager._id.toString() === jwtUserId) {
            await Team.findByIdAndDelete(team._id);
            res.status(200).json({ message: "Team was successfully deleted!" })
        } else {
            res.status(403).json({ error: "Current user is not the manager of the team." });
        }
    } catch (error: any) {
        console.error(`Could not delete the team with id ${req.body.id}\n`, error);
        res.status(404).json({ error: "Could not delete the team with the specified id. Id does not exist" });
    }
});

const getTeam = asyncHandler(async (req, res) => {
    try {
        if (req.query.team) {
            const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.query.team)) });

            if (!team) {
                res.status(404).json({ error: "Could not find the team with the specified name" });
            } else {
                const payload = {
                    id: team._id,
                    name: team.name,
                    typeOfSport: team.typeOfSport,
                    manager: team.manager,
                    members: team.listOfMembers,
                    activities: team.activities,
                    inviteCode: team.inviteCode
                };
                res.status(200).json({ data: payload });
            }
        } else {
            res.status(404).json({ error: "Could not find the team with the specified name" });
        }
    } catch (error: any) {
        console.error(`Could not find the team with the specified name\n`, error);
        res.status(404).json({ error: "Could not find the team with the specified name" });
    }

});

teamController.getAllTeams = asyncHandler(async (req, res) => {
    try {
        const teams = await Team.find({});
        const payload = teams.map(team => ({
            id: team._id,
            name: team.name,
            typeOfSport: team.typeOfSport,
            manager: team.manager,
            members: team.listOfMembers,
            activities: team.activities,
            inviteCode: team.inviteCode
        }));
        res.status(200).json({ data: payload });
    } catch (error: any) {
        console.error(`Could not retrieve teams\n`, error);
        res.status(500).json({ error: "Could not retrieve teams. Please try again later." });
    }
});



const updateTeam = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
            return;
        } else {
            const manager = team?.manager;
            console.log("Current user id: ", jwtUserId);
            console.log("Team manager id: ", manager.id);

            if (manager._id.toString() === jwtUserId) {
                if (req.body.name) {
                    team.name = capitalizeFirstLetter(String(req.body.name));
                }
                if (req.body.type) {
                    team.typeOfSport = capitalizeFirstLetter(String(req.body.type));
                }
                if (req.body.manager) {
                    team.manager = req.body.manager;
                }
                if (req.body.members) {
                    team.listOfMembers = req.body.members;
                }
                if (req.body.activities) {
                    team.activities = req.body.activities;
                }
                if (req.body.inviteCode) {
                    team.inviteCode = req.body.inviteCode;
                }
                await team.save();
                res.status(200).json({ message: "Team updated successfully" });
            } else {
                res.status(403).json({ error: "Current user is not the manager of the team." });
            }
        }
    } catch (error: any) {
        console.error(`Could not update the team with the specified data ${req.body}\n`, error);
        res.status(404).json({ error: "Could not update the team with the specified data. Please check your input" });
    }
});

const addUserToTeam = asyncHandler(async (req, res) => {
    try {
        const team = await Team.findOne({ "name": capitalizeFirstLetter(String(req.body.team)) });
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        if (!team) {
            res.status(404).json({ error: "Could not find the team with the specified name" });
            return;
        } else {
            if (team.manager._id.toString() !== jwtUserId) {
                res.status(401).json({ error: "You are not the manager of this team" });
                return;
            }
            
            const user = await User.findOne({ "username": req.body.username });
            if (!user) {
                res.status(404).json({ error: "Could not find the user with the specified username" });
                return;
            } else {
                team.listOfMembers.push(user.id);
                await team.save();
                res.status(200).json({ message: "User added to team successfully" });
            }
        }
    } catch (error: any) {
        console.error(`Could not add user to the team with the specified data ${req.body}\n`, error);
        res.status(404).json({ error: "Could not add user to the team with the specified data. Please check your input" });
    }
});

teamController.createTeam = createTeam;
teamController.deleteTeam = deleteTeam;
teamController.getTeam = getTeam;
teamController.getAllTeams = teamController.getAllTeams;
teamController.updateTeam = updateTeam;
teamController.addUserToTeam = addUserToTeam;

export default teamController;
