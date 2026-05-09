const express = require('express');
const { processChatQuery } = require('../ai/chatAssistant');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query, transactions } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'A query string is required.' });
    }
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transactions array is required for context.' });
    }

    const answer = await processChatQuery(query, transactions);
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error.', answer: "Something went wrong on the server." });
  }
});

module.exports = router;