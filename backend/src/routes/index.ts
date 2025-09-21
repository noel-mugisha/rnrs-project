import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import resumeRoutes from './resumeRoutes';
import employerRoutes from './employerRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import notificationRoutes from './notificationRoutes';

const router: ReturnType<typeof Router> = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resumes', resumeRoutes);
router.use('/employers', employerRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;