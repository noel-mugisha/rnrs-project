import rateLimit from 'express-rate-limit';
import { redis } from '@/config/redis';
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
    store: {
      incr: async (key: string) => {
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, Math.ceil(options.windowMs / 1000));
        }
        return { totalHits: current, resetTime: new Date(Date.now() + options.windowMs) };
      },
      decrement: async (key: string) => {
        await redis.decr(key);
      },
      resetKey: async (key: string) => {
        await redis.del(key);
      },
    },
  });
};

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