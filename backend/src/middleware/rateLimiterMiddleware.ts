import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// We have completely removed the Redis import and the complex store configuration.
// The library will now handle everything in memory automatically.

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
    // The custom Redis 'store' object has been completely removed.
  });
};

// The rest of the file remains the same.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
});

export const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTP requests per minute
  message: 'Too many OTP requests, please try again later',
  keyGenerator: (req) => `otp:${req.ip || 'unknown-ip'}:${req.body.userId || req.body.email || 'unknown-user'}`,
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