import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Local runs get one retry to absorb emulator / first-paint flakiness; CI gets 2.
  retries: process.env.CI ? 2 : 1,
  // The local Firebase emulators (Auth 9099 / Firestore 8080) are in-memory and
  // cannot safely absorb parallel auth sign-ups — concurrent `beforeEach`
  // sign-ups wedge up auth state and time out waiting for the onboarding UI to
  // render. CI already serializes (`workers: 1`); local runs do the same to
  // keep results deterministic.
  workers: 1,
  reporter: [
    ['html', { outputFolder: './reports/html' }],
    ['list'],
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: process.env.CI
      ? 'https://foodgenweb.web.app'
      : 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Hide Firebase emulator warning banner that blocks clicks
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npx vite --port 5173',
        // webServer commands run with cwd = the config file's directory (e2e/)
        // by default; Vite must serve from the project root (where index.html
        // lives) or every request 404s.
        cwd: path.resolve(__dirname, '..'),
        url: 'http://localhost:5173',
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
      },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14 Pro'],
      },
    },
  ],

  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'),
});