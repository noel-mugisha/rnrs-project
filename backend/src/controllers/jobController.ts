import { Request, Response } from 'express';
import { JobService } from '@/services/jobService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const jobService = new JobService();

export class JobController {
  async createJob(req: AuthenticatedRequest, res: Response) {
    try {
      const job = await jobService.createJob(req.user!.id, req.body);
      sendSuccess(res, job, 'Job created successfully', 201);
    } catch (error: any) {
      logger.error('Create job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getMyJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await jobService.getMyJobs(req.user!.id, filters);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get my jobs error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getMyJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await jobService.getMyJob(req.user!.id, id);
      sendSuccess(res, job);
    } catch (error: any) {
      logger.error('Get my job error:', error);
      sendError(res, error.message, 404);
    }
  }

  async getJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await jobService.getPublicJob(id);
      sendSuccess(res, job);
    } catch (error: any) {
      logger.error('Get job error:', error);
      sendError(res, error.message, 404);
    }
  }

  async searchJobs(req: Request, res: Response) {
    try {
      const query = req.query as any;
      const result = await jobService.searchJobs(query);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Search jobs error:', error);
      sendError(res, error.message, 400);
    }
  }

  async updateJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await jobService.updateJob(req.user!.id, id, req.body);
      sendSuccess(res, job, 'Job updated successfully');
    } catch (error: any) {
      logger.error('Update job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async deleteJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await jobService.deleteJob(req.user!.id, id);
      sendSuccess(res, result, 'Job deleted successfully');
    } catch (error: any) {
      logger.error('Delete job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async publishJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await jobService.publishJob(req.user!.id, id);
      sendSuccess(res, job, 'Job published successfully');
    } catch (error: any) {
      logger.error('Publish job error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getJobApplicants(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const filters = {
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      
      const result = await jobService.getJobApplicants(req.user!.id, id, filters);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get job applicants error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getRecommendedJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await jobService.getRecommendedJobs(req.user!.id, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get recommended jobs error:', error);
      sendError(res, error.message, 400);
    }
  }
}
