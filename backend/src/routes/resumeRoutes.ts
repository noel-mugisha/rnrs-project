// src/routes/resumeRoutes.ts

import { Router, Response, NextFunction } from 'express';
import { ResumeController } from '@/controllers/resumeController';
import { authenticate, requireRole } from '@/middleware/authMiddleware';
import { validateBody } from '@/middleware/validationMiddleware';
import { uploadLimiter } from '@/middleware/rateLimiterMiddleware';
import { requestUploadSchema, completeUploadSchema } from '@/utils/validation';
import { AuthenticatedRequest } from '@/types';

const router: ReturnType<typeof Router> = Router();
const resumeController = new ResumeController();

router.use(authenticate);

// Most routes are for jobseekers only
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Allow jobproviders to view resumes via specific routes
  if (req.path.startsWith('/view/') && req.user?.role === 'JOBPROVIDER') {
    return next();
  }
  // All other routes require JOBSEEKER role
  return requireRole(['JOBSEEKER'])(req, res, next);
});

/**
 * @swagger
 * tags:
 *   name: Resumes
 *   description: Endpoints for job seekers to manage their resumes. Requires JOBSEEKER role.
 */

/**
 * @swagger
 * /resumes/request-upload:
 *   post:
 *     summary: Request a secure URL to upload a resume
 *     tags: [Resumes]
 *     description: Generates a pre-signed URL for uploading a resume file directly to cloud storage.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestUpload'
 *     responses:
 *       '200':
 *         description: Upload URL generated successfully.
 *       '400':
 *         description: Bad request (e.g., file type not allowed, file size too large).
 */
router.post('/request-upload', uploadLimiter, validateBody(requestUploadSchema), resumeController.requestUpload);

/**
 * @swagger
 * /resumes/complete-upload:
 *   post:
 *     summary: Confirm a resume upload is complete
 *     tags: [Resumes]
 *     description: Confirms that the file has been successfully uploaded to the provided URL.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteUpload'
 *     responses:
 *       '201':
 *         description: Upload completed successfully.
 *       '400':
 *         description: Bad request (e.g., resume record not found).
 */
router.post('/complete-upload', validateBody(completeUploadSchema), resumeController.completeUpload);

/**
 * @swagger
 * /resumes:
 *   get:
 *     summary: Get all resumes for the current user
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of resumes.
 */
router.get('/', resumeController.getResumes);

/**
 * @swagger
 * /resumes/{id}:
 *   get:
 *     summary: Get a single resume by ID
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The resume ID.
 *     responses:
 *       '200':
 *         description: Resume details.
 *       '404':
 *         description: Resume not found.
 */
router.get('/:id', resumeController.getResume);

/**
 * @swagger
 * /resumes/{id}:
 *   delete:
 *     summary: Delete a resume by ID
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The resume ID to delete.
 *     responses:
 *       '200':
 *         description: Resume deleted successfully.
 *       '404':
 *         description: Resume not found.
 */
router.delete('/:id', resumeController.deleteResume);

/**
 * @swagger
 * /resumes/view/{resumeId}:
 *   get:
 *     summary: View a resume (for jobproviders)
 *     tags: [Resumes]
 *     description: Allows a JOBPROVIDER to view a resume from a job application.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The resume ID to view.
 *     responses:
 *       '200':
 *         description: Resume download URL or content.
 *       '403':
 *         description: Access denied.
 *       '404':
 *         description: Resume not found.
 */
router.get('/view/:resumeId', resumeController.viewResumeForEmployer);

export default router;
