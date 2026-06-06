import { test, expect } from '@playwright/test';
import { ParkingClient } from '@api/ParkingClient';

test.describe('Garages API', () => {
  let parkingClient: ParkingClient;

  test.beforeEach(({ request }) => {
    parkingClient = new ParkingClient(request);
  });

  test('should return all garages', async () => {
    const response = await parkingClient.getGarages();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    for (const garage of body) {
      expect(garage).toHaveProperty('id');
      expect(garage).toHaveProperty('name');
      expect(garage).toHaveProperty('hourlyRate');
    }
    console.log('⚡ [Flash Guardian] Verified all garages successfully.');
  });

  test('should return garages with EV charging', async () => {
    const response = await parkingClient.getGarages({ hasEVCharging: true });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    for (const garage of body) {
      expect(garage.hasEVCharging).toBe(true);
    }
    console.log('⚡ [Flash Guardian] Verified EV-charging garages filter successfully.');
  });

  test('should return single garage by id', async () => {
    const response = await parkingClient.getGarage(1);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(1);
    console.log('⚡ [Flash Guardian] Verified single garage retrieval by ID.');
  });

  test('should return 404 for non-existent garage', async () => {
    const response = await parkingClient.getGarage(9999);
    expect(response.status()).toBe(404);
    console.log('⚡ [Flash Guardian] Verified 404 for non-existent garage.');
  });

  test('should validate garage response schema', async () => {
    const response = await parkingClient.getGarage(1);
    expect(response.status()).toBe(200);

    const garage = await response.json();
    const requiredFields = [
      'id',
      'name',
      'address',
      'totalSpaces',
      'availableSpaces',
      'hourlyRate',
      'status',
      'hasEVCharging',
      'evChargerCount',
    ];

    for (const field of requiredFields) {
      expect(garage).toHaveProperty(field);
    }
    console.log('⚡ [Flash Guardian] Verified garage response schema successfully.');
  });
});
