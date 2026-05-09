import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import logger from './utils/logger';
import apiRoutes from './api/routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security and standard middlewares
// TODO: Implement rate limiting and security middlewares

// Routes
app.use('/api/v1', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Global error: ${err.message}`);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
