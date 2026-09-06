import { v4 as uuidv4 } from 'uuid';
import { Task, TaskCapability, TaskResult } from '../types/task';
import { mooveClient } from './mooveClient';
import { agentRegistry } from './agentRegistry';
import { sanitizeHandle } from '../config/env';

export class TaskEngine {
  private tasks: Map<string, Task> = new Map();

  async createTask(params: {
    title: string;
    description: string;
    requiredCapability: TaskCapability;
    budgetUsdc: number;
    clientHandle: string;
  }): Promise<Task> {
    const worker = agentRegistry.findWorkerByCapability(params.requiredCapability);
    if (!worker) {
      throw new Error(`No available worker found for capability: ${params.requiredCapability}`);
    }

    const taskId = uuidv4();
    const paymentLink = await mooveClient.createPaymentLink(
      params.budgetUsdc,
      `AgentGig-Task-${taskId}`
    );

    const task: Task = {
      id: taskId,
      title: params.title,
      description: params.description,
      requiredCapability: params.requiredCapability,
      budgetUsdc: params.budgetUsdc,
      clientHandle: sanitizeHandle(params.clientHandle),
      assignedWorkerId: worker.id,
      paymentLinkId: paymentLink.id,
      paymentUrl: paymentLink.url,
      status: 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  async verifyAndProcess(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    if (task.status === 'COMPLETED') return task;
    if (!task.paymentLinkId) throw new Error('Task has no payment link associated');

    const status = await mooveClient.getPaymentStatus(task.paymentLinkId);

    if (status === 'completed') {
      task.status = 'PAID';
      task.updatedAt = new Date().toISOString();

      await this.runWorkerExecution(task);
    }

    return task;
  }

  private async runWorkerExecution(task: Task): Promise<void> {
    const worker = agentRegistry.getWorkerById(task.assignedWorkerId!);
    if (!worker) {
      task.status = 'FAILED';
      return;
    }

    task.status = 'PROCESSING';
    task.updatedAt = new Date().toISOString();

    try {
      const result: TaskResult = await worker.execute(task.description);
      task.result = result;

      const payout = await mooveClient.executeHandlePayout(worker.mooveHandle, task.budgetUsdc);
      task.payoutReceipt = {
        recipientHandle: payout.recipientHandle,
        amountUsdc: task.budgetUsdc,
        settledAt: payout.timestamp,
      };

      task.status = 'COMPLETED';
    } catch {
      task.status = 'FAILED';
    } finally {
      task.updatedAt = new Date().toISOString();
      this.tasks.set(task.id, task);
    }
  }
}

export const taskEngine = new TaskEngine();