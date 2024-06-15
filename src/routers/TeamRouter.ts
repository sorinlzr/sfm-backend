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
 *       404:
 *         description: Team not found
 */
teamRouter.get('/', teamController.getTeam);

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
 *       409:
 *         description: A team with this name already exists
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
 *       404:
 *         description: Team or user not found
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
 *       404:
 *         description: Team not found
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
 *       404:
 *         description: Team not found
 */
teamRouter.delete('/', authController.validateToken, teamController.deleteTeam);

export default teamRouter;
