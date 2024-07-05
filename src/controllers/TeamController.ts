import { ITeam } from "../interfaces/ITeam";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import authController from "./AuthController";
import Team from "../models/Team";
import { capitalizeFirstLetter } from "../util/Utils";

interface TeamController {
    getTeam?: any;
    getTeamByManager?: any;
    getTeamsByUser?: any;
    getAllTeams?: any;
    createTeam?: any;
    deleteTeam?: any;
    updateTeam?: any;
    addUserToTeam?: any;
    addUserToPendingMembers?: any;
    removeUserFromTeam?: any;
}

const teamController: TeamController = {};

const createTeam = asyncHandler(async (req, res) => {
    try {
        const { name, typeOfSport } = req.body;
        const teamExists = await Team.findOne({
            name: capitalizeFirstLetter(String(name)),
        });
        if (teamExists) {
            res.status(409);
            throw new Error("A team with this name already exists");
        }

        const jwtUserId = authController.getUserIdFromJwtToken(req);
        const user = await User.findById(jwtUserId);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        console.log("[TeamController] User Id: " + user.id);

        const newTeam: ITeam = {
            name: capitalizeFirstLetter(String(name)),
            typeOfSport: capitalizeFirstLetter(String(typeOfSport)),
            manager: user.id,
            listOfMembers: [user.id],
            pendingMembers: [],
            activities: [],
            inviteCode: "",
        };

        const newDoc = await Team.create(newTeam);

        const populatedTeam = await Team.findById(newDoc._id) 
        .populate("manager listOfMembers pendingMembers")
        .populate({
            path: "activities",
            populate: {
                path: "hostingTeam opponent",
                populate: {
                    path: "name",
                },
                model: "Team",
            },
            model: "Activity",
        })
        .populate({
            path: "activities",
            populate: {
                path: "type",
                populate: {
                    path: "name",
                },
                model: "ActivityType",
            },
            model: "Activity",
        })
        .populate({
            path: "activities",
            populate: {
                path: "listOfGuests",
                model: "User",
            },
            model: "Activity",
        });


        const payload = {
            id: populatedTeam!._id,
            name: populatedTeam!.name,
            typeOfSport: populatedTeam!.typeOfSport,
            manager: populatedTeam!.manager,
            members: populatedTeam!.listOfMembers,
            pendingMembers: [],
            activities: populatedTeam!.activities,
            inviteCode: populatedTeam!.inviteCode,
        };
        res.status(201).json({ data: payload });
    } catch (error: any) {
        console.error(
            `Could not create the team with the specified data ${req.body}\n`,
            error
        );
        res.status(404).json({
            error: "Could not create the team with the specified data. Please check your input",
        });
    }
});

const getTeamsByUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;

        const teams = await Team.find({ listOfMembers: userId })
            .populate("manager listOfMembers pendingMembers")
            .populate({
                path: "activities",
                populate: {
                    path: "hostingTeam opponent",
                    populate: {
                        path: "name",
                    },
                    model: "Team",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "type",
                    populate: {
                        path: "name",
                    },
                    model: "ActivityType",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "listOfGuests",
                    model: "User",
                },
                model: "Activity",
            });

        if (teams.length === 0) {
            res.status(404).json({
                error: "No teams found for this user",
            });
            return;
        }

        const payload = teams.map((team) => ({
            id: team._id,
            name: team.name,
            typeOfSport: team.typeOfSport,
            manager: team.manager,
            members: team.listOfMembers,
            pendingMembers: team.pendingMembers,
            activities: team.activities,
            inviteCode: team.inviteCode,
        }));

        res.status(200).json({ data: payload });
    } catch (error) {
        console.error(`Could not retrieve teams for the user\n`, error);
        res.status(500).json({
            error: "Could not retrieve teams. Please try again later.",
        });
    }
});

const deleteTeam = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        const team = await Team.findOne({ name: name });
        if (!team) {
            res.status(404);
            throw new Error("Team not found");
        }
        const manager = team?.manager;
        console.log("Current user id: ", jwtUserId);
        console.log("Team manager id: ", manager.id);

        if (manager._id.toString() === jwtUserId) {
            await Team.findByIdAndDelete(team._id);
            res.status(200).json({ message: "Team was successfully deleted!" });
        } else {
            res.status(403).json({
                error: "Current user is not the manager of the team.",
            });
        }
    } catch (error: any) {
        console.error(
            `Could not delete the team with id ${req.body.id}\n`,
            error
        );
        res.status(404).json({
            error: "Could not delete the team with the specified id. Id does not exist",
        });
    }
});

const getTeam = asyncHandler(async (req, res) => {
    try {
        if (req.query.team) {
            const team = await Team.findOne({
                name: capitalizeFirstLetter(String(req.query.team)),
            });

            if (!team) {
                res.status(404).json({
                    error: "Could not find the team with the specified name",
                });
            } else {
                const payload = {
                    id: team._id,
                    name: team.name,
                    typeOfSport: team.typeOfSport,
                    manager: team.manager,
                    members: team.listOfMembers,
                    pendingMembers: team.pendingMembers,
                    activities: team.activities,
                    inviteCode: team.inviteCode,
                };
                res.status(200).json({ data: payload });
            }
        } else {
            res.status(404).json({
                error: "Could not find the team with the specified name",
            });
        }
    } catch (error: any) {
        console.error(
            `Could not find the team with the specified name\n`,
            error
        );
        res.status(404).json({
            error: "Could not find the team with the specified name",
        });
    }
});

const getTeamByManager = asyncHandler(async (req, res) => {
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);
        const team = await Team.findOne({ manager: jwtUserId })
            .populate("manager listOfMembers pendingMembers")
            .populate({
                path: "activities",
                populate: {
                    path: "hostingTeam opponent",
                    populate: {
                        path: "name",
                    },
                    model: "Team",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "type",
                    populate: {
                        path: "name",
                    },
                    model: "ActivityType",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "listOfGuests",
                    model: "User",
                },
                model: "Activity",
            });

        if (!team) {
            res.status(404).json({
                error: "No team found for the current manager",
            });
            return;
        }

        const payload = {
            id: team._id,
            name: team.name,
            typeOfSport: team.typeOfSport,
            manager: team.manager,
            members: team.listOfMembers,
            pendingMembers: team.pendingMembers,
            activities: team.activities,
            inviteCode: team.inviteCode,
        };
        res.status(200).json({ data: payload });
    } catch (error) {
        console.error(
            `Could not retrieve the team for the current manager\n`,
            error
        );
        res.status(500).json({
            error: "Could not retrieve the team. Please try again later.",
        });
    }
});

teamController.getAllTeams = asyncHandler(async (req, res) => {
    try {
        const teams = await Team.find({});
        const payload = teams.map((team) => ({
            id: team._id,
            name: team.name,
            typeOfSport: team.typeOfSport,
            manager: team.manager,
            members: team.listOfMembers,
            activities: team.activities,
            inviteCode: team.inviteCode,
        }));
        res.status(200).json({ data: payload });
    } catch (error: any) {
        console.error(`Could not retrieve teams\n`, error);
        res.status(500).json({
            error: "Could not retrieve teams. Please try again later.",
        });
    }
});

const updateTeam = asyncHandler(async (req, res) => {

    const teamId = req.params.teamId;
    const { name, typeOfSport } = req.body;
    console.log("Request body: ", req.body)
    console.log("teamId: ", teamId)
    
    try {
        const jwtUserId = authController.getUserIdFromJwtToken(req);

        const team = await Team.findById(teamId);
        if (!team) {
            res.status(404).json({
                error: "Could not find the team with the specified name",
            });
            return;
        } else {
            const manager = team?.manager;
            console.log("Current user id: ", jwtUserId);
            console.log("Team manager id: ", manager.id);

            if (manager._id.toString() === jwtUserId) {
                if (name && name !== team.name) {
                    team.name = capitalizeFirstLetter(String(name));
                }
                if (typeOfSport && typeOfSport !== team.typeOfSport) {
                    team.typeOfSport = capitalizeFirstLetter(
                        String(typeOfSport)
                    );
                }
                await team.save();

                const updatedTeam = await Team.findById(team._id)
                    .populate("manager listOfMembers pendingMembers")
                    .populate({
                        path: "activities",
                        populate: {
                            path: "hostingTeam opponent",
                            populate: {
                                path: "name",
                            },
                            model: "Team",
                        },
                        model: "Activity",
                    })
                    .populate({
                        path: "activities",
                        populate: {
                            path: "type",
                            populate: {
                                path: "name",
                            },
                            model: "ActivityType",
                        },
                        model: "Activity",
                    })
                    .populate({
                        path: "activities",
                        populate: {
                            path: "listOfGuests",
                            model: "User",
                        },
                        model: "Activity",
                    });

                const payload = {
                    id: updatedTeam!._id,
                    name: updatedTeam!.name,
                    typeOfSport: updatedTeam!.typeOfSport,
                    manager: updatedTeam!.manager,
                    members: updatedTeam!.listOfMembers,
                    pendingMembers: updatedTeam!.pendingMembers,
                    activities: updatedTeam!.activities,
                    inviteCode: updatedTeam!.inviteCode,
                };

                res.status(200).json({ data: payload });
            } else {
                res.status(403).json({
                    error: "Current user is not the manager of the team.",
                });
            }
        }
    } catch (error: any) {
        console.error(
            `Could not update the team with the specified data ${req.body}\n`,
            error
        );
        res.status(404).json({
            error: "Could not update the team with the specified data. Please check your input",
        });
    }
});
const addUserToPendingMembers = asyncHandler(async (req, res) => {
    try {
        let { userId, inviteCode } = req.body;
        inviteCode = inviteCode.toUpperCase();

        const user = await User.findById(userId);
        const team = await Team.findOne({
            inviteCode: inviteCode,
        });

        if (!team || !user) {
            res.status(404).json({
                error: "Could not find the team or user with the specified information",
            });
            return;
        }
        
        team.pendingMembers.push(user.id);

        await team.save();
        const updatedTeam = await Team.findOne({
            name: capitalizeFirstLetter(team.name),
        })
            .populate("manager listOfMembers pendingMembers")
            .populate({
                path: "activities",
                populate: {
                    path: "hostingTeam opponent",
                    populate: {
                        path: "name",
                    },
                    model: "Team",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "type",
                    populate: {
                        path: "name",
                    },
                    model: "ActivityType",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "listOfGuests",
                    model: "User",
                },
                model: "Activity",
            });
        const payload = {
            id: updatedTeam!._id,
            name: updatedTeam!.name,
            typeOfSport: updatedTeam!.typeOfSport,
            manager: updatedTeam!.manager,
            members: updatedTeam!.listOfMembers,
            pendingMembers: updatedTeam!.pendingMembers,
            activities: updatedTeam!.activities,
            inviteCode: updatedTeam!.inviteCode,
        };
        res.status(200).json({ data: payload });
    } catch (error) {
        console.error("addUserToPendingMembers error:", error);
        res.status(500).send({ message: "Server error" });
    }
});

const addUserToTeam = asyncHandler(async (req, res) => {
    try {
        const { teamName, userId } = req.body;

        const team = await Team.findOne({
            name: capitalizeFirstLetter(teamName),
        });
        const user = await User.findById(userId);

        if (!team || !user) {
            res.status(404).json({
                error: "Could not find the team or user with the specified information",
            });
            return;
        }

        const jwtUserId = authController.getUserIdFromJwtToken(req);
        if (team.manager._id.toString() !== jwtUserId) {
            res.status(401).json({
                error: "You are not the manager of this team",
            });
            return;
        }

        // check if the user is in the pendingMembers list then add to listOfMembers and remove from pendingMembers
        if (
            team.pendingMembers.some(
                (member) => member._id.toString() === userId
            )
        ) {
            team.listOfMembers.push(user.id);
            team.pendingMembers = team.pendingMembers.filter(
                (member) => member._id.toString() !== userId
            );

            await team.save();
            const updatedTeam = await Team.findOne({
                name: capitalizeFirstLetter(teamName),
            })
                .populate("manager listOfMembers pendingMembers")
                .populate({
                    path: "activities",
                    populate: {
                        path: "hostingTeam opponent",
                        populate: {
                            path: "name",
                        },
                        model: "Team",
                    },
                    model: "Activity",
                })
                .populate({
                    path: "activities",
                    populate: {
                        path: "type",
                        populate: {
                            path: "name",
                        },
                        model: "ActivityType",
                    },
                    model: "Activity",
                })
                .populate({
                    path: "activities",
                    populate: {
                        path: "listOfGuests",
                        model: "User",
                    },
                    model: "Activity",
                });
            const payload = {
                id: updatedTeam!._id,
                name: updatedTeam!.name,
                typeOfSport: updatedTeam!.typeOfSport,
                manager: updatedTeam!.manager,
                members: updatedTeam!.listOfMembers,
                pendingMembers: updatedTeam!.pendingMembers,
                activities: updatedTeam!.activities,
                inviteCode: updatedTeam!.inviteCode,
            };
            res.status(200).json({ data: payload });
        } else {
            res.status(400).json({
                error: "User is not in the pendingMembers list",
            });
        }
    } catch (error) {
        console.error("addUserToTeam error:", error);
        res.status(500).send({ message: "Server error" });
    }
});

const removeUserFromTeam = asyncHandler(async (req, res) => {
    try {
        const { teamName, userId } = req.body;

        const team = await Team.findOne({
            name: capitalizeFirstLetter(teamName),
        });
        const user = await User.findById(userId);

        if (!team || !user) {
            res.status(404).json({
                error: "Could not find the team or user with the specified information",
            });
            return;
        }
        const jwtUserId = authController.getUserIdFromJwtToken(req);
        if (team.manager._id.toString() !== jwtUserId) {
            res.status(401).json({
                error: "You are not the manager of this team",
            });
            return;
        }
        if (
            team.pendingMembers.some(
                (member) => member._id.toString() === userId
            )
        ) {
            team.pendingMembers = team.pendingMembers.filter(
                (member) => member._id.toString() !== userId
            );
        } else if (
            team.listOfMembers.some(
                (member) => member._id.toString() === userId
            )
        ) {
            team.listOfMembers = team.listOfMembers.filter(
                (member) => member._id.toString() !== userId
            );
        } else {
            res.status(400).json({
                error: "User is not part of the team's members or pending members list",
            });
            return;
        }

        await team.save();

        const updatedTeam = await Team.findOne({
            name: capitalizeFirstLetter(teamName),
        })
            .populate("manager listOfMembers pendingMembers")
            .populate({
                path: "activities",
                populate: {
                    path: "hostingTeam opponent",
                    populate: {
                        path: "name",
                    },
                    model: "Team",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "type",
                    populate: {
                        path: "name",
                    },
                    model: "ActivityType",
                },
                model: "Activity",
            })
            .populate({
                path: "activities",
                populate: {
                    path: "listOfGuests",
                    model: "User",
                },
                model: "Activity",
            });
        const payload = {
            id: updatedTeam!._id,
            name: updatedTeam!.name,
            typeOfSport: updatedTeam!.typeOfSport,
            manager: updatedTeam!.manager,
            members: updatedTeam!.listOfMembers,
            pendingMembers: updatedTeam!.pendingMembers,
            activities: updatedTeam!.activities,
            inviteCode: updatedTeam!.inviteCode,
        };
        res.status(200).json({ data: payload });
    } catch (error) {
        console.error("removeUserFromTeam error:", error);
        res.status(500).send({ message: "Server error" });
    }
});

teamController.createTeam = createTeam;
teamController.deleteTeam = deleteTeam;
teamController.getTeam = getTeam;
teamController.getTeamByManager = getTeamByManager;
teamController.getTeamsByUser = getTeamsByUser;
teamController.getAllTeams = teamController.getAllTeams;
teamController.updateTeam = updateTeam;
teamController.addUserToTeam = addUserToTeam;
teamController.addUserToPendingMembers = addUserToPendingMembers;
teamController.removeUserFromTeam = removeUserFromTeam;

export default teamController;
