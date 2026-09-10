import { inMemoryStore, persistToDisk } from './database';
import { Task, TaskStatus } from '../types/task';

export interface TransactionRecord {
  id: string;
  taskId: string;
  type: 'INCOMING_DEPOSIT' | 'OUTGOING_PAYOUT';
  amount: number;
  currency: string;
  fromHandleOrAddress: string;
  toHandleOrAddress: string;
  txHash: string;
  status: 'PENDING' | 'CONFIRMED';
  timestamp: string;
}

export class TaskRepository {
  saveTask(task: Task): void {
    inMemoryStore.tasks[task.id] = { ...task };
    persistToDisk();
  }

  getTaskById(id: string): Task | undefined {
    return inMemoryStore.tasks[id];
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return Object.values(inMemoryStore.tasks).filter((t: Task) => t.status === status);
  }

  getAllTasks(limit = 50): Task[] {
    return Object.values(inMemoryStore.tasks)
      .sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  saveTransaction(tx: TransactionRecord): void {
    inMemoryStore.transactions.push({ ...tx });
    persistToDisk();
  }

  getTransactionsByTaskId(taskId: string): TransactionRecord[] {
    return inMemoryStore.transactions.filter((tx: TransactionRecord) => tx.taskId === taskId);
  }

  getAllTransactions(limit = 100): TransactionRecord[] {
    return [...inMemoryStore.transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const taskRepository = new TaskRepository();