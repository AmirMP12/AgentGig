import { BaseWorker } from '../workers/baseWorker';
import { AuditAgent } from '../workers/auditAgent';
import { DataScraperAgent } from '../workers/dataScraperAgent';
import { DynamicWorker } from '../workers/dynamicWorker';
import { TaskCapability } from '../types/task';
import { inMemoryStore, persistToDisk } from '../database/database';

export class AgentRegistry {
  private workers: Map<string, BaseWorker> = new Map();

  constructor() {
    // Register Default Core Workers
    this.register(new AuditAgent());
    this.register(new DataScraperAgent());

    // Load any persisted 3rd-party dynamic workers
    this.loadPersistedWorkers();
  }

  register(worker: BaseWorker): void {
    this.workers.set(worker.id, worker);
  }

  registerThirdPartyWorker(params: {
    name: string;
    capability: string;
    mooveHandle: string;
    webhookUrl?: string;
  }): BaseWorker {
    const workerId = `worker_custom_${Math.random().toString(36).substring(2, 9)}`;
    const worker = new DynamicWorker({
      id: workerId,
      name: params.name,
      capability: params.capability as TaskCapability,
      mooveHandle: params.mooveHandle,
      webhookUrl: params.webhookUrl,
    });

    this.register(worker);

    // Persist to storage
    inMemoryStore.customWorkers.push({
      id: worker.id,
      name: worker.name,
      capability: worker.capability,
      mooveHandle: worker.mooveHandle,
      webhookUrl: worker.webhookUrl,
    });
    persistToDisk();

    return worker;
  }

  private loadPersistedWorkers(): void {
    if (inMemoryStore.customWorkers && Array.isArray(inMemoryStore.customWorkers)) {
      for (const w of inMemoryStore.customWorkers) {
        this.register(new DynamicWorker(w));
      }
    }
  }

  findWorkerByCapability(capability: string): BaseWorker | undefined {
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