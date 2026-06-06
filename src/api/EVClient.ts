import { APIRequestContext, APIResponse } from '@playwright/test';

export class EVClient {
  private req: APIRequestContext;
  private baseUrl: string;

  constructor(req: APIRequestContext, baseUrl = process.env.API_URL || 'http://127.0.0.1:3001') {
    this.req = req;
    this.baseUrl = baseUrl;
  }

  async getAvailableChargers(garageId: number): Promise<APIResponse> {
    return this.req.get(`${this.baseUrl}/ev_chargers`, {
      params: {
        garageId,
        status: 'available',
      },
    });
  }

  async activateCharger(payload: { chargerId: number; sessionId: number; spaceNumber: number }): Promise<APIResponse> {
    return this.req.patch(`${this.baseUrl}/ev_chargers/${payload.chargerId}`, {
      data: {
        status: 'charging',
        currentSessionId: payload.sessionId,
      },
    });
  }

  async stopCharger(chargerId: number): Promise<APIResponse> {
    return this.req.patch(`${this.baseUrl}/ev_chargers/${chargerId}`, {
      data: {
        status: 'available',
        currentSessionId: null,
      },
    });
  }

  async getChargerStatus(chargerId: number): Promise<APIResponse> {
    return this.req.get(`${this.baseUrl}/ev_chargers/${chargerId}`);
  }
}
