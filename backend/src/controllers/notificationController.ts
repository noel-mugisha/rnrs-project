import { Response } from 'express';
import { NotificationService } from '@/services/notificationService';
import { AuthenticatedRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        read: req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      
      const result = await notificationService.getUserNotifications(req.user!.id, filters);
      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Get notifications error:', error);
      sendError(res, error.message, 400);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(req.user!.id, id);
      sendSuccess(res, result, 'Notification marked as read');
    } catch (error: any) {
      logger.error('Mark notification as read error:', error);
      sendError(res, error.message, 400);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, result, 'All notifications marked as read');
    } catch (error: any) {
      logger.error('Mark all notifications as read error:', error);
      sendError(res, error.message, 400);
    }
  }
}