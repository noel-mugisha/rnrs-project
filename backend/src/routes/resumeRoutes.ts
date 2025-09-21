import { Router } from 'express';
import { ResumeController } from '@/controllers/resumeController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { uploadLimiter } from '@/middleware/rateLimiterMiddleware';
import { requestUploadSchema, completeUploadSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const resumeController = new ResumeController();

router.use(authenticate);
router.use(requireRole(['JOBSEEKER']));

router.post('/request-upload', uploadLimiter, validateBody(requestUploadSchema), resumeController.requestUpload);
router.post('/complete-upload', validateBody(completeUploadSchema), resumeController.completeUpload);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.delete('/:id', resumeController.deleteResume);

export default router;