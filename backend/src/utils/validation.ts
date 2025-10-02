import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  role: z.enum(['JOBSEEKER', 'JOBPROVIDER']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  userId: z.string().uuid(),
  otp: z.string().length(6),
});

export const resendOTPSchema = z.object({
  userId: z.string().uuid(),
});

export const updateProfileSchema = z.object({
  phone: z.string().optional(),
  desiredTitle: z.string().optional(),
  about: z.string().optional(),
  // For Job Seekers: an array of selected skills
  skills: z.array(z.object({
    category: z.string(),
    work: z.string(),
  })).optional(),
  // For Job Providers: an array of job types they offer
  jobTypes: z.array(z.string()).optional(),
  privacy: z.object({
    hideContact: z.boolean().optional(),
  }).optional(),
});

export const createEmployerSchema = z.object({
  name: z.string().min(2).max(100),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
});

// Create job schema - aligned with new Prisma schema
export const createJobSchema = z.object({
  workCategory: z.string().min(1, 'Work category is required'),
  workType: z.string().min(1, 'Work type is required'),
  title: z.string().min(3).max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  salaryAmount: z.number().int().min(0, 'Salary must be a positive number'),
  remote: z.boolean().default(false),
  jobType: z.enum(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP']).default('FULLTIME'),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).default('ENTRY'),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

// Update job schema - make all fields optional
export const updateJobSchema = z.object({
  workCategory: z.string().min(1).optional(),
  workType: z.string().min(1).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(50).optional(),
  requirements: z.string().min(10).optional(),
  location: z.string().min(1).optional(),
  salaryAmount: z.number().int().min(0).optional(),
  remote: z.boolean().optional(),
  jobType: z.enum(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
});

export const applyJobSchema = z.object({
  resumeId: z.string().uuid(),
  coverLetter: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED']),
  note: z.string().optional(),
});

export const requestUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().max(parseInt(process.env.MAX_FILE_SIZE || '10485760')),
});

export const completeUploadSchema = z.object({
  resumeId: z.string().uuid(),
  storageKey: z.string(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const jobSearchSchema = paginationSchema.extend({
  q: z.string().optional(),
  location: z.string().optional(),
  remote: z.coerce.boolean().optional(),
  jobType: z.string().optional(),
  experienceLevel: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'A password reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});