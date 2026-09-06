export type TaskCapability = 'solidity-audit' | 'market-intelligence';

export type TaskStatus = 
  | 'CREATED' 
  | 'AWAITING_PAYMENT' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED';

export interface TaskResult {
  executionSummary: string;
  artifacts: Record<string, unknown>;
  completedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requiredCapability: TaskCapability;
  budgetUsdc: number;
  clientHandle: string;
  assignedWorkerId?: string;
  paymentLinkId?: string;
  paymentUrl?: string;
  status: TaskStatus;
  result?: TaskResult;
  payoutReceipt?: {
    recipientHandle: string;
    amountUsdc: number;
    settledAt: string;
  };
  createdAt: string;
  updatedAt: string;
}