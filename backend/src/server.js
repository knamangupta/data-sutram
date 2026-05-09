require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoute = require('./api/upload');
const chatRoute = require('./api/chat');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/upload', uploadRoute);
app.use('/api/v1/chat', chatRoute);

// Boot
app.listen(PORT, () => {
  console.log(`🚀 DataSutram MVP Backend running on port ${PORT}`);
});