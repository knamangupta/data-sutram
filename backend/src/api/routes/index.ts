import { Router } from 'express';
import uploadRoutes from './upload.routes';
import statusRoutes from './status.routes';

const router = Router();

// Define route prefixes here
router.use('/upload', uploadRoutes);
router.use('/status', statusRoutes);
// router.use('/chat', chatRoutes);

export default router;
