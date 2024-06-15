import express from 'express';
import activityController from '../controllers/ActivityController';

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
 *               activityType:
 *                 type: string
 *               team:
 *                 type: string
 *               opponent:
 *                 type: string
 *               date:
 *                 type: string
 *               location:
 *                 type: string
 *               listOfGuests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Activity created successfully
 *       404:
 *         description: Error occurred while creating the activity
 */
activityRouter.post('/', activityController.createActivity);

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: A list of activities
 *       404:
 *         description: Error occurred while fetching the activities
 */
activityRouter.get('/', activityController.getActivities);

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
 *               activity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity added to team successfully
 *       404:
 *         description: Error occurred while adding the activity
 */
activityRouter.post('/add', activityController.addActivity);

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
 *               activity:
 *                 type: string
 *               subject:
 *                 type: string
 *               type:
 *                 type: string
 *               opponent:
 *                 type: string
 *               date:
 *                 type: string
 *               location:
 *                 type: string
 *               listOfGuests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       404:
 *         description: Error occurred while updating the activity
 */
activityRouter.put('/update', activityController.updateActivity);

/**
 * @swagger
 * /api/activity:
 *   delete:
 *     summary: Delete an activity
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
 *               activity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Error occurred while deleting the activity
 */
activityRouter.delete('/', activityController.deleteActivity);

export default activityRouter;
