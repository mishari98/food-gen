import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class HistoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get appTitle() {
    return this.page.locator('span.app-title');
  }

  get weekSelector() {
    return this.page.locator('.week-selector');
  }

  get weekLabel() {
    return this.page.locator('.week-label');
  }

  get prevWeekButton() {
    return this.page.locator('.week-selector button.icon-btn').first();
  }

  get nextWeekButton() {
    return this.page.locator('.week-selector button.icon-btn').last();
  }

  get thisWeekButton() {
    return this.page.locator('.week-selector button.small-btn');
  }

  get emptyState() {
    return this.page.locator('.empty-state');
  }

  get noHouseholdHeading() {
    return this.page.locator('.empty-state h3').filter({ hasText: 'No Household' });
  }

  get noPlansHeading() {
    return this.page.locator('.empty-state h3').filter({ hasText: 'No plans for this week' });
  }

  get goToMealPlansButton() {
    return this.page.locator('.empty-state button.primary-btn');
  }

  get historyList() {
    return this.page.locator('.history-list');
  }

  get historyCards() {
    return this.page.locator('.history-card');
  }

  get viewDayButtons() {
    return this.page.locator('button.small-btn').filter({ hasText: 'View' });
  }

  get regenerateButtons() {
    return this.page.locator('button.small-btn').filter({ hasText: /Regenerate/ });
  }

  async goto() {
    await this.page.goto(ROUTES.history);
  }

  async clickPrevWeek() {
    await this.prevWeekButton.click();
  }

  async clickNextWeek() {
    await this.nextWeekButton.click();
  }

  async clickThisWeek() {
    if (await this.thisWeekButton.isVisible()) {
      await this.thisWeekButton.click();
    }
  }

  async clickFirstViewButton() {
    await this.viewDayButtons.first().click();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.history);
  }

  async expectNoHouseholdState() {
    await expect(this.noHouseholdHeading).toBeVisible({ timeout: 10000 });
  }

  async expectNoPlansState() {
    await expect(this.noPlansHeading).toBeVisible({ timeout: 10000 });
  }

  async expectHistoryCardsVisible() {
    await expect(this.historyCards.first()).toBeVisible({ timeout: 10000 });
  }
}