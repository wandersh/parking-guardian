import { APIRequestContext, APIResponse } from '@playwright/test';

export class PaymentClient {
  private req: APIRequestContext;
  private baseUrl: string;

  constructor(req: APIRequestContext, baseUrl = process.env.API_URL || 'http://127.0.0.1:3001') {
    this.req = req;
    this.baseUrl = baseUrl;
  }

  async processPayment(payload: { sessionId: number | null; amount: number; method: string }): Promise<APIResponse> {
    return this.req.post(`${this.baseUrl}/payments`, {
      data: {
        ...payload,
        status: 'pending',
        covers: ['parking'],
        processedAt: new Date().toISOString(),
      },
    });
  }

  async processConsolidatedPayment(payload: {
    sessionId: number | null;
    chargerId: number | null;
    parkingAmount: number;
    evAmount: number;
    method: string;
  }): Promise<APIResponse> {
    return this.req.post(`${this.baseUrl}/payments`, {
      data: {
        sessionId: payload.sessionId,
        chargerId: payload.chargerId,
        parkingAmount: payload.parkingAmount,
        evAmount: payload.evAmount,
        amount: payload.parkingAmount + payload.evAmount,
        method: payload.method,
        status: 'pending',
        covers: ['parking', 'ev_charging'],
        processedAt: new Date().toISOString(),
      },
    });
  }

  async getPayment(id: number): Promise<APIResponse> {
    return this.req.get(`${this.baseUrl}/payments/${id}`);
  }
}
