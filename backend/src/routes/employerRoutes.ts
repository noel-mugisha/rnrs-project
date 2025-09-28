// src/routes/employerRoutes.ts

import { Router } from 'express';
import { EmployerController } from '@/controllers/employerController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { createEmployerSchema, createJobSchema } from '@/utils/validation';

const router: ReturnType<typeof Router> = Router();
const employerController = new EmployerController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Employers
 *   description: Endpoints for managing employer profiles and their associated jobs. Requires JOBPROVIDER role for modifications.
 */

/**
 * @swagger
 * /employers:
 *   post:
 *     summary: Create an employer profile
 *     tags: [Employers]
 *     description: Creates an employer profile for the currently authenticated JOBPROVIDER. Each provider can only have one employer profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployer'
 *     responses:
 *       '201':
 *         description: Employer created successfully.
 *       '400':
 *         description: Bad request (e.g., profile already exists).
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.post('/', requireRole(['JOBPROVIDER']), validateBody(createEmployerSchema), employerController.createEmployer);

/**
 * @swagger
 * /employers/me:
 *   get:
 *     summary: Get the employer profile for the current user
 *     tags: [Employers]
 *     description: Retrieves the employer profile associated with the authenticated JOBPROVIDER.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Employer profile data.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/me', requireRole(['JOBPROVIDER']), employerController.getUserEmployer);

/**
 * @swagger
 * /employers/{id}:
 *   get:
 *     summary: Get an employer profile by ID
 *     tags: [Employers]
 *     description: Retrieves public information about an employer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Employer details.
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.get('/:id', employerController.getEmployer);

/**
 * @swagger
 * /employers/{id}:
 *   patch:
 *     summary: Update an employer profile
 *     tags: [Employers]
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
 *             $ref: '#/components/schemas/CreateEmployer' # Can reuse the create schema for updates
 *     responses:
 *       '200':
 *         description: Employer updated successfully.
 *       '403': { $ref: '#/components/schemas/Error403' }
 *       '404': { $ref: '#/components/schemas/Error404' }
 */
router.patch('/:id', requireRole(['JOBPROVIDER']), employerController.updateEmployer);

/**
 * @swagger
 * /employers/{id}/jobs:
 *   post:
 *     summary: Create a new job for an employer
 *     tags: [Employers]
 *     description: Allows a JOBPROVIDER to post a new job listing under their employer profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The employer ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJob'
 *     responses:
 *       '201':
 *         description: Job created successfully.
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.post('/:id/jobs', requireRole(['JOBPROVIDER']), validateBody(createJobSchema), employerController.createJob);

/**
 * @swagger
 * /employers/{id}/jobs:
 *   get:
 *     summary: Get all jobs for a specific employer
 *     tags: [Employers]
 *     description: Retrieves a paginated list of jobs posted by an employer. For JOBPROVIDER's own profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED, CLOSED, ARCHIVED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       '200':
 *         description: A list of jobs.
 *       '403': { $ref: '#/components/schemas/Error403' }
 */
router.get('/:id/jobs', requireRole(['JOBPROVIDER']), employerController.getEmployerJobs);

export default router;