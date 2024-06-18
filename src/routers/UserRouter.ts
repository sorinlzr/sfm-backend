import express from 'express';
import userController from '../controllers/UserController';
import authController from '../controllers/AuthController';

const userRouter = express.Router();

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *               inviteCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: There is already a user with the same email or username
 */
userRouter.post('/', userController.createUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 size:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60f6b9c2b43e4b23d4d6b82a"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       firstname:
 *                         type: string
 *                         example: "John"
 *                       lastname:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       avatar:
 *                         type: string
 *                         example: "avatar-url"
 */
userRouter.get('/', userController.getUsers);

/**
 * @swagger
 * /api/user/{username}:
 *   get:
 *     summary: Get a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f6b9c2b43e4b23d4d6b82a"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     firstname:
 *                       type: string
 *                       example: "John"
 *                     lastname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     avatar:
 *                       type: string
 *                       example: "avatar-url"
 *       404:
 *         description: User not found
 */
userRouter.get('/:username', userController.getOneUser);

/**
 * @swagger
 * /api/user/{username}:
 *   put:
 *     summary: Update a user's details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *               update:
 *                 type: string
 *                 example: "true"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or user already exists with the same email or username
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: You are not authorized to update this user
 *       404:
 *         description: User not found
 */
userRouter.put('/:username', authController.validateToken, userController.updateUser);

export default userRouter;
