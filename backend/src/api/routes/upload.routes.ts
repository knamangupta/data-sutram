import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { uploadPdf } from '../controllers/upload.controller';

const router = Router();

// Endpoint for PDF upload
router.post('/', uploadMiddleware.single('file'), uploadPdf);

export default router;
