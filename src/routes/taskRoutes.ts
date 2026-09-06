import { Router } from 'express';
import {
  createTaskHandler,
  getTaskHandler,
  verifyPaymentHandler,
  listWorkersHandler,
} from '../controllers/taskController';

const router = Router();

router.post('/tasks', createTaskHandler);
router.get('/tasks/:id', getTaskHandler);
router.post('/tasks/:id/verify-payment', verifyPaymentHandler);
router.get('/workers', listWorkersHandler);

export default router;