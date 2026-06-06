import { test, expect } from '@playwright/test';
import { ParkingClient } from '@api/ParkingClient';
import { EVClient } from '@api/EVClient';
import { PaymentClient } from '@api/PaymentClient';
import { BusinessImpactEngine } from '@reporters/BusinessImpactEngine';

test.describe('E2E Journeys', () => {
  let parkingClient: ParkingClient;
  let evClient: EVClient;
  let paymentClient: PaymentClient;

  test.beforeEach(({ request }) => {
    parkingClient = new ParkingClient(request);
    evClient = new EVClient(request);
    paymentClient = new PaymentClient(request);
  });

  test('complete EV driver experience — single transaction', async () => {
    // 1. getGarages({hasEVCharging:true}) → take first result, assert hasEVCharging:true
    const garagesRes = await parkingClient.getGarages({ hasEVCharging: true });
    expect(garagesRes.status()).toBe(200);
    const garages = await garagesRes.json();
    expect(garages.length).toBeGreaterThan(0);
    const targetGarage = garages[0];
    expect(targetGarage.hasEVCharging).toBe(true);
    const garageId = targetGarage.id;

    // 2. startSession with that garageId → assert status:'active'
    // Let's use vehicleId: 1 and a random spaceNumber
    const sessionRes = await parkingClient.startSession({
      garageId,
      vehicleId: 1,
      spaceNumber: 42,
    });
    expect(sessionRes.status()).toBe(201);
    const session = await sessionRes.json();
    expect(session.status).toBe('active');
    const sessionId = session.id;

    // 3. getAvailableChargers(garageId) → take first charger
    const chargersRes = await evClient.getAvailableChargers(garageId);
    expect(chargersRes.status()).toBe(200);
    const chargers = await chargersRes.json();
    expect(chargers.length).toBeGreaterThan(0);
    const targetCharger = chargers[0];
    const chargerId = targetCharger.id;

    // 4. activateCharger with chargerId, sessionId, spaceNumber → assert status:'charging'
    const activateRes = await evClient.activateCharger({
      chargerId,
      sessionId,
      spaceNumber: targetCharger.spaceNumber,
    });
    expect(activateRes.status()).toBe(200);
    const activatedCharger = await activateRes.json();
    expect(activatedCharger.status).toBe('charging');
    expect(activatedCharger.currentSessionId).toBe(sessionId);

    // 5. Wait 100ms (simulate charging time)
    await new Promise(resolve => setTimeout(resolve, 100));

    // 6. stopCharger(chargerId) → assert status:'available'
    const stopRes = await evClient.stopCharger(chargerId);
    expect(stopRes.status()).toBe(200);
    const stoppedCharger = await stopRes.json();
    expect(stoppedCharger.status).toBe('available');
    expect(stoppedCharger.currentSessionId).toBeNull();

    // 7. endSession(sessionId) → assert status:'completed'
    const endSessionRes = await parkingClient.endSession(sessionId);
    expect(endSessionRes.status()).toBe(200);
    const endedSession = await endSessionRes.json();
    expect(endedSession.status).toBe('completed');

    // 8. processConsolidatedPayment with sessionId, chargerId, parkingAmount:8, evAmount:15, method:'app'
    // → assert status:'pending', covers includes 'parking' and 'ev_charging', amount === 23
    const paymentRes = await paymentClient.processConsolidatedPayment({
      sessionId,
      chargerId,
      parkingAmount: 8,
      evAmount: 15,
      method: 'app',
    });
    expect(paymentRes.status()).toBe(201);
    const payment = await paymentRes.json();
    expect(payment.status).toBe('pending');
    expect(payment.covers).toContain('parking');
    expect(payment.covers).toContain('ev_charging');
    expect(payment.amount).toBe(23);

    // 9. Log: "✅ Flash Core Journey PASSED — Full EV parking experience validated"
    console.log('⚡ [Flash Guardian] ✅ Flash Core Journey PASSED — Full EV parking experience validated');

    // 10. Log BusinessImpactEngine.calculate('/payments') at end
    const paymentImpact = BusinessImpactEngine.calculate('/payments');
    console.log(`⚡ [Flash Guardian] ${paymentImpact}`);
  });
});
