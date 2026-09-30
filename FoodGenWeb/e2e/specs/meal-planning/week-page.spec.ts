import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { WeekPage } from '../../pages/WeekPage';
import { removeEmulatorBanner, navigateInApp } from '../../fixtures/emulator';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Week Page (TC-WEEK-001 to TC-WEEK-022)', () => {
  let weekPage: WeekPage;

  test.beforeEach(async ({ page }) => {
    await removeEmulatorBanner(page);

    const onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const user = {
      name: 'E2E Week Page User',
      email: `e2e-week-${Date.now()}@test.foodgen.app`,
      password: 'TestPass123!',
    };
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    const dashboard = new DashboardPage(page);
    await dashboard.createHousehold('E2E Week Test');
    await dashboard.expectWithHouseholdState();

    weekPage = new WeekPage(page);
    await navigateInApp(page, ROUTES.week);
    await weekPage.expectOnPage();
  });

  test('TC-WEEK-001: Page loads with header showing "Week"', async () => {
    await weekPage.expectOnPage();
    await expect(weekPage.appTitle).toContainText(/Week/);
  });

  test('TC-WEEK-002: Week picker visible', async () => {
    await expect(weekPage.weekPicker).toBeVisible();
  });

  test('TC-WEEK-004: Empty state shows "No weekly plan yet"', async () => {
    await weekPage.expectEmptyState();
  });

  test('TC-WEEK-005: Generate Weekly Plan button visible for admin/editor', async () => {
    await expect(weekPage.generateWeekButton).toBeVisible();
  });

  test('TC-WEEK-007: Generate week flow — opens modal', async () => {
    await weekPage.openGenerateWeek();
    await expect(weekPage.generateModal).toBeVisible();
    await weekPage.confirmGenerateWeek();
    await weekPage.expectDayRowsVisible();
  });

  test('TC-WEEK-009: Expand day row shows meals', async () => {
    await weekPage.openGenerateWeek();
    await weekPage.confirmGenerateWeek();
    await weekPage.expectDayRowsVisible();
    await weekPage.expandDay(0);
    await weekPage.expectDayExpanded();
  });

  test('TC-WEEK-011: Multiple days can be expanded', async () => {
    await weekPage.openGenerateWeek();
    await weekPage.confirmGenerateWeek();
    await weekPage.expectDayRowsVisible();

    await weekPage.expandDay(0);
    await weekPage.expandDay(1);
    await expect(weekPage.mealCardWrappers).toBeVisible({ timeout: 5000 });
  });

  test('TC-WEEK-017: Navigate to previous week', async () => {
    await weekPage.clickPrevWeek();
    await expect(weekPage.weekPicker).toBeVisible();
  });

  test('TC-WEEK-018: Navigate to next week', async () => {
    await weekPage.clickNextWeek();
    await expect(weekPage.weekPicker).toBeVisible();
  });

  test('TC-WEEK-019: Jump to current week', async () => {
    await weekPage.clickNextWeek();
    await weekPage.clickNextWeek();
    await weekPage.clickThisWeek();
    await expect(weekPage.thisWeekButton.or(weekPage.jumpToThisWeekButton)).not.toBeVisible();
  });

  test('TC-WEEK-021: View meal details from week view', async () => {
    await weekPage.openGenerateWeek();
    await weekPage.confirmGenerateWeek();
    await weekPage.expectDayRowsVisible();

    await weekPage.expandDay(0);
    await expect(weekPage.mealCardWrappers.first()).toBeVisible({ timeout: 5000 });
  });

  test('Navigate to day page and back', async ({ page }) => {
    await page.evaluate(() => { window.location.hash = '#/day'; });
    await expect(page).toHaveURL(/\/day/);
    await weekPage.goto();
    await weekPage.expectOnPage();
  });
});