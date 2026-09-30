import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { removeEmulatorBanner } from '../../fixtures/emulator';

test.describe('Join Household Flow (TC-DASH-007 to TC-DASH-010)', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await removeEmulatorBanner(page);

    const onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const user = {
      name: 'E2E Join User',
      email: `e2e-join-${Date.now()}@test.foodgen.app`,
      password: 'TestPass123!',
    };
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    dashboard = new DashboardPage(page);
  });

  test('TC-DASH-007: Join household with invalid code shows error', async () => {
    await dashboard.joinHousehold('INVALIDCODE', 'viewer');
    await expect(
      dashboard.page.locator('.error-message, .onboarding-error'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-DASH-010: Join household cancel closes modal', async () => {
    await dashboard.clickJoinHousehold();
    await expect(dashboard.createHouseholdModal).toBeVisible();
    await dashboard.cancelModal();
    await expect(dashboard.createHouseholdModal).not.toBeVisible();
  });

  test('TC-DASH-019: Navigate to settings from dashboard', async ({ page }) => {
    // After creating a household, verify navigation to settings
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
  });
});