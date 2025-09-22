import { Router } from 'express';
import { ApplicationController } from '@/controllers/applicationController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { applyJobSchema, updateApplicationStatusSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const applicationController = new ApplicationController();

router.use(authenticate);

// Job seeker routes
router.post('/jobs/:jobId/apply', requireRole(['JOBSEEKER']), validateBody(applyJobSchema), applicationController.applyToJob);
router.get('/', requireRole(['JOBSEEKER']), applicationController.getMyApplications);

// Shared routes (job seeker can view their applications, employers can view applications to their jobs)
router.get('/:id', applicationController.getApplication);

// Employer routes
router.patch('/:id/status', requireRole(['JOBPROVIDER']), validateBody(updateApplicationStatusSchema), applicationController.updateApplicationStatus);

export default router;