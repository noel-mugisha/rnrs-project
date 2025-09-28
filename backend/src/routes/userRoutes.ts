// src/routes/userRoutes.ts

import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { authenticate } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { updateProfileSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const userController = new UserController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: Endpoints for managing the authenticated user's profile.
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User Profile]
 *     description: Retrieves the complete profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user profile.
 *       '401': { $ref: '#/components/schemas/Error401' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/me', userController.getCurrentUser);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [User Profile]
 *     description: Updates the profile information for the authenticated user. JOBSEEKERs and JOBPROVIDERs can update different fields.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       '200':
 *         description: Profile updated successfully.
 *       '401': { $ref: '#/components/schemas/Error401' }
 *       '422': { $ref: '#/components/schemas/Error422' }
 */
router.patch('/me', validateBody(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user's account
 *     tags: [User Profile]
 *     description: Permanently deletes the authenticated user's account and all associated data. This action is irreversible.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Account deleted successfully.
 *       '401': { $ref: '#/components/schemas/Error401' }
 */
router.delete('/me', userController.deleteAccount);

export default router;