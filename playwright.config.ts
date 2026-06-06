import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.API_URL || 'http://127.0.0.1:3001',
    extraHTTPHeaders: {
      'x-api-client': 'flash-guardian-sdet',
      'x-request-id': Date.now().toString(),
    },
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.test.ts',
    },
    {
      name: 'journey-tests',
      testMatch: '**/journeys/**/*.test.ts',
    },
    {
      name: 'edge-cases',
      testMatch: '**/edge/**/*.test.ts',
    },
  ],
});
