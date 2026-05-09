import IORedis from 'ioredis';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

connection.on('connect', () => {
  logger.info('Successfully connected to Redis.');
});

export default connection;
