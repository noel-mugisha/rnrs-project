import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import resumeRoutes from './resumeRoutes';
import employerRoutes from './employerRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import notificationRoutes from './notificationRoutes';
import passwordResetRoutes from './passwordResetRoutes';
import metaRoutes from './metaRoutes'; 

const router: ReturnType<typeof Router> = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resumes', resumeRoutes);
router.use('/employers', employerRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/password', passwordResetRoutes);
router.use('/meta', metaRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;