import { FullConfig } from '@playwright/test';

/**
 * Global setup runs once before all test suites.
 * Responsibilities:
 * 1. Verify the target environment is reachable
 * 2. Seed test data (via Firebase Admin SDK or API calls)
 * 3. Set environment variables for test accounts
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;

  if (!baseURL) {
    throw new Error('baseURL is not configured in playwright.config.ts');
  }

  console.log(`[Global Setup] Target environment: ${baseURL}`);

  // Verify the app is reachable
  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`App returned status ${response.status}`);
    }
    console.log('[Global Setup] App is reachable ✓');
  } catch (error) {
    console.warn(
      '[Global Setup] App is not reachable. Ensure dev server is running:',
      (error as Error).message,
    );
    console.warn('[Global Setup] Tests will fail if the app is not running.');
  }

  // In CI, seed test data via Firebase Admin SDK or REST API
  if (process.env.CI) {
    console.log('[Global Setup] CI mode: seeding test data...');
    // TODO: Implement Firebase Admin SDK seeding for CI
    // This would create test users, households, and meal data
  }

  console.log('[Global Setup] Complete.');
}

export default globalSetup;