import { Queue } from 'bullmq';
import connection from '../utils/redis';

const queueName = 'pdf-processing-queue';

export const pdfQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true, // Keep Redis clean
  },
});
