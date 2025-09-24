import { Request, Response } from 'express';
import { PasswordResetService } from '@/services/passwordResetService';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const passwordResetService = new PasswordResetService();

export class PasswordResetController {
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await passwordResetService.forgotPassword(email);
      sendSuccess(res, null, 'Password reset email sent successfully');
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      sendError(res, error.message, 400);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await passwordResetService.resetPassword(token, newPassword);
      sendSuccess(res, null, 'Password has been reset successfully');
    } catch (error: any) {
      logger.error('Reset password error:', error);
      sendError(res, error.message, 400);
    }
  }
}