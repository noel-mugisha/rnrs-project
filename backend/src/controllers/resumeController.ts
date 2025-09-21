import { Response } from 'express';
import { ResumeService } from '@/services/resumeService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const resumeService = new ResumeService();

export class ResumeController {
  async requestUpload(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await resumeService.requestUpload(req.user!.id, req.body);
      sendSuccess(res, result, 'Upload URL generated successfully');
    } catch (error: any) {
      logger.error('Request upload error:', error);
      sendError(res, error.message, 400);
    }
  }

  async completeUpload(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await resumeService.completeUpload(req.user!.id, req.body);
      sendSuccess(res, result, 'Upload completed successfully', 201);
    } catch (error: any) {
      logger.error('Complete upload error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getResumes(req: AuthenticatedRequest, res: Response) {
    try {
      const resumes = await resumeService.getResumes(req.user!.id);
      sendSuccess(res, resumes);
    } catch (error: any) {
      logger.error('Get resumes error:', error);
      sendError(res, error.message, 400);
    }
  }

  async deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await resumeService.deleteResume(req.user!.id, id);
      sendSuccess(res, result, 'Resume deleted successfully');
    } catch (error: any) {
      logger.error('Delete resume error:', error);
      sendError(res, error.message, 400);
    }
  }

  async getResume(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const resume = await resumeService.getResumeById(req.user!.id, id);
      sendSuccess(res, resume);
    } catch (error: any) {
      logger.error('Get resume error:', error);
      sendError(res, error.message, 400);
    }
  }
}