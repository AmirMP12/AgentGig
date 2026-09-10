import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDirectory = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.join(dbDirectory, 'agentgig.db');
export const db = new Database(dbPath);

// Enable Write-Ahead Logging (WAL) for superior concurrency and performance
db.pragma('journal_mode = WAL');

export function initializeDatabase(): void {
  // 1. Table for Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requiredCapability TEXT NOT NULL,
      budgetUsdc REAL NOT NULL,
      clientHandle TEXT NOT NULL,
      assignedWorkerId TEXT,
      paymentLinkId TEXT,
      paymentUrl TEXT,
      status TEXT NOT NULL,
      resultJson TEXT,
      payoutReceiptJson TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. Table for Financial Transaction Audit Trail (Ledger)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      type TEXT NOT NULL, -- 'INCOMING_DEPOSIT' or 'OUTGOING_PAYOUT'
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDC',
      fromHandleOrAddress TEXT NOT NULL,
      toHandleOrAddress TEXT NOT NULL,
      txHash TEXT NOT NULL,
      status TEXT NOT NULL, -- 'PENDING' or 'CONFIRMED'
      timestamp TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    );
  `);

  // Indexes for query optimization
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_taskId ON transactions(taskId);
  `);
}