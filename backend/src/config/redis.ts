import Redis from 'ioredis';
import { logger } from './logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
});

redis.on('connect', () => logger.info('Connecting to Redis...'));
redis.on('ready', () => logger.info('Redis is ready'));
redis.on('error', (error) => logger.error('Redis connection error:', error));
redis.on('end', () => logger.warn('Redis connection closed'));

export { redis };