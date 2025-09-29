import rateLimit from 'express-rate-limit';
import { Request } from 'express';


const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      status: 'error',
      message: options.message || 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'fallback-ip'),
  });
};

// The rest of the file remains the same.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
});

export const otpLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // Much higher limit in development
  message: 'Too many OTP requests, please try again later',
  keyGenerator: (req) => `otp:${req.ip || 'unknown-ip'}:${req.body.userId || req.body.email || 'unknown-user'}`,
});

export const otpVerificationLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // Much higher limit in development
  message: 'Too many verification attempts, please try again later',
  keyGenerator: (req) => `otp-verify:${req.ip || 'unknown-ip'}:${req.body.userId || 'unknown-user'}`,
});

export const generalLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many upload requests, please try again later',
});