import { faker } from '@faker-js/faker';

export const SessionFactory = {
  valid(overrides?: Record<string, any>) {
    return {
      garageId: faker.number.int({ min: 1, max: 5 }),
      vehicleId: faker.number.int({ min: 1, max: 20 }),
      spaceNumber: faker.number.int({ min: 1, max: 100 }),
      ...overrides,
    };
  },

  withInvalidGarage() {
    return {
      garageId: 9999,
      vehicleId: 1,
      spaceNumber: 12,
    };
  },

  withMissingVehicle() {
    return {
      garageId: 1,
      vehicleId: null,
      spaceNumber: 12,
    };
  },
};

export const PaymentFactory = {
  valid(sessionId: number | null, overrides?: Record<string, any>) {
    return {
      sessionId,
      amount: faker.number.int({ min: 10, max: 50 }),
      method: faker.helpers.arrayElement(['card', 'cash', 'app']),
      ...overrides,
    };
  },

  withZeroAmount(sessionId: number | null) {
    return {
      sessionId,
      amount: 0,
      method: 'card',
    };
  },

  withNegativeAmount(sessionId: number | null) {
    return {
      sessionId,
      amount: -50,
      method: 'card',
    };
  },
};

export const EVFactory = {
  validActivation(chargerId: number, sessionId: number) {
    return {
      chargerId,
      sessionId,
      spaceNumber: faker.number.int({ min: 1, max: 20 }),
    };
  },
};
