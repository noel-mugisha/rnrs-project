// src/routes/notificationRoutes.ts

import { Router } from 'express';
import { NotificationController } from '@/controllers/notificationController';
import { authenticate, requireEmailVerification } from '@/middleware/authMiddleware';

const router: ReturnType<typeof Router> = Router();
const notificationController = new NotificationController();

router.use(authenticate);
router.use(requireEmailVerification);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints for managing user notifications.
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     description: Retrieves a paginated list of notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema: { type: boolean }
 *         description: Filter by read status (true or false).
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of notifications.
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Notification marked as read.
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All notifications marked as read.
 */
router.patch('/mark-all-read', notificationController.markAllAsRead);

export default router;