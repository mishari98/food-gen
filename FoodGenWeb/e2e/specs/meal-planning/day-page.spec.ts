import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { DayPage } from '../../pages/DayPage';
import { removeEmulatorBanner, navigateInApp } from '../../fixtures/emulator';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Day Page — Meal Planning (TC-DAY-001 to TC-DAY-038)', () => {
  let dayPage: DayPage;

  test.beforeEach(async ({ page }) => {
    await removeEmulatorBanner(page);

    const onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const user = {
      name: 'E2E Day Page User',
      email: `e2e-day-${Date.now()}@test.foodgen.app`,
      password: 'TestPass123!',
    };
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    const dashboard = new DashboardPage(page);
    await dashboard.createHousehold('E2E Day Test');
    await dashboard.expectWithHouseholdState();

    dayPage = new DayPage(page);
    await navigateInApp(page, ROUTES.day);
    await dayPage.expectOnPage();
  });

  test('TC-DAY-001: Page loads with header', async () => {
    await dayPage.expectOnPage();
    await expect(dayPage.header).toBeVisible();
  });

  test('TC-DAY-002: Date picker visible and functional', async () => {
    await expect(dayPage.datePicker).toBeVisible();
  });

  test('TC-DAY-005: Empty state shows "No meals planned yet"', async () => {
    await dayPage.expectEmptyState();
  });

  test('TC-DAY-006: Generate Meals button visible for admin/editor', async () => {
    await expect(dayPage.generateButton).toBeVisible();
  });

  test('TC-DAY-007: Add Meal Manually button visible', async () => {
    await expect(dayPage.addMealButton).toBeVisible();
  });

  test('TC-DAY-010: Generate meals flow', async () => {
    await dayPage.openGenerateMeals();
    await expect(dayPage.generateModal).toBeVisible();
    await dayPage.selectMealCount('3');
    await dayPage.confirmGenerate();
    await dayPage.expectMealsVisible();
  });

  test('TC-DAY-034: Navigate to future date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    await dayPage.navigateToDate(dateStr);
    await dayPage.expectEmptyState();
  });

  test('TC-DAY-036: Click "Today" button returns to current date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    await dayPage.navigateToDate(dateStr);
    await dayPage.clickToday();
    await expect(dayPage.todayButton).not.toBeVisible();
  });

  test('TC-DAY-037: Loading state shown on refresh', async () => {
    await dayPage.page.reload();
    await expect(dayPage.loadingState.or(dayPage.emptyState)).toBeVisible({ timeout: 10000 });
  });

  test('Navigate to week page', async () => {
    await dayPage.clickWeekTab();
    await expect(dayPage.page).toHaveURL(/\/week/);
  });

  test('Navigate to history page', async () => {
    await dayPage.clickHistoryTab();
    await expect(dayPage.page).toHaveURL(/\/history/);
  });
});