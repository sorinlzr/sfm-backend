import express from 'express';
import teamController from '../controllers/TeamController';
import authController from '../controllers/AuthController';

const teamRouter = express.Router();

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Get team details
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the team
 *     responses:
 *       200:
 *         description: Team details retrieved successfully
 *       400:
 *         description: Team name is required
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
teamRouter.get('/', teamController.getTeam);

/**
 * @swagger
 * /api/team/all:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *       500:
 *         description: Server error
 */
teamRouter.get('/all', teamController.getAllTeams);

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Name and type of sport are required
 *       409:
 *         description: A team with this name already exists
 *       500:
 *         description: Server error
 */
teamRouter.post('/', authController.validateToken, teamController.createTeam);

/**
 * @swagger
 * /api/team/add:
 *   put:
 *     summary: Add user to team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added to team successfully
 *       400:
 *         description: Team name and username are required
 *       401:
 *         description: You are not the manager of this team
 *       404:
 *         description: Team or user not found
 *       500:
 *         description: Server error
 */
teamRouter.put('/add', authController.validateToken, teamController.addUserToTeam);

/**
 * @swagger
 * /api/team/update:
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               manager:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       400:
 *         description: Team name is required to update
 *       403:
 *         description: Current user is not the manager of the team
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
teamRouter.put('/update', authController.validateToken, teamController.updateTeam);

/**
 * @swagger
 * /api/team:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       400:
 *         description: Name is required
 *       403:
 *         description: Current user is not the manager of the team
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
teamRouter.delete('/', authController.validateToken, teamController.deleteTeam);

export default teamRouter;
