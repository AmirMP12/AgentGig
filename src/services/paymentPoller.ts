import { taskRepository } from '../database/taskRepository';
import { taskEngine } from './taskEngine';

export class PaymentPoller {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private readonly intervalMs: number;

  constructor(intervalMs = 3000) {
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.timer) return;
    console.log(`📡 Autonomous Payment Poller started (Interval: ${this.intervalMs}ms)`);

    this.timer = setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        await this.pollPendingTasks();
      } catch (err) {
        console.error('⚠️ Poller cycle error:', err);
      } finally {
        this.isProcessing = false;
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('🛑 Payment Poller stopped.');
    }
  }

  private async pollPendingTasks(): Promise<void> {
    const awaitingTasks = taskRepository.getTasksByStatus('AWAITING_PAYMENT');
    if (awaitingTasks.length === 0) return;

    for (const task of awaitingTasks) {
      try {
        await taskEngine.verifyAndProcess(task.id);
      } catch (err) {
        console.error(`Failed to process payment check for Task ${task.id}:`, err);
      }
    }
  }
}

export const paymentPoller = new PaymentPoller();