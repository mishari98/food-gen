import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class WeekPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get appTitle() {
    return this.page.locator('span.app-title');
  }

  get weekPicker() {
    return this.page.locator('input.date-input');
  }

  get thisWeekButton() {
    return this.page.locator('button.small-btn').filter({ hasText: /This Week/i });
  }

  get loadingState() {
    return this.page.locator('.loading-state');
  }

  get emptyState() {
    return this.page.locator('.empty-state');
  }

  get emptyStateMessage() {
    return this.page.locator('.empty-state p').filter({ hasText: /No weekly plan/i });
  }

  get generateWeekButton() {
    return this.page.locator('button').filter({ hasText: /Generate Weekly Plan|Generate This Week/i });
  }

  get generateModal() {
    return this.page.locator('.modal-overlay');
  }

  get generateWeekConfirmButton() {
    return this.page.locator('.modal button.primary-btn').filter({ hasText: 'Generate Week' });
  }

  get cancelButton() {
    return this.page.locator('.modal button.secondary-btn').filter({ hasText: 'Cancel' });
  }

  get dayRows() {
    return this.page.locator('.day-row');
  }

  get dayRowHeaders() {
    return this.page.locator('.day-row-header');
  }

  get dayRowContent() {
    return this.page.locator('.day-row-content');
  }

  get mealCardWrappers() {
    return this.page.locator('.meal-card-wrapper');
  }

  get regenerateDayButton() {
    return this.page.locator('button.small-btn').filter({ hasText: /Regenerate/ });
  }

  get addMealDayButton() {
    return this.page.locator('button.small-btn').filter({ hasText: /Add Meal/ });
  }

  get jumpToThisWeekButton() {
    return this.page.locator('button.small-btn').filter({ hasText: /Jump to This Week/i });
  }

    async goto() {
    // In-place hash navigation — a full reload races Firebase auth restore
    await this.page.evaluate(() => { window.location.hash = '#/week'; });
  }

  async clickPrevWeek() {
    // Navigate backward via datepicker — set to 7 days before
    const currentVal = await this.weekPicker.inputValue();
    if (currentVal) {
      const d = new Date(currentVal);
      d.setDate(d.getDate() - 7);
      await this.weekPicker.fill(d.toISOString().split('T')[0]);
      await this.weekPicker.press('Enter');
    }
  }

  async clickNextWeek() {
    const currentVal = await this.weekPicker.inputValue();
    if (currentVal) {
      const d = new Date(currentVal);
      d.setDate(d.getDate() + 7);
      await this.weekPicker.fill(d.toISOString().split('T')[0]);
      await this.weekPicker.press('Enter');
    }
  }

  async clickThisWeek() {
    if (await this.thisWeekButton.isVisible()) {
      await this.thisWeekButton.click();
    } else {
      await this.jumpToThisWeekButton.click();
    }
  }

  async openGenerateWeek() {
    await this.generateWeekButton.click();
  }

  async confirmGenerateWeek() {
    await this.generateWeekConfirmButton.click();
  }

  async expandDay(index: number = 0) {
    await this.dayRowHeaders.nth(index).click();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.week);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  async expectDayRowsVisible() {
    await expect(this.dayRows.first()).toBeVisible({ timeout: 15000 });
  }

  async expectDayExpanded() {
    await expect(this.dayRowContent.first()).toBeVisible({ timeout: 5000 });
  }
}