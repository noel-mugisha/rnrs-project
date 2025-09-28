// src/routes/passwordResetRoutes.ts

import { Router } from 'express';
import { PasswordResetController } from '@/controllers/passwordResetController';
import { validateBody } from '@/middleware/validationMiddleware';
import { forgotPasswordSchema, resetPasswordSchema } from '@/utils/validation';

const router: Router = Router();
const passwordResetController = new PasswordResetController();

/**
 * @swagger
 * tags:
 *   name: Password Reset
 *   description: Endpoints for handling forgotten passwords.
 */

/**
 * @swagger
 * /password/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Password Reset]
 *     description: Sends a password reset link to the user's email address if it exists in the system.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       '200':
 *         description: Password reset email sent successfully.
 *       '400': { $ref: '#/components/schemas/Error400' }
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), passwordResetController.forgotPassword);

/**
 * @swagger
 * /password/reset-password:
 *   post:
 *     summary: Reset password with a token
 *     tags: [Password Reset]
 *     description: Sets a new password for the user using the token received in the reset email.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       '200':
 *         description: Password has been reset successfully.
 *       '400':
 *         description: Invalid or expired token.
 */
router.post('/reset-password', validateBody(resetPasswordSchema), passwordResetController.resetPassword);

export default router;