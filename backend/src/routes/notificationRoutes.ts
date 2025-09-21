import { Router } from 'express';
import { NotificationController } from '@/controllers/notificationController';
import { authenticate, requireEmailVerification } from '@/middleware/authMiddleware';

const router: ReturnType<typeof Router> = Router();
const notificationController = new NotificationController();

router.use(authenticate);
router.use(requireEmailVerification);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

export default router;