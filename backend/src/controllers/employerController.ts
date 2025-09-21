import { Response } from 'express';
import { EmployerService } from '@/services/employerService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const employerService = new EmployerService();

export class EmployerController {
  async createEmployer(req: AuthenticatedRequest, res: Response) {
    try {
      const employer = await employerService.createEmployer(req.user!.id, req.body);
      sendSuccess(res, employer, 'Employer created successfully', 201);
    } catch (error: any) {
      logger.error('Create employer error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getEmployer(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const employer = await employerService.getEmployer(id);
      sendSuccess(res, employer);
    } catch (error: any) {
      logger.error('Get employer error:', error);
      sendError(res, error.message, 404);
    }
  }

  async updateEmployer(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const employer = await employerService.updateEmployer(req.user!.id, id, req.body);
      sendSuccess(res, employer, 'Employer updated successfully');
    } catch (error: any) {
      logger.error('Update employer error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getUserEmployer(req: AuthenticatedRequest, res: Response) {
    try {
      const employer = await employerService.getUserEmployer(req.user!.id);
      sendSuccess(res, employer);
    } catch (error: any) {
      logger.error('Get user employer error:', error);
      sendError(res, error.message, 400);
    }
  }

  async createJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await employerService.createJob(req.user!.id, id, req.body);
      sendSuccess(res, job, 'Job created successfully', 201);
    } catch (error: any) {
      logger.error('Create job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getEmployerJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const filters = {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      
      const result = await employerService.getEmployerJobs(req.user!.id, id, filters);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get employer jobs error:', error);
      sendError(res, error.message, 400);
    }
  }
}