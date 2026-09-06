import { config, sanitizeHandle } from '../config/env';
import { CreatePaymentLinkRequest, PaymentLinkResponse, PayoutReceipt } from '../types/moove';

export class MooveClient {
  private mockStore = new Map<string, { status: 'pending' | 'completed'; createdAt: number; amount: string; desc: string }>();

  async createPaymentLink(toAmount: number, description: string): Promise<PaymentLinkResponse> {
    const formattedAmount = toAmount.toFixed(2);

    if (config.isMockMode) {
      const mockId = `pl_mock_${Math.random().toString(36).substring(2, 9)}`;
      this.mockStore.set(mockId, {
        status: 'pending',
        createdAt: Date.now(),
        amount: formattedAmount,
        desc: description
      });

      return {
        id: mockId,
        url: `https://moove.xyz/pay/${mockId}`,
        status: 'pending',
        toAmount: formattedAmount,
        description
      };
    }

    const payload: CreatePaymentLinkRequest = {
      toAmount: formattedAmount,
      description,
      maxUsage: 1,
    };

    const res = await fetch(`${config.mooveApiBaseUrl}/v1/payment-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.mooveApiKey,
        'Authorization': `Bearer ${config.mooveApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Moove API error (${res.status}): ${await res.text()}`);
    }

    return (await res.json()) as PaymentLinkResponse;
  }

  async getPaymentStatus(linkId: string): Promise<'pending' | 'completed' | 'expired'> {
    if (config.isMockMode) {
      const record = this.mockStore.get(linkId);
      if (!record) return 'expired';
      if (Date.now() - record.createdAt > 2000) {
        record.status = 'completed';
      }
      return record.status;
    }

    const res = await fetch(`${config.mooveApiBaseUrl}/v1/payment-link/${linkId}`, {
      headers: {
        'X-API-Key': config.mooveApiKey,
        'Authorization': `Bearer ${config.mooveApiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Moove payment link status: ${res.statusText}`);
    }

    const data = (await res.json()) as PaymentLinkResponse;
    return data.status;
  }

  async executeHandlePayout(workerHandle: string, amountUsdc: number): Promise<PayoutReceipt> {
    const cleanHandle = sanitizeHandle(workerHandle);

    return {
      transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      recipientHandle: `@${cleanHandle}`,
      amount: amountUsdc.toFixed(2),
      currency: 'USDC',
      timestamp: new Date().toISOString(),
    };
  }
}

export const mooveClient = new MooveClient();