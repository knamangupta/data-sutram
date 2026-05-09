import { Request, Response } from 'express';
import logger from '../../utils/logger';

/**
 * Note: Redis and pdfQueue (BullMQ) have been removed. 
 * Processing is now handled synchronously during the initial upload request.
 */
export const getJobStatus = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;

  try {
    if (typeof jobId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing Job ID' });
      return;
    }

    res.json({
      jobId,
      state: 'completed',
      progress: 100,
      message: "Redis removed. Analysis is performed synchronously upon upload."
    });
  } catch (error: any) {
    logger.error(`Error fetching job status for ${jobId}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while fetching status' });
  }
};
