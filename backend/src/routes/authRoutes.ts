// src/routes/authRoutes.ts

import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validateBody } from '@/middleware/validationMiddleware';
import { authLimiter, otpLimiter } from '@/middleware/rateLimiterMiddleware';
import { signupSchema, loginSchema, verifyEmailSchema, resendOTPSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user signup, login, and email verification.
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account (JOBSEEKER or JOBPROVIDER). An email with a verification OTP is sent upon successful registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signup'
 *     responses:
 *       '201':
 *         description: User created successfully. Awaiting email verification.
 *       '400': { $ref: '#/components/schemas/Error400' }
 *       '422': { $ref: '#/components/schemas/Error422' }
 */
router.post('/signup', authLimiter, validateBody(signupSchema), authController.signup);

/**
 * @swagger
 * /auth/verify-email-otp:
 *   post:
 *     summary: Verify user's email with OTP
 *     tags: [Authentication]
 *     description: Verifies the OTP sent to the user's email. On success, it returns an access token and sets a refresh token cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmail'
 *     responses:
 *       '200':
 *         description: Email verified successfully.
 *       '400':
 *         description: Invalid or expired OTP.
 */
router.post('/verify-email-otp', otpLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-email-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Authentication]
 *     description: Resends the verification OTP to a user whose email is not yet verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: OTP sent successfully.
 *       '400':
 *         description: User not found or email already verified.
 */
router.post('/resend-email-otp', otpLimiter, validateBody(resendOTPSchema), authController.resendOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     description: Authenticates a user with email and password. On success, it returns an access token and sets a refresh token in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       '200':
 *         description: Login successful.
 *       '401':
 *         description: Unauthorized (Invalid credentials or email not verified).
 */
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Uses the refresh token (sent as an httpOnly cookie) to generate a new access token.
 *     security: [] # This endpoint does not require a bearer token
 *     responses:
 *       '200':
 *         description: Token refreshed successfully.
 *       '401':
 *         description: Invalid or expired refresh token.
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     description: Revokes the user's refresh token and clears the cookie.
 *     responses:
 *       '204':
 *         description: Logout successful. No content returned.
 */
router.post('/logout', authController.logout);

export default router;