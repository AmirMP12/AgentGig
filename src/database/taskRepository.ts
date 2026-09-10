import { db } from './database';
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
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, requiredCapability, budgetUsdc,
        clientHandle, assignedWorkerId, paymentLinkId, paymentUrl,
        status, resultJson, payoutReceiptJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        resultJson = excluded.resultJson,
        payoutReceiptJson = excluded.payoutReceiptJson,
        updatedAt = excluded.updatedAt
    `);

    stmt.run(
      task.id,
      task.title,
      task.description,
      task.requiredCapability,
      task.budgetUsdc,
      task.clientHandle,
      task.assignedWorkerId || null,
      task.paymentLinkId || null,
      task.paymentUrl || null,
      task.status,
      task.result ? JSON.stringify(task.result) : null,
      task.payoutReceipt ? JSON.stringify(task.payoutReceipt) : null,
      task.createdAt,
      task.updatedAt
    );
  }

  getTaskById(id: string): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return undefined;
    return this.mapRowToTask(row);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    const stmt = db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt ASC');
    const rows = stmt.all(status) as Record<string, unknown>[];
    return rows.map((r) => this.mapRowToTask(r));
  }

  getAllTasks(limit = 50): Task[] {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC LIMIT ?');
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map((r) => this.mapRowToTask(r));
  }

  saveTransaction(tx: TransactionRecord): void {
    const stmt = db.prepare(`
      INSERT INTO transactions (
        id, taskId, type, amount, currency,
        fromHandleOrAddress, toHandleOrAddress, txHash, status, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tx.id,
      tx.taskId,
      tx.type,
      tx.amount,
      tx.currency,
      tx.fromHandleOrAddress,
      tx.toHandleOrAddress,
      tx.txHash,
      tx.status,
      tx.timestamp
    );
  }

  getTransactionsByTaskId(taskId: string): TransactionRecord[] {
    const stmt = db.prepare('SELECT * FROM transactions WHERE taskId = ? ORDER BY timestamp ASC');
    return stmt.all(taskId) as TransactionRecord[];
  }

  getAllTransactions(limit = 100): TransactionRecord[] {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(limit) as TransactionRecord[];
  }

  private mapRowToTask(row: Record<string, unknown>): Task {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      requiredCapability: row.requiredCapability as any,
      budgetUsdc: Number(row.budgetUsdc),
      clientHandle: row.clientHandle as string,
      assignedWorkerId: (row.assignedWorkerId as string) || undefined,
      paymentLinkId: (row.paymentLinkId as string) || undefined,
      paymentUrl: (row.paymentUrl as string) || undefined,
      status: row.status as TaskStatus,
      result: row.resultJson ? JSON.parse(row.resultJson as string) : undefined,
      payoutReceipt: row.payoutReceiptJson ? JSON.parse(row.payoutReceiptJson as string) : undefined,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };
  }
}

export const taskRepository = new TaskRepository();