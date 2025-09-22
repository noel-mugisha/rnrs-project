import { Router } from 'express';
import { EmployerController } from '@/controllers/employerController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { createEmployerSchema, createJobSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const employerController = new EmployerController();

router.use(authenticate);

router.post('/', requireRole(['JOBPROVIDER']), validateBody(createEmployerSchema), employerController.createEmployer);
router.get('/me', requireRole(['JOBPROVIDER']), employerController.getUserEmployer);
router.get('/:id', employerController.getEmployer);
router.patch('/:id', requireRole(['JOBPROVIDER']), employerController.updateEmployer);
router.post('/:id/jobs', requireRole(['JOBPROVIDER']), validateBody(createJobSchema), employerController.createJob);
router.get('/:id/jobs', requireRole(['JOBPROVIDER']), employerController.getEmployerJobs);

export default router;