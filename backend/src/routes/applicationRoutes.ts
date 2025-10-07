// src/routes/applicationRoutes.ts

import { Router } from 'express';
import { ApplicationController } from '@/controllers/applicationController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { applyJobSchema, updateApplicationStatusSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const applicationController = new ApplicationController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Endpoints for managing job applications.
 */

/**
 * @swagger
 * /applications/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     description: Allows a JOBSEEKER to submit an application for a specific job.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyToJob'
 *     responses:
 *       '201':
 *         description: Application submitted successfully.
 *       '400':
 *         description: Bad request (e.g., already applied, job not available).
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.post('/jobs/:jobId/apply', requireRole(['JOBSEEKER']), validateBody(applyJobSchema), applicationController.applyToJob);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get my applications
 *     tags: [Applications]
 *     description: Retrieves a paginated list of all applications submitted by the authenticated JOBSEEKER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of applications.
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.get('/', requireRole(['JOBSEEKER']), applicationController.getMyApplications);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a single application by ID
 *     tags: [Applications]
 *     description: Retrieves details of a single application. Accessible by the applicant (JOBSEEKER) or the job owner (JOBPROVIDER).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Application details.
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/:id', applicationController.getApplication);

/**
 * @swagger
 * /applications/jobs/{jobId}:
 *   get:
 *     summary: Get applications for a specific job (JOBPROVIDER only)
 *     tags: [Applications]
 *     description: Retrieves all applications for a job owned by the authenticated JOBPROVIDER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of applications for the job.
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.get('/jobs/:jobId', requireRole(['JOBPROVIDER']), applicationController.getJobApplications);

/**
 * @swagger
 * /applications/employer:
 *   get:
 *     summary: Get all applications for employer's jobs (JOBPROVIDER only)
 *     tags: [Applications]
 *     description: Retrieves all applications across all jobs owned by the authenticated JOBPROVIDER.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Search by candidate name, job title, or email
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: jobId
 *         description: Filter by specific job
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: 'appliedAt' }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       '200':
 *         description: A list of applications across all employer jobs.
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.get('/employer', requireRole(['JOBPROVIDER']), applicationController.getEmployerApplications);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     description: Allows a JOBPROVIDER to update the status of an application for one of their jobs.
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
 *             $ref: '#/components/schemas/UpdateApplicationStatus'
 *     responses:
 *       '200':
 *         description: Application status updated successfully.
 *       '400':
 *         description: Bad request (e.g., invalid status transition).
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.patch('/:id/status', requireRole(['JOBPROVIDER']), validateBody(updateApplicationStatusSchema), applicationController.updateApplicationStatus);

export default router;