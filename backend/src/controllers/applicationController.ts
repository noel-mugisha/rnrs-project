import { Response } from 'express';
import { ApplicationService } from '@/services/applicationService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const applicationService = new ApplicationService();

export class ApplicationController {
  async applyToJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { jobId } = req.params;
      const idempotencyKey = req.headers['idempotency-key'] as string;
      
      const result = await applicationService.applyToJob(
        req.user!.id,
        jobId,
        req.body,
        idempotencyKey
      );
      
      sendSuccess(res, result, 'Application submitted successfully', 201);
    } catch (error: any) {
      logger.error('Apply to job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getMyApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      
      const result = await applicationService.getMyApplications(req.user!.id, filters);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get my applications error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const application = await applicationService.getApplication(req.user!.id, id);
      sendSuccess(res, application);
    } catch (error: any) {
      logger.error('Get application error:', error);
      sendError(res, error.message, 404);
    }
  }

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const application = await applicationService.updateApplicationStatus(
        req.user!.id,
        id,
        req.body
      );
      sendSuccess(res, application, 'Application status updated successfully');
    } catch (error: any) {
      logger.error('Update application status error:', error);
      sendError(res, error.message, 400);
    }
  }
}