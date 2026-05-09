import { Router } from 'express';
import { getJobStatus } from '../controllers/status.controller';

const router = Router();

router.get('/:jobId', getJobStatus);

export default router;
