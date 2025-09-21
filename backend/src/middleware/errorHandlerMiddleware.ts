import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '@/config/logger';
import { sendError, sendInternalError } from '@/utils/response';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        sendError(res, 'Resource already exists', 409, 'DUPLICATE_ENTRY');
        return;
      case 'P2025':
        sendError(res, 'Resource not found', 404, 'NOT_FOUND');
        return;
      case 'P2003':
        sendError(res, 'Invalid reference', 400, 'INVALID_REFERENCE');
        return;
      default:
        sendError(res, 'Database error', 400, 'DATABASE_ERROR');
        return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided', 400, 'VALIDATION_ERROR');
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File too large', 413, 'FILE_TOO_LARGE');
      return;
    }
    sendError(res, 'File upload error', 400, 'UPLOAD_ERROR');
    return;
  }

  sendInternalError(res);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
};