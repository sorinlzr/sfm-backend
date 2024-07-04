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
 * /api/team/all/{userId}:
 *   get:
 *     summary: Get teams by user ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *       404:
 *         description: No teams found for this user
 *       500:
 *         description: Server error
 */
teamRouter.get('/all/:userId', teamController.getTeamsByUser);


/**
 * @swagger
 * /api/team/manager:
 *   get:
 *     summary: Get team by manager
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *       404:
 *         description: No team found for the current manager
 *       500:
 *         description: Server error
 */
teamRouter.get('/manager', authController.validateToken, teamController.getTeamByManager);



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
 *               typeOfSport:
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
 * /api/team/user/add:
 *   post:
 *     summary: Add user to team based on team name and user ID
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamName:
 *                 type: string
 *                 description: The name of the team to add the user to
 *               userId:
 *                 type: string
 *                 description: The ID of the user to be added to the team
 *     responses:
 *       200:
 *         description: User added to team successfully
 *       400:
 *         description: Team name and user ID are required
 *       401:
 *         description: You are not the manager of this team
 *       404:
 *         description: Team or user not found
 *       500:
 *         description: Server error
 */
teamRouter.post('/user/add', authController.validateToken, teamController.addUserToTeam);

/**
 * @swagger
 * /api/team/user/join:
 *   post:
 *     summary: Add a user to the pendingMembers list of a team using an invite code
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to add to the team
 *               inviteCode:
 *                 type: string
 *                 description: The invite code of the team
 *             required:
 *               - userId
 *               - inviteCode
 *     responses:
 *       200:
 *         description: User added to pendingMembers list successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: User or team not found
 *       500:
 *         description: Server error
 */

teamRouter.post('/user/join', authController.validateToken,  teamController.addUserToPendingMembers);

/**
 * @swagger
 * /api/team/user/remove:
 *   post:
 *     summary: Remove a user from a team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to remove
 *               teamName:
 *                 type: string
 *                 description: The name of the team from which the user will be removed
 *     responses:
 *       200:
 *         description: User removed from the team successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: User or team not found
 *       500:
 *         description: Server error
 */

teamRouter.post('/user/remove', authController.validateToken, teamController.removeUserFromTeam);

/**
 * @swagger
 * /api/team/{teamId}:
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               typeOfSport:
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
teamRouter.put('/:teamId', authController.validateToken, teamController.updateTeam);

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
