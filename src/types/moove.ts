export interface CreatePaymentLinkRequest {
  toAmount: string;
  description: string;
  maxUsage: number;
}

export interface PaymentLinkResponse {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'expired';
  toAmount: string;
  description: string;
  createdAt?: string;
}

export interface PayoutReceipt {
  transactionHash: string;
  recipientHandle: string;
  amount: string;
  currency: string;
  timestamp: string;
}