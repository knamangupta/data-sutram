import { Request, Response } from 'express';
import logger from '../../utils/logger';
import path from 'path';
import fs from 'fs';

// Import AI Logic (using require due to .js extension in a TS project)
const { categorizeTransactions } = require('../../ai/categorizer');
const { generateInsights } = require('../../ai/insights');

// Import the PDF Parser
const { parsePDF } = require('../../pipeline/pdfParser');

export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    logger.info(`Processing file: ${originalName}`);

    // 1. EXTRACT: Call the parser to get transactions from the uploaded file
    logger.info(`Starting extraction for: ${filePath}`);
    const rawTransactions = await parsePDF(filePath);
    
    // 2. CATEGORIZE: Use your existing AI categorizer
    const categorizedTransactions = await categorizeTransactions(rawTransactions);

    // 3. INSIGHTS: Generate the summary and AI-driven insights
    const { summary, insights } = await generateInsights(categorizedTransactions);

    // 4. CLEANUP: Remove the uploaded file from local storage after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: 'File processed successfully',
      transactions: categorizedTransactions,
      summary: summary,
      insights: insights,
      originalName
    });
  } catch (error: any) {
    logger.error(`Processing error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
};
