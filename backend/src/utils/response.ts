import { Response } from 'express';
import { ApiResponse } from '@/types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    status: 'success',
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    status: 'error',
    message,
    code,
    details,
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: any,
  message: string = 'Validation failed'
): Response => {
  return sendError(res, message, 422, 'VALIDATION_ERROR', errors);
};

export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return sendError(res, message, 404, 'NOT_FOUND');
};

export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response => {
  return sendError(res, message, 401, 'UNAUTHORIZED');
};

export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): Response => {
  return sendError(res, message, 403, 'FORBIDDEN');
};

export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): Response => {
  return sendError(res, message, 409, 'CONFLICT');
};

export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error'
): Response => {
  return sendError(res, message, 500, 'INTERNAL_ERROR');
};