import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/auth';
import { prisma } from '@/config/database';
import { sendUnauthorized, sendForbidden } from '@/utils/response';
import { AuthenticatedRequest } from '@/types';
import { Role } from '@prisma/client';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Access token required');
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    if (!user.emailVerified) {
      sendUnauthorized(res, 'Email not verified');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid or expired token');
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.emailVerified) {
    sendUnauthorized(res, 'Email verification required');
    return;
  }
  next();
};