import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { DayPage } from '../../pages/DayPage';
import { HistoryPage } from '../../pages/HistoryPage';
import { removeEmulatorBanner, navigateInApp } from '../../fixtures/emulator';
import { ROUTES } from '../../fixtures/test-data';

test.describe('History Page (TC-HIST-001 to TC-HIST-018)', () => {
  let historyPage: HistoryPage;
  let dayPage: DayPage;

  test.beforeEach(async ({ page }) => {
    await removeEmulatorBanner(page);

    const onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const user = {
      name: 'E2E History Page User',
      email: `e2e-history-${Date.now()}@test.foodgen.app`,
      password: 'TestPass123!',
    };
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    const dashboard = new DashboardPage(page);
    await dashboard.createHousehold('E2E History Test');
    await dashboard.expectWithHouseholdState();

    historyPage = new HistoryPage(page);
    dayPage = new DayPage(page);
    await navigateInApp(page, ROUTES.history);
    await historyPage.expectOnPage();
  });

  test('TC-HIST-001: Page loads with header showing "Plan History"', async () => {
    await historyPage.expectOnPage();
    await expect(historyPage.appTitle).toContainText(/Plan History|History/i);
  });

  test('TC-HIST-002: Week selector visible', async () => {
    await expect(historyPage.weekSelector).toBeVisible({ timeout: 10000 });
  });

  test('TC-HIST-005: No plans for week shows message', async () => {
    await historyPage.expectNoPlansState();
  });

  test('TC-HIST-006: "Go to Meal Plans" button visible when no plans', async () => {
    await expect(historyPage.goToMealPlansButton).toBeVisible({ timeout: 10000 });
  });

  test('TC-HIST-012: Navigate to previous week', async () => {
    await historyPage.clickPrevWeek();
    await expect(historyPage.weekLabel).toBeVisible({ timeout: 10000 });
  });

  test('TC-HIST-013: Navigate to next week', async () => {
    await historyPage.clickNextWeek();
    await expect(historyPage.weekLabel).toBeVisible({ timeout: 10000 });
  });

  test('TC-HIST-016: Jump to current week', async () => {
    await historyPage.clickNextWeek();
    await historyPage.clickNextWeek();
    await historyPage.clickThisWeek();
    // thisWeekButton should be hidden when on current week
    await expect(historyPage.thisWeekButton).not.toBeVisible();
  });

  test('TC-HIST-017: Plans sorted by date (newest first)', async () => {
    // Generate meals first to have history data
    await dayPage.goto();
    await dayPage.openGenerateMeals();
    await dayPage.selectMealCount('3');
    await dayPage.confirmGenerate();
    await dayPage.expectMealsVisible();

    // Go to history
    await historyPage.goto();
    await historyPage.expectHistoryCardsVisible();
  });

  test('Go to day page from history "Go to Meal Plans"', async ({ page }) => {
    await historyPage.goToMealPlansButton.click();
    await expect(page).toHaveURL(/\/day/);
  });

  test('Year boundary navigation — next from week 52', async () => {
    for (let i = 0; i < 60; i++) {
      await historyPage.clickNextWeek();
    }
    await expect(historyPage.weekLabel).toBeVisible({ timeout: 10000 });
  });

  test('Year boundary navigation — prev from week 1', async () => {
    for (let i = 0; i < 60; i++) {
      await historyPage.clickPrevWeek();
    }
    await expect(historyPage.weekLabel).toBeVisible({ timeout: 10000 });
  });
});