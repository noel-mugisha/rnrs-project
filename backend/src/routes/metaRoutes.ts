
import { Router } from 'express';
import { MetaController } from '@/controllers/metaController';

const router: Router = Router();
const metaController = new MetaController();

router.get('/work-categories', metaController.getWorkCategories);

export default router;