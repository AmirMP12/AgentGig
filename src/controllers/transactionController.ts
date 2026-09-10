import { Request, Response } from 'express';
import { taskRepository } from '../database/taskRepository';

export const listTransactionsHandler = (_req: Request, res: Response): void => {
  const transactions = taskRepository.getAllTransactions();
  res.json({
    totalCount: transactions.length,
    transactions,
  });
};

export const getTaskTransactionsHandler = (req: Request, res: Response): void => {
  const txs = taskRepository.getTransactionsByTaskId(req.params.taskId);
  res.json(txs);
};