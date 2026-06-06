import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';

interface Garage {
  id: number;
  name: string;
  address: string;
  totalSpaces: number;
  availableSpaces: number;
  hourlyRate: number;
  status: 'active';
  hasEVCharging: boolean;
  evChargerCount: number;
}

interface Vehicle {
  id: number;
  plate: string;
  type: 'car' | 'motorcycle' | 'truck';
  ownerId: string;
}

interface Session {
  id: number;
  garageId: number;
  vehicleId: number;
  entryTime: string;
  exitTime: string | null;
  status: 'active' | 'completed' | 'disputed';
  spaceNumber: number;
}

interface Payment {
  id: number;
  sessionId: number;
  chargerId: number | null;
  amount: number;
  parkingAmount: number;
  evAmount: number;
  method: 'card' | 'cash' | 'app';
  status: 'completed' | 'pending' | 'failed';
  covers: ('parking' | 'ev_charging')[];
  processedAt: string;
}

interface EVCharger {
  id: number;
  garageId: number;
  spaceNumber: number;
  status: 'available' | 'charging' | 'offline';
  currentSessionId: number | null;
  kwh: number | null;
}

function run() {
  faker.seed(123); // For reproducible seeds

  // 1. Generate Garages
  const garages: Garage[] = [];
  const evGarageIds = [1, 3, 5]; // garages that will support EV
  for (let i = 1; i <= 5; i++) {
    const hasEV = evGarageIds.includes(i);
    const totalSpaces = faker.number.int({ min: 100, max: 300 });
    const evChargerCount = hasEV ? faker.number.int({ min: 2, max: 4 }) : 0;
    garages.push({
      id: i,
      name: `${faker.company.name()} Garage ${i}`,
      address: faker.location.streetAddress(),
      totalSpaces,
      availableSpaces: faker.number.int({ min: 10, max: totalSpaces }),
      hourlyRate: faker.number.int({ min: 5, max: 15 }),
      status: 'active',
      hasEVCharging: hasEV,
      evChargerCount,
    });
  }

  // 2. Generate EV Chargers
  const ev_chargers: EVCharger[] = [];
  let chargerIdCount = 1;
  for (const garage of garages) {
    if (garage.hasEVCharging) {
      for (let c = 1; c <= garage.evChargerCount; c++) {
        ev_chargers.push({
          id: chargerIdCount++,
          garageId: garage.id,
          spaceNumber: faker.number.int({ min: 1, max: 20 }),
          status: faker.helpers.arrayElement(['available', 'charging', 'offline']),
          currentSessionId: null,
          kwh: null,
        });
      }
    }
  }

  // 3. Generate Vehicles
  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 20; i++) {
    vehicles.push({
      id: i,
      plate: faker.vehicle.vrm(),
      type: faker.helpers.arrayElement(['car', 'motorcycle', 'truck']),
      ownerId: faker.string.uuid(),
    });
  }

  // 4. Generate Sessions
  const sessions: Session[] = [];
  for (let i = 1; i <= 15; i++) {
    const isActive = i > 10; // 10 completed, 5 active
    const garage = faker.helpers.arrayElement(garages);
    const vehicle = faker.helpers.arrayElement(vehicles);
    const entryTime = faker.date.recent({ days: 2 }).toISOString();
    const exitTime = isActive ? null : faker.date.between({ from: entryTime, to: new Date() }).toISOString();
    
    sessions.push({
      id: i,
      garageId: garage.id,
      vehicleId: vehicle.id,
      entryTime,
      exitTime,
      status: isActive ? 'active' : faker.helpers.arrayElement(['completed', 'disputed']),
      spaceNumber: faker.number.int({ min: 1, max: garage.totalSpaces }),
    });
  }

  // 5. Generate Payments
  const payments: Payment[] = [];
  for (let i = 1; i <= 10; i++) {
    const session = sessions[i - 1]; // link to first 10 completed sessions
    const parkingAmount = faker.number.int({ min: 10, max: 40 });
    const isEvPayment = i % 2 === 0; // half are EV charging payments too
    
    let chargerId: number | null = null;
    let evAmount = 0;
    let covers: ('parking' | 'ev_charging')[] = ['parking'];
    
    if (isEvPayment) {
      const matchingChargers = ev_chargers.filter(c => c.garageId === session.garageId);
      if (matchingChargers.length > 0) {
        const selectedCharger = faker.helpers.arrayElement(matchingChargers);
        chargerId = selectedCharger.id;
        evAmount = faker.number.int({ min: 15, max: 35 });
        covers.push('ev_charging');
        
        // Match charger session state
        selectedCharger.status = 'charging';
        selectedCharger.currentSessionId = session.id;
      }
    }
    
    payments.push({
      id: i,
      sessionId: session.id,
      chargerId,
      amount: parkingAmount + evAmount,
      parkingAmount,
      evAmount,
      method: faker.helpers.arrayElement(['card', 'cash', 'app']),
      status: faker.helpers.arrayElement(['completed', 'pending', 'failed']),
      covers,
      processedAt: faker.date.recent({ days: 1 }).toISOString(),
    });
  }

  const db = {
    garages,
    vehicles,
    sessions,
    payments,
    ev_chargers,
  };

  const dbPath = path.join(__dirname, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`⚡ [Flash Guardian] Seeding complete! Database saved to ${dbPath}`);
}

run();
