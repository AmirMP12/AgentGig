import { Router } from 'express';
import {
  createTaskHandler,
  getTaskHandler,
  verifyPaymentHandler,
  listWorkersHandler,
  registerWorkerHandler,
} from '../controllers/taskController';
import {
  listTransactionsHandler,
  getTaskTransactionsHandler,
} from '../controllers/transactionController';
import { taskRepository } from '../database/taskRepository';

const router = Router();

// Task Management
router.post('/tasks', createTaskHandler);
router.get('/tasks', (_req, res) => res.json(taskRepository.getAllTasks()));
router.get('/tasks/:id', getTaskHandler);
router.post('/tasks/:id/verify-payment', verifyPaymentHandler);

// Worker Registry
router.get('/workers', listWorkersHandler);
router.post('/workers/register', registerWorkerHandler);

// Transaction Ledger (Milestone 2 Feature)
router.get('/transactions', listTransactionsHandler);
router.get('/tasks/:taskId/transactions', getTaskTransactionsHandler);

export default router;