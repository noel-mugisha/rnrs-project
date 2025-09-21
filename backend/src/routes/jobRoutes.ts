import { Router } from 'express';
import { JobController } from '@/controllers/jobController';
import { authenticate, requireRole, requireEmailVerification } from '@/middleware/authMiddleware';
import { validateBody, validateQuery } from '@/middleware/validationMiddleware';
import { updateJobSchema, jobSearchSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const jobController = new JobController();

router.get('/search', validateQuery(jobSearchSchema), jobController.searchJobs);
router.get('/:id', jobController.getJob);

router.use(authenticate);
router.use(requireEmailVerification);
router.use(requireRole(['JOBPROVIDER']));

router.patch('/:id', validateBody(updateJobSchema), jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.post('/:id/publish', jobController.publishJob);
router.get('/:id/applicants', jobController.getJobApplicants);

export default router;