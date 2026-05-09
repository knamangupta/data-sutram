import { Request, Response } from 'express';
import { pdfQueue } from '../../queues/pdfQueue';
import logger from '../../utils/logger';

export const getJobStatus = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;

  try {

    if (typeof jobId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing Job ID' });
      return;
    }

    const job = await pdfQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      jobId,
      state, // 'waiting', 'active', 'completed', 'failed', etc.
      progress,
      result: result || null,
      error: failedReason || null,
    });
  } catch (error: any) {
    logger.error(`Error fetching job status for ${jobId}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while fetching status' });
  }
};
