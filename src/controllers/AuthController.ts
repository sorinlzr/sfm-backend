import dotenv from 'dotenv';
dotenv.config({ path: './.env' })

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from "express-async-handler"
import User, { IUserDocument } from "../models/User.js";
import { CookieOptions, Request, Response, NextFunction } from "express";
import userController from './UserController.js';

const TOKEN = "sfm-backend-cookie";

interface AuthController {
    login?: any;
    logout?: any;
    register?: any;
    validateToken?: any;
    getUserIdFromJwtToken?: any;
}

interface AuthPayload {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    avatar?: string;
}

const authController: AuthController = {};

const login = asyncHandler(async (req, res, next): Promise<void> => {
    try {
        console.log("Logging in..");
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const user = await User.findOne({ username });

        if (!user) {
            res.status(404).json({ error: "Username not found" });
            return;
        } else {
            console.log("user found");

            const auth = await bcrypt.compare(password, user.password)
            if (!auth) {
                res.status(401).json({ error: 'Incorrect password' })
            }

            console.log("Matching password");

            const payload: AuthPayload = {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                avatar: user.avatar
            }

            // Sign token
            const token = createSecretToken(payload);
            console.debug("created token");

            const maxAge = Number(process.env.JWT_MAX_AGE) * 1000 || 3600000;
            const cookieOptions: CookieOptions = {
                httpOnly: false,
                secure: false,
                domain: "localhost",
                sameSite: "lax",
                path: "/",
                maxAge: maxAge
            };

            res.
                status(200)
                .cookie(TOKEN, token, cookieOptions)
                .json(payload);
        }


    } catch (error) {
        console.log("Error during login");
        console.error(error);
    }
});

const logout = asyncHandler(async (req, res, next) => {
    try {
        console.log("Logging out");
        // Clear the token cookie
        res.clearCookie(TOKEN);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log("Error during logout");
        console.error(error);
    }
});

const register = asyncHandler(async (req: Request, res: Response) => {
    try { 
        await userController.createUser(req, res);
        res.status(201).json({ message: 'User registered successfully. You can now log in.' });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(400).json({ error: 'An error occurred during registration. Please try again later.' });
    }
});

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.cookies[TOKEN];
    
    if (!token) {
        console.log("Invalid token");
        return res.status(401).send('Unauthorized');
    }

    const jwtSecret = process.env.JWT_SECRET || '';

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    } else {
        jwt.verify(token, jwtSecret, (err: any) => {
            if (err) {
                console.log("Token is invalid or expired");
                return res.status(401).send('Unauthorized');
            }
            next();
        });
    }
};

const getUserIdFromJwtToken = (req: Request) => {
    console.debug("Getting user id from jwt token")
    const jwtSecret = process.env.JWT_SECRET || '';
    try {
        const jwtPayload = jwt.verify(req.cookies[TOKEN], jwtSecret) as AuthPayload;
        return jwtPayload.id;
    }
    catch (error) {
        return "";
    }
}

const createSecretToken = (payload: {}) => {
    return jwt.sign(
        payload,
        String(process.env.JWT_SECRET),
        {
            expiresIn: Number(process.env.JWT_MAX_AGE) * 1000 || 3600000
        }
    );
}

authController.register = register;
authController.login = login;
authController.logout = logout;
authController.validateToken = validateToken;
authController.getUserIdFromJwtToken = getUserIdFromJwtToken;

export default authController;
