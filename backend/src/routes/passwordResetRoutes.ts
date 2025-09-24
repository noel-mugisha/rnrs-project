import { Router } from 'express';
import { PasswordResetController } from '@/controllers/passwordResetController';
import { validateBody } from '@/middleware/validationMiddleware';
import { forgotPasswordSchema, resetPasswordSchema } from '@/utils/validation';

const router: Router = Router();
const passwordResetController = new PasswordResetController();

router.post('/forgot-password', validateBody(forgotPasswordSchema), passwordResetController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), passwordResetController.resetPassword);

export default router;