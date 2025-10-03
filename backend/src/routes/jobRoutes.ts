// src/routes/jobRoutes.ts

import { Router } from 'express';
import { JobController } from '@/controllers/jobController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody, validateQuery } from '@/middleware/validationMiddleware';
import { createJobSchema, updateJobSchema, jobSearchSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const jobController = new JobController();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Endpoints for searching, viewing, and managing job listings.
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /jobs/search:
 *   get:
 *     summary: Search for public job listings
 *     tags: [Jobs]
 *     description: Publicly accessible endpoint to search and filter through all PUBLISHED jobs.
 *     security: []
 */
router.get('/search', validateQuery(jobSearchSchema), jobController.searchJobs);

// ==================== JOB SEEKER ROUTES ====================

/**
 * @swagger
 * /jobs/recommended:
 *   get:
 *     summary: Get recommended jobs for the authenticated job seeker
 *     tags: [Jobs]
 */
router.get('/recommended', authenticate, requireRole(['JOBSEEKER']), jobController.getRecommendedJobs);

// ==================== JOB PROVIDER ROUTES ====================
// All routes below require authentication and JOBPROVIDER role

router.use(authenticate);
router.use(requireRole(['JOBPROVIDER']));

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 */
router.post('/', validateBody(createJobSchema), jobController.createJob);

/**
 * @swagger
 * /jobs/my-jobs:
 *   get:
 *     summary: Get all jobs for the authenticated employer
 *     tags: [Jobs]
 */
router.get('/my-jobs', jobController.getMyJobs);

/**
 * @swagger
 * /jobs/my-jobs/{id}:
 *   get:
 *     summary: Get a single job for the authenticated employer
 *     tags: [Jobs]
 */
router.get('/my-jobs/:id', jobController.getMyJob);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     summary: Update a job
 *     tags: [Jobs]
 */
router.patch('/:id', validateBody(updateJobSchema), jobController.updateJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 */
router.delete('/:id', jobController.deleteJob);

/**
 * @swagger
 * /jobs/{id}/publish:
 *   post:
 *     summary: Publish a draft job
 *     tags: [Jobs]
 */
router.post('/:id/publish', jobController.publishJob);

/**
 * @swagger
 * /jobs/{id}/applicants:
 *   get:
 *     summary: Get applicants for a job
 *     tags: [Jobs]
 */
router.get('/:id/applicants', jobController.getJobApplicants);

// Public route for getting a single published job (must be after all specific routes)
router.get('/:id', jobController.getJob);

export default router;
