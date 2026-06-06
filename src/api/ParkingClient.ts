import { APIRequestContext, APIResponse } from '@playwright/test';

export class ParkingClient {
  private req: APIRequestContext;
  private baseUrl: string;

  constructor(req: APIRequestContext, baseUrl = process.env.API_URL || 'http://127.0.0.1:3001') {
    this.req = req;
    this.baseUrl = baseUrl;
  }

  async getGarages(filters?: { hasEVCharging?: boolean }): Promise<APIResponse> {
    const params: Record<string, string | boolean> = {};
    if (filters?.hasEVCharging !== undefined) {
      params.hasEVCharging = filters.hasEVCharging;
    }
    return this.req.get(`${this.baseUrl}/garages`, { params });
  }

  async getGarage(id: number): Promise<APIResponse> {
    return this.req.get(`${this.baseUrl}/garages/${id}`);
  }

  async startSession(payload: { garageId: number | null; vehicleId: number | null; spaceNumber: number }): Promise<APIResponse> {
    return this.req.post(`${this.baseUrl}/sessions`, {
      data: {
        ...payload,
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'active',
      },
    });
  }

  async endSession(id: number): Promise<APIResponse> {
    return this.req.patch(`${this.baseUrl}/sessions/${id}`, {
      data: {
        exitTime: new Date().toISOString(),
        status: 'completed',
      },
    });
  }

  async getSession(id: number): Promise<APIResponse> {
    return this.req.get(`${this.baseUrl}/sessions/${id}`);
  }
}
