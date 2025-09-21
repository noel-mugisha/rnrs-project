import { Response } from 'express';
import { UserService } from '@/services/userService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const userService = new UserService();

export class UserController {
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await userService.getCurrentUser(req.user!.id);
      sendSuccess(res, user);
    } catch (error: any) {
      logger.error('Get current user error:', error);
      sendError(res, error.message, 400);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error: any) {
      logger.error('Update profile error:', error);
      sendError(res, error.message, 400);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      await userService.deleteAccount(req.user!.id);
      res.clearCookie('refreshToken');
      sendSuccess(res, { deleted: true }, 'Account deleted successfully');
    } catch (error: any) {
      logger.error('Delete account error:', error);
      sendError(res, error.message, 400);
    }
  }
}