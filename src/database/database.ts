import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'agentgig-storage.json');

export interface StorageSchema {
  tasks: Record<string, any>;
  transactions: any[];
}

export const inMemoryStore: StorageSchema = {
  tasks: {},
  transactions: [],
};

export function initializeDatabase(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryStore.tasks = parsed.tasks || {};
      inMemoryStore.transactions = parsed.transactions || [];
    } catch {
      persistToDisk();
    }
  } else {
    persistToDisk();
  }
}

export function persistToDisk(): void {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}