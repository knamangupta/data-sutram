import { Request, Response } from 'express';
import logger from '../../utils/logger';
import { pdfQueue } from '../../queues/pdfQueue';
import path from 'path';

export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded.' });
      return;
    }

    logger.info(`Received file upload: ${req.file.filename}`);

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Dispatch job to BullMQ queue
    const job = await pdfQueue.add('extract-pdf', {
      filePath,
      originalName,
    });

    res.status(202).json({
      message: 'File accepted for processing',
      jobId: job.id,
      statusUrl: `/api/v1/status/${job.id}`
    });
  } catch (error: any) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
};
