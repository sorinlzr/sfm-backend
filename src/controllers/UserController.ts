import User from "../models/User";
import { IUser } from "../interfaces/IUser.js";

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Team from "../models/Team";
import authController from "./AuthController";
import express from 'express';

interface UserController {
    createUser?: any;
    getUsers?: any;
    getOneUser?: any;
    updateUser?: any;
}

const userController: UserController = {};

const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, inviteCode } = req.body;
    console.log(req.body);

    try {
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            console.error(
                `Error creating user. There is already an user with the same email or username\n`
            );
            res.status(400).json({
                error: "There is already an user with the same email or username",
            });
            return;
        }

        const newUser: IUser = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
        };

        const newDoc = await User.create(newUser);

        if (inviteCode !== "") {
            const team = await Team.findOne({ "inviteCode" : inviteCode });
            if (team) {
                team?.pendingMembers.push(newDoc.id);
                await team.save();
            } else {
                console.log("Could not add user to team, the team with the given invite code does not exist.");
            }
        }

        const payload = {
            id: newDoc._id,
            username: newDoc.username,
            firstname: newDoc.firstname,
            lastname: newDoc.lastname,
            email: newDoc.email,
            avatar: newDoc.avatar,
        };

        res.status(201).json({ data: payload });
    } catch (error: any) {
        console.error(`There was a problem creating the user\n`, error);
        res.status(400).json({
            error: "There was a problem creating the user. Please check your input",
        });
    }
});

const getUsers = asyncHandler(async (req, res, next) => {
    const document = await User.find();

    const users = document.map((doc) => ({
        id: doc._id,
        username: doc.username,
        firstname: doc.firstname,
        lastname: doc.lastname,
        email: doc.email,
        avatar: doc.avatar
    }));

    res.status(200).json({ size: document.length, data: users });
});

const getOneUser = asyncHandler(async (req, res, next) => {
    const document = await User.findById(req.params.userId); 
    if (!document) {
        res.status(404).json({ error: "User not found" });
    } else {
        const payload = {
            id: document._id,
            username: document.username,
            firstname: document.firstname,
            lastname: document.lastname,
            avatar: document.avatar,
            email: document.email
        };

        res.status(200).json({ data: payload });
    }
});

const updateUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const jwtUserId = authController.getUserIdFromJwtToken(req);
        if (!jwtUserId) {
            res.status(401).json({ error: "You must be logged in to perform this action" });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        if (user.id !== jwtUserId) {
            res.status(403).json({ error: "You are not authorized to update this user" });
            return;
        }

        if (req.body.firstname && req.body.firstname !== user.firstname) {
            user.firstname = req.body.firstname;
        }
        if (req.body.lastname && req.body.lastname !== user.lastname) {
            user.lastname = req.body.lastname;
        }
        if (req.body.username && req.body.username !== user.username) {
            const existingUser = await User.findOne({
                username: req.body.username,
            });
            if (existingUser) {
                console.error(
                    `Error creating user. There is already an user with the same username\n`
                );
                res.status(400).json({
                    error: "There is already an user with the same username",
                });
                return;
            } else {
                user.username = req.body.username;
            }
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        console.log("user.email")
        console.log(user.email)
        console.log(req.body.email)
        console.log("req.body.email")
        
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                console.error(
                    `Error creating user. There is already an user with the same email\n`
                );
                res.status(400).json({
                    error: "There is already an user with the same email",
                });
                return;
            } else {
                user.email = req.body.email;
            }
        }
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }
        const document = await user.save();
        
        const payload = {
            id: document._id,
            username: document.username,
            firstname: document.firstname,
            lastname: document.lastname,
            avatar: document.avatar,
            email: document.email
        };

        res.status(200).json({data: payload});
    } catch (error: any) {
        console.error(`Could not update the user with the specified data ${req.body}\n`, error);
        res.status(404).json({ error: "Could not update the user with the specified data. Please check your input" });
    }
});

userController.getUsers = getUsers;
userController.createUser = createUser;
userController.getOneUser = getOneUser;
userController.updateUser = updateUser;

export default userController;
