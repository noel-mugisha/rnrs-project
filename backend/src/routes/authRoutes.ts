import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validateBody } from '@/middleware/validationMiddleware';
import { authLimiter, otpLimiter } from '@/middleware/rateLimiterMiddleware';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendOTPSchema,
} from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const authController = new AuthController();

router.post('/signup', authLimiter, validateBody(signupSchema), authController.signup);
router.post('/verify-email-otp', otpLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-email-otp', otpLimiter, validateBody(resendOTPSchema), authController.resendOTP);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;