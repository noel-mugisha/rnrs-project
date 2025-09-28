// src/routes/metaRoutes.ts

import { Router } from 'express';
import { MetaController } from '@/controllers/metaController';

const router: Router = Router();
const metaController = new MetaController();

/**
 * @swagger
 * tags:
 *   name: Meta
 *   description: Endpoints for retrieving metadata and configuration values.
 */

/**
 * @swagger
 * /meta/work-categories:
 *   get:
 *     summary: Get available work categories and skills
 *     tags: [Meta]
 *     description: Retrieves a list of predefined work categories and associated work types for populating forms (e.g., on the user profile).
 *     security: []
 *     responses:
 *       '200':
 *         description: A list of work categories.
 */
router.get('/work-categories', metaController.getWorkCategories);

export default router;