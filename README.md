# Flash Guardian — AI-Powered SDET Showcase

[![Build Status](https://img.shields.io/badge/CI-passing-success?style=flat&logo=github-actions&logoColor=white)](#)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/-Playwright-%232EAD33?style=flat&logo=playwright&logoColor=white)

## 📊 Live Test Report
**[View Latest Playwright Report →](https://YOUR_USERNAME.github.io/flash-guardian)**

Updated automatically on every push to main.

## 🤖 Automated Quality Intelligence
When Flash Guardian detects a critical test failure, it automatically:
1. Calculates business impact (revenue loss estimate)
2. Creates a GitHub Issue with full context
3. Sends a Slack alert to the #quality channel
4. Publishes the HTML report to GitHub Pages

No manual bug reporting. No missed failures. Quality intelligence runs itself.

---

Flash Guardian is a robust test intelligence system built for validating cloud-based parking, electric vehicle (EV) charging, and transaction processing workflows. Modeled after Flash's core domain (flashparking.com), this system simulates and verifies the integrated user journey: from a driver reserving a space, entering a parking garage, activating an EV charging station without leaving their car, and paying for both parking and EV charging combined in a single consolidated transaction. By mocking the REST APIs and testing against them, Flash Guardian ensures critical transactions and user experiences are stable, error-free, and resilient.

---

## Project Architecture

The project consists of three core components:

1. **Mock API Backend (`mock-api`)**: An API layer built on top of `json-server` that mimics the real Flash garage gateways and transactions. A faker-based seeder generates garages, EV chargers, sessions, and payments.
2. **Playwright API Test Suite (`tests`)**: Comprehensive API tests validating CRUD operations, core vehicle/EV charging workflows, and boundary conditions/edge cases.
3. **Business Impact Engine (`src/reporters`)**: A custom analyzer that evaluates test failures against actual usage statistics (average ticket values and peak throughput hours) to quantify the exact business cost of the failure, prioritizing development alerts.

---

## How To Run

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Getting Started

Run the following three commands in your terminal:

```bash
# 1. Install dependencies
npm install

# 2. Seed database & run mock API (runs on port 3001)
npm run api:start

# 3. In another terminal window, run the full test suite
npm run test
```

---

## Test Directory Structure

- `tests/api/`: Focuses on discrete endpoint validations. Verifies garages, starts/ends parking sessions, and audits schemas.
- `tests/journeys/`: Evaluates complex, multi-system integration logic (E2E API journey mimicking an EV driver's live session).
- `tests/edge/`: Investigates concurrent payments, race conditions, parameter validation failures, and invalid values.

---

## Business Impact Engine

When API assertions fail, the suite logs high-fidelity economic breakdowns. This shifts QA reporting from generic stack traces to direct business priority.

### Example Output:
```text
🟠 HIGH | ~240 sessions affected | Estimated revenue impact: $2,880
```
*Calculated using: (Peak sessions/hour) * (Failure Duration / 60) * (Average ticket value)*.

---

## The EV Journey Test Flow

The full integration test `ev-parking-full-journey.test.ts` validates the entire end-to-end journey in 9 sequential steps:
1. **Find Garage**: Queries garages with active EV charging capabilities and selects the first one.
2. **Start Session**: Commences a parking session in the selected garage.
3. **Locate EV Charger**: Checks available EV chargers associated with that garage.
4. **Activate Charging**: Initiates charging at the space linked to the active session.
5. **Simulate Charging**: Pauses for 100 milliseconds to simulate a duration of power delivery.
6. **Stop Charging**: Halts charging and marks the EV charger as available.
7. **End Parking Session**: Exits the parking garage, ending the vehicle's session.
8. **Consolidate Invoice**: Submits payment for the total sum of parking + charging fees under one API request.
9. **Final Audit**: Confirms the receipt matches the expected aggregate amounts and logs the business impact profile.

---

**Built by Wander Capellan — SDET candidate for Flash Dominican Republic**
