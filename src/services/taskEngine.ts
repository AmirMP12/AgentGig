import { v4 as uuidv4 } from 'uuid';
import { Task, TaskCapability, TaskResult } from '../types/task';
import { mooveClient } from './mooveClient';
import { agentRegistry } from './agentRegistry';
import { sanitizeHandle, config } from '../config/env';
import { taskRepository } from '../database/taskRepository';

export class TaskEngine {
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

    taskRepository.saveTask(task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return taskRepository.getTaskById(id);
  }

  getAllTasks(): Task[] {
    return taskRepository.getAllTasks();
  }

  async verifyAndProcess(taskId: string): Promise<Task> {
    const task = taskRepository.getTaskById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    if (task.status === 'COMPLETED' || task.status === 'PROCESSING') {
      return task;
    }
    if (!task.paymentLinkId) {
      throw new Error('Task does not possess a valid Moove paymentLinkId');
    }

    const paymentStatus = await mooveClient.getPaymentStatus(task.paymentLinkId);

    if (paymentStatus === 'completed') {
      task.status = 'PAID';
      task.updatedAt = new Date().toISOString();
      taskRepository.saveTask(task);

      // Record Incoming Deposit in the Transaction Ledger
      taskRepository.saveTransaction({
        id: uuidv4(),
        taskId: task.id,
        type: 'INCOMING_DEPOSIT',
        amount: task.budgetUsdc,
        currency: 'USDC',
        fromHandleOrAddress: `@${task.clientHandle}`,
        toHandleOrAddress: config.platformHandleDisplay,
        txHash: `moove_dep_${task.paymentLinkId}`,
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
      });

      // Execute worker asynchronously
      await this.runWorkerExecution(task);
    }

    return task;
  }

  private async runWorkerExecution(task: Task): Promise<void> {
    const worker = agentRegistry.getWorkerById(task.assignedWorkerId!);
    if (!worker) {
      task.status = 'FAILED';
      task.updatedAt = new Date().toISOString();
      taskRepository.saveTask(task);
      return;
    }

    task.status = 'PROCESSING';
    task.updatedAt = new Date().toISOString();
    taskRepository.saveTask(task);

    try {
      const result: TaskResult = await worker.execute(task.description);
      task.result = result;

      // Settle compensation programmatically to the Worker's Moove Handle
      const payout = await mooveClient.executeHandlePayout(worker.mooveHandle, task.budgetUsdc);
      task.payoutReceipt = {
        recipientHandle: payout.recipientHandle,
        amountUsdc: task.budgetUsdc,
        settledAt: payout.timestamp,
      };

      // Record Outgoing Settlement in the Transaction Ledger
      taskRepository.saveTransaction({
        id: uuidv4(),
        taskId: task.id,
        type: 'OUTGOING_PAYOUT',
        amount: task.budgetUsdc,
        currency: 'USDC',
        fromHandleOrAddress: config.platformHandleDisplay,
        toHandleOrAddress: payout.recipientHandle,
        txHash: payout.transactionHash,
        status: 'CONFIRMED',
        timestamp: payout.timestamp,
      });

      task.status = 'COMPLETED';
    } catch {
      task.status = 'FAILED';
    } finally {
      task.updatedAt = new Date().toISOString();
      taskRepository.saveTask(task);
    }
  }
}

export const taskEngine = new TaskEngine();