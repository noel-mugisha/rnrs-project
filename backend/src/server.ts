import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from '@/config/logger';
import { prisma } from '@/config/database';

const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();