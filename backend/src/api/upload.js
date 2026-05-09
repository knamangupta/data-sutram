const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const { parsePDF } = require('../pipeline/pdfParser');
const { categorizeTransactions } = require('../ai/categorizer');
const { generateInsights } = require('../ai/insights');

const router = express.Router();

// Configure multer for temporary OS storage and enforce 5MB limit
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Helper function to check PDF magic bytes (%PDF)
const isGenuinePDF = (filePath) => {
  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);
  return buffer.toString('hex') === '25504446'; 
};

router.post('/', upload.single('statement'), async (req, res) => {
  console.log('📥 Received POST request at /api/v1/upload');

  try {
    if (!req.file) {
      console.log('❌ No file found in the request payload.');
      return res.status(400).json({ error: 'No file uploaded. Please attach a PDF under the key "statement".' });
    }

    const filePath = req.file.path;

    // Magic byte validation
    if (!isGenuinePDF(filePath)) {
      fs.unlinkSync(filePath); // Clean up the fake PDF
      return res.status(400).json({ error: 'Invalid file type. Only genuine PDFs are allowed.' });
    }

    // Phase 2: Parse PDF synchronously
    const rawTransactions = await parsePDF(filePath);

    // Phase 3 & 4: Categorize, Generate Insights, and Direct Delivery
    const transactions = await categorizeTransactions(rawTransactions);
    const { summary, insights } = await generateInsights(transactions);

    // Cleanup temporary file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({ 
      message: 'Upload successful, PDF fully processed.',
      summary,
      insights,
      transactions
    });
  } catch (error) {
    console.error('Upload Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

module.exports = router;