import { FullConfig } from '@playwright/test';

/**
 * Global teardown runs once after all test suites complete.
 * Responsibilities:
 * 1. Clean up test data (Firebase test users, households, meals)
 * 2. Close any remaining resources
 */
async function globalTeardown(config: FullConfig) {
  console.log('[Global Teardown] Cleaning up test data...');

  if (process.env.CI) {
    // TODO: Implement cleanup via Firebase Admin SDK
    console.log('[Global Teardown] CI mode: cleaning up test data...');
  }

  console.log('[Global Teardown] Complete.');
}

export default globalTeardown;