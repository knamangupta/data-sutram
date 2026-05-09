import { Worker, Job } from 'bullmq';
import connection from '../utils/redis';
import logger from '../utils/logger';

const queueName = 'pdf-processing-queue';

const processPdfJob = async (job: Job) => {
  const { filePath, originalName } = job.data;
  
  logger.info(`Worker starting job ${job.id} for file: ${originalName}`);
  
  try {
    // Phase 1: Update progress
    await job.updateProgress(10);
    logger.info(`[Job ${job.id}] Progress: 10% - Reading file...`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await job.updateProgress(40);
    logger.info(`[Job ${job.id}] Progress: 40% - Extracting text...`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await job.updateProgress(70);
    logger.info(`[Job ${job.id}] Progress: 70% - Analyzing transactions...`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    await job.updateProgress(100);
    logger.info(`[Job ${job.id}] Progress: 100% - Finished.`);
    
    return { success: true, message: 'PDF processed successfully' };
  } catch (error: any) {
    logger.error(`[Job ${job.id}] failed: ${error.message}`);
    throw error;
  }
};

export const pdfWorker = new Worker(queueName, processPdfJob, {
  connection,
  concurrency: 5, // Process up to 5 PDFs concurrently
});

pdfWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has completed!`);
});

pdfWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} has failed with ${err.message}`);
});
