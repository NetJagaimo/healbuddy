import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    ...devices['Pixel 7'],
    locale: 'zh-TW',
    timezoneId: 'Asia/Taipei',
    baseURL: 'http://localhost:4173/healbuddy/',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/healbuddy/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
