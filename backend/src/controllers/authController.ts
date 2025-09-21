import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { sendSuccess, sendError } from '@/utils/response';
import { logger } from '@/config/logger';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await authService.signup(req.body);
      sendSuccess(res, result, 'User created successfully. Please verify your email.', 201);
    } catch (error: any) {
      logger.error('Signup error:', error);
      sendError(res, error.message, 400);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { userId, otp } = req.body;
      const result = await authService.verifyEmail(userId, otp);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, {
        verified: result.verified,
        accessToken: result.accessToken,
      }, 'Email verified successfully');
    } catch (error: any) {
      logger.error('Email verification error:', error);
      sendError(res, error.message, 400);
    }
  }

  async resendOTP(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const result = await authService.resendOTP(userId);
      sendSuccess(res, result, 'OTP sent successfully');
    } catch (error: any) {
      logger.error('Resend OTP error:', error);
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, {
        accessToken: result.accessToken,
      }, 'Login successful');
    } catch (error: any) {
      logger.error('Login error:', error);
      sendError(res, error.message, 401);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        sendError(res, 'Refresh token not provided', 401);
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.clearCookie('refreshToken');
      sendError(res, error.message, 401);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(204).send();
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.clearCookie('refreshToken');
      res.status(204).send();
    }
  }
}