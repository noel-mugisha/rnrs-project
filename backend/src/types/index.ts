import { Request } from 'express';
import { User, Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface FileUploadResponse {
  uploadUrl: string;
  resumeId: string;
  expiresAt: Date;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  code?: string;
  details?: any;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchQuery extends PaginationQuery {
  q?: string;
  location?: string;
  remote?: boolean;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface ApplicationFilters extends PaginationQuery {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type NotificationType = 
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'JOB_MATCH'
  | 'RESUME_PARSED'
  | 'WELCOME';

export interface NotificationPayload {
  [key: string]: any;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface JobQueueData {
  type: string;
  payload: any;
  userId?: string;
  priority?: number;
}