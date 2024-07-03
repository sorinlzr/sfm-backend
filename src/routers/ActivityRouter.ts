import express from 'express';
import activityController from '../controllers/ActivityController';
import authController from '../controllers/AuthController';

const activityRouter = express.Router();

/**
 * @swagger
 * /api/activity:
 *   post:
 *     summary: Create a new activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Practice Match"
 *               activityType:
 *                 type: string
 *                 enum: ["Game", "Training", "Other activity"]
 *                 example: "Training"
 *               team:
 *                 type: string
 *                 example: "Team A"
 *               opponent:
 *                 type: string
 *                 example: "Team B"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date in ISO 8601 format (e.g., 2023-06-18T15:30:00Z)
 *                 example: "2023-06-18T15:30:00Z"
 *               location:
 *                 type: string
 *                 example: "Stadium"
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       400:
 *         description: Invalid input or date format
 *       401:
 *         description: User is not logged in
 *       404:
 *         description: Team or activity type not found
 *       500:
 *         description: Server error
 */
activityRouter.post('/', authController.validateToken, activityController.createActivity);

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Get all activities for a team
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *           example: "Team A"
 *         required: true
 *         description: The name of the team
 *     responses:
 *       200:
 *         description: Successfully retrieved activities
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */

activityRouter.get('/', authController.validateToken, activityController.getActivities);

/**
 * @swagger
 * /api/activity/user:
 *   get:
 *     summary: Get all activities where the user is part of the guest list
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: Successfully retrieved user activities
 *       400:
 *         description: User ID is required
 *       401:
 *         description: User is not logged in
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
activityRouter.get('/user', authController.validateToken, activityController.getUserActivities);

/**
 * @swagger
 * /api/activity/updateAttendance:
 *   post:
 *     summary: Update attendance for a specific guest in an activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityId:
 *                 type: string
 *                 example: "66701737eca837c89a95757d"
 *               guestUserId:
 *                 type: string
 *                 example: "66701737eca837c89a95757d"
 *               attendance:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Activity or guest not found
 *       500:
 *         description: Server error
 */
activityRouter.post('/updateAttendance', authController.validateToken, activityController.updateAttendance);

/**
 * @swagger
 * /api/activity/{id}:
 *   get:
 *     summary: Get an activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the activity
 *     responses:
 *       200:
 *         description: Successfully retrieved activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     activityType:
 *                       type: string
 *                     team:
 *                       type: string
 *                     opponent:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     location:
 *                       type: string
 *                     listOfGuests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           attendance:
 *                             type: boolean
 *       400:
 *         description: Invalid activity ID
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
activityRouter.get('/:id', activityController.getActivityById);

/**
 * @swagger
 * /api/activity/add:
 *   post:
 *     summary: Add an existing activity to a team
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *                 example: "Team A"
 *               activity:
 *                 type: string
 *                 example: "66701737eca837c89a95757d"
 *     responses:
 *       200:
 *         description: Activity added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Team or activity not found
 *       500:
 *         description: Server error
 */

activityRouter.post('/add', authController.validateToken, activityController.addActivity);

/**
 * @swagger
 * /api/activity/update:
 *   put:
 *     summary: Update an existing activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *                 example: "Team A"
 *               activity:
 *                 type: string
 *                 example: "66701737eca837c89a95757d"
 *               subject:
 *                 type: string
 *                 example: "Updated Match"
 *               activityType:
 *                 type: string
 *                 example: "Training"
 *               opponent:
 *                 type: string
 *                 example: "Updated Opponent"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-19T15:30:00Z"
 *               location:
 *                 type: string
 *                 example: "Updated Stadium"
 *               listOfGuests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "66701737eca837c89a95757d"
 *                     attendance:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       400:
 *         description: Invalid input or date format
 *       404:
 *         description: Team or activity not found
 *       500:
 *         description: Server error
 */
activityRouter.put('/update', authController.validateToken, activityController.updateActivity);

/**
 * @swagger
 * /api/activity/delete:
 *   delete:
 *     summary: Delete an activity from a team
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *                 example: "Team A"
 *               activity:
 *                 type: string
 *                 example: "66701737eca837c89a95757d"
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Team or activity not found
 *       500:
 *         description: Server error
 */
activityRouter.delete('/delete', authController.validateToken, activityController.deleteActivity);

export default activityRouter;
