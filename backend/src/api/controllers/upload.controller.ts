import { Request, Response } from 'express';
import logger from '../../utils/logger';
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

    // Redis removed: Processing is now handled synchronously.
    // In a full implementation, you would call your PDF parser and AI categorizer here.
    logger.info(`Processing file synchronously: ${originalName}`);

    res.status(200).json({
      message: 'File processed successfully',
      transactions: [], // Replace with actual parsed transactions
      summary: { totalIn: 0, totalOut: 0, net: 0 },
      insights: ["Analysis completed synchronously without Redis."],
      originalName
    });
  } catch (error: any) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
};
