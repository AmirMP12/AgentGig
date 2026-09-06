import { BaseWorker } from '../workers/baseWorker';
import { AuditAgent } from '../workers/auditAgent';
import { DataScraperAgent } from '../workers/dataScraperAgent';
import { TaskCapability } from '../types/task';

export class AgentRegistry {
  private workers: Map<string, BaseWorker> = new Map();

  constructor() {
    this.register(new AuditAgent());
    this.register(new DataScraperAgent());
  }

  register(worker: BaseWorker): void {
    this.workers.set(worker.id, worker);
  }

  findWorkerByCapability(capability: TaskCapability): BaseWorker | undefined {
    return Array.from(this.workers.values()).find((w) => w.capability === capability);
  }

  getWorkerById(id: string): BaseWorker | undefined {
    return this.workers.get(id);
  }

  getAllWorkers(): BaseWorker[] {
    return Array.from(this.workers.values());
  }
}

export const agentRegistry = new AgentRegistry();