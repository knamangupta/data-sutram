import { Request, Response } from 'express';
import logger from '../../utils/logger';
import path from 'path';
import fs from 'fs';

// Import AI Logic (using require due to .js extension in a TS project)
const { categorizeTransactions } = require('../../ai/categorizer');
const { generateInsights } = require('../../ai/insights');

// Note: You may need to import your specific PDF parsing utility here
// e.g., import { parseStatement } from '../../utils/pdfParser';

export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    logger.info(`Processing file: ${originalName}`);

    // 1. EXTRACT: This is where you call your PDF text extraction logic.
    // For now, I'm using a placeholder for the transactions array you were previously extracting.
    // You should replace 'rawTransactions' with the result of your PDF parsing function.
    const rawTransactions: any[] = []; 
    
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
