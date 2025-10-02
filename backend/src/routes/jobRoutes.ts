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

/**
 * @swagger
 * /jobs/search:
 *   get:
 *     summary: Search for public job listings
 *     tags: [Jobs]
 *     description: Publicly accessible endpoint to search and filter through all PUBLISHED jobs.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query for job title, description, etc.
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: remote
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A paginated list of jobs.
 */
router.get('/search', validateQuery(jobSearchSchema), jobController.searchJobs);

/**
 * @swagger
 * /jobs/recommended:
 *   get:
 *     summary: Get recommended jobs for the authenticated job seeker
 *     tags: [Jobs]
 *     description: Returns personalized job recommendations based on the user's profile, skills, and desired title.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       '200':
 *         description: A list of recommended jobs.
 */
router.get('/recommended', authenticate, requireRole(['JOBSEEKER']), jobController.getRecommendedJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     description: Publicly accessible endpoint to retrieve details for a single PUBLISHED job.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Job details.
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/:id', jobController.getJob);

// --- Authenticated Routes for Job Providers ---
router.use(authenticate);
router.use(requireRole(['JOBPROVIDER']));

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     description: Allows a JOBPROVIDER to create a new job listing.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJob'
 *     responses:
 *       '201':
 *         description: Job created successfully.
 *       '400': { $ref: '#/components/schemas/Error400' }
 */
router.post('/', validateBody(createJobSchema), jobController.createJob);

/**
 * @swagger
 * /jobs/my-jobs:
 *   get:
 *     summary: Get all jobs for the authenticated employer
 *     tags: [Jobs]
 *     description: Returns all jobs created by the authenticated employer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Filter by job status (DRAFT, PUBLISHED, CLOSED, ARCHIVED)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of jobs.
 */
router.get('/my-jobs', jobController.getMyJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     summary: Update a job
 *     tags: [Jobs]
 *     description: Allows a JOBPROVIDER to update their own job listing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJob'
 *     responses:
 *       '200':
 *         description: Job updated successfully.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.patch('/:id', validateBody(updateJobSchema), jobController.updateJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     description: Allows a JOBPROVIDER to delete their own job listing (sets status to ARCHIVED).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Job deleted successfully.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.delete('/:id', jobController.deleteJob);

/**
 * @swagger
 * /jobs/{id}/publish:
 *   post:
 *     summary: Publish a draft job
 *     tags: [Jobs]
 *     description: Changes a job's status from DRAFT to PUBLISHED, making it publicly visible.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Job published successfully.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.post('/:id/publish', jobController.publishJob);

/**
 * @swagger
 * /jobs/{id}/applicants:
 *   get:
 *     summary: Get applicants for a job
 *     tags: [Jobs]
 *     description: Retrieves a paginated list of job seekers who have applied to a specific job.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Filter applicants by application status.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of applicants.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/:id/applicants', jobController.getJobApplicants);

export default router;