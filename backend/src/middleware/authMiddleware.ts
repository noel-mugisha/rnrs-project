import { Response, NextFunction } from 'express';
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

// Optional authentication - adds user data if token is present but doesn't require it
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, just continue without user data
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      next();
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

    // If user not found or email not verified, continue without user data
    if (!user || !user.emailVerified) {
      req.user = undefined;
    } else {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user data
    req.user = undefined;
    next();
  }
};
