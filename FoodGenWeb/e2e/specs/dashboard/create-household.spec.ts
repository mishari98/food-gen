import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { DashboardPage } from '../../pages/DashboardPage';

const TEST_HOUSEHOLD = { name: 'E2E Test Family' };

test.describe('Create Household Flow (TC-DASH-001 to TC-DASH-006)', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    const onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const user = {
      name: 'E2E Create Household User',
      email: `e2e-create-hh-${Date.now()}@test.foodgen.app`,
      password: 'TestPass123!',
    };
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    dashboard = new DashboardPage(page);
  });

  test('TC-DASH-001: Dashboard shows welcome message', async () => {
    await expect(dashboard.welcomeMessage).toBeVisible({ timeout: 10000 });
  });

  test('TC-DASH-002: Shows "Not part of a household" message', async () => {
    await dashboard.expectNoHouseholdState();
  });

  test('TC-DASH-003: Create and Join buttons visible', async () => {
    await expect(dashboard.createHouseholdButton).toBeVisible();
    await expect(dashboard.joinHouseholdButton).toBeVisible();
  });

  test('TC-DASH-004: Create household redirects', async () => {
    await dashboard.createHousehold(TEST_HOUSEHOLD.name);
    await dashboard.expectWithHouseholdState();
  });

  test('TC-DASH-006: Create household cancel closes modal', async () => {
    await dashboard.clickCreateHousehold();
    await expect(dashboard.createHouseholdModal).toBeVisible();
    await dashboard.cancelModal();
    await expect(dashboard.createHouseholdModal).not.toBeVisible();
  });
});