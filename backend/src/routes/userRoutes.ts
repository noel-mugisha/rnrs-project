import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { authenticate } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { updateProfileSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/me', userController.getCurrentUser);
router.patch('/me', validateBody(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deleteAccount);

export default router;