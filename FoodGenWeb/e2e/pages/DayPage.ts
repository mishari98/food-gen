import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class DayPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get header() {
    return this.page.locator('div.header');
  }

  get appTitle() {
    return this.page.locator('span.app-title');
  }

  get homeIcon() {
    return this.page.locator('button.icon-btn').filter({ hasText: '🏠' });
  }

  get settingsIcon() {
    return this.page.locator('button.icon-btn').filter({ hasText: '⚙️' });
  }

  get datePicker() {
    return this.page.locator('input.date-input');
  }

  get todayButton() {
    return this.page.locator('button.small-btn').filter({ hasText: /Today/i });
  }

  get loadingState() {
    return this.page.locator('.loading-state');
  }

  get emptyState() {
    return this.page.locator('.empty-state');
  }

  get emptyStateMessage() {
    return this.page.locator('.empty-state p, .empty-state .empty-message').filter({ hasText: /No meals planned/i });
  }

  get generateButton() {
    return this.page.locator('button').filter({ hasText: /Generate Meals/ });
  }

  get regenerateButton() {
    return this.page.locator('button.refresh-btn');
  }

  get addMealButton() {
    return this.page.locator('button.add-meal-btn');
  }

  get generateModal() {
    return this.page.locator('.modal-overlay');
  }

  get generateModalHeading() {
    return this.page.locator('.modal h2');
  }

  get mealCountButtons() {
    return this.page.locator('.meal-count-btn, .meals-per-day-picker button');
  }

  get generateConfirmButton() {
    return this.page.locator('.modal button.primary-btn').filter({ hasText: /Generate/ });
  }

  get cancelButton() {
    return this.page.locator('.modal button.secondary-btn').filter({ hasText: 'Cancel' });
  }

  get mealCards() {
    return this.page.locator('.meal-card-wrapper');
  }

  get mealCardElements() {
    return this.page.locator('.meal-card');
  }

  get suggestionsBanner() {
    return this.page.locator('.suggestions-banner');
  }

  get acceptSuggestionButton() {
    return this.page.locator('button.accept-button');
  }

  get rejectSuggestionButton() {
    return this.page.locator('button.reject-button');
  }

  get mealPickerModal() {
    return this.page.locator('.modal-overlay');
  }

  get searchInput() {
    return this.page.locator('input.search-input');
  }

  get mealPickerItems() {
    return this.page.locator('button.meal-picker-item');
  }

  get globalError() {
    return this.page.locator('.global-error');
  }

  get dateText() {
    return this.page.locator('p.date-text');
  }

  async goto() {
    await this.page.goto(ROUTES.day);
  }

  async navigateToDate(dateString: string) {
    await this.datePicker.fill(dateString);
    await this.datePicker.press('Enter');
  }

  async clickToday() {
    await this.todayButton.click();
  }

  async openGenerateMeals() {
    await this.generateButton.click();
  }

  async clickRegenerate() {
    await this.regenerateButton.click();
  }

  async confirmGenerate() {
    await this.generateConfirmButton.click();
  }

  async selectMealCount(count: string) {
    await this.page.locator('button').filter({ hasText: ` ${count} ` }).first().click();
  }

  async clickFirstMealCard() {
    await this.mealCardElements.first().click();
  }

  async addMealManually() {
    await this.addMealButton.click();
  }

  async clickWeekTab() {
    await this.page.goto(ROUTES.week);
  }

  async clickHistoryTab() {
    await this.page.goto(ROUTES.history);
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.day);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  async expectMealsVisible() {
    await expect(this.mealCards.first()).toBeVisible({ timeout: 15000 });
  }

  async expectLoadingState() {
    await expect(this.loadingState).toBeVisible({ timeout: 5000 });
  }
}