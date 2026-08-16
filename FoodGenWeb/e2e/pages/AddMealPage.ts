import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class AddMealPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get headerTitle() {
    return this.page.locator('.app-title').filter({ hasText: /Add Meal/i });
  }

  get backArrow() {
    return this.page.locator('button.icon-btn').first();
  }

  get saveButton() {
    return this.page.locator('button.save-btn');
  }

  // Form fields (page-level locators)
  get nameInput() {
    return this.page.locator('input').first();
  }

  get cuisineSelect() {
    return this.page.locator('.form-group').filter({ hasText: 'Cuisine' }).locator('select');
  }

  get prepTimeInput() {
    return this.page.locator('input[type="number"]').first();
  }

  get emojiInput() {
    return this.page.locator('input[placeholder*="🍽️"]');
  }

  get caloriesInput() {
    return this.page.locator('input[type="number"]').nth(1);
  }

  // Checkboxes
  get allCheckboxes() {
    return this.page.locator('input[type="checkbox"]');
  }

  get breakfastCheckbox() {
    return this.page.locator('input[type="checkbox"]').first();
  }

  get lunchCheckbox() {
    return this.page.locator('input[type="checkbox"]').nth(1);
  }

  get dinnerCheckbox() {
    return this.page.locator('input[type="checkbox"]').nth(2);
  }

  // Radio buttons
  get difficultyRadios() {
    return this.page.locator('input[type="radio"]');
  }

  // Ingredients (page-level - all elements on the page)
  get addIngredientButton() {
    return this.page.locator('button.add-row-btn').first();
  }

  get ingredientDynamicRows() {
    return this.page.locator('div.dynamic-row');
  }

  get ingredientNameInputs() {
    return this.page.locator('input[placeholder="Ingredient name"]');
  }

  get ingredientQtyInputs() {
    return this.page.locator('input[placeholder="Qty"]');
  }

  get removeButtons() {
    return this.page.locator('button.remove-btn');
  }

  // Steps
  get addStepButton() {
    return this.page.locator('button.add-row-btn').last();
  }

  get stepTextareas() {
    return this.page.locator('textarea');
  }

  // Bottom save button
  get bottomSaveButton() {
    return this.page.locator('button.primary-btn').filter({ hasText: /Save Meal/i });
  }

  async goto() {
    await this.page.goto(ROUTES.addMeal);
  }

  async fillBasicInfo(name: string, cuisine: string = 'Filipino', prepTime: string = '30', emoji: string = '🍽️') {
    // Wait for page to be fully loaded before interacting
    await this.page.waitForTimeout(1000);
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nameInput.fill(name, { force: true });
    if (cuisine) {
      await this.cuisineSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.cuisineSelect.selectOption(cuisine);
    }
    if (prepTime) {
      await this.prepTimeInput.fill(prepTime, { force: true });
    }
    if (emoji) {
      await this.emojiInput.fill(emoji, { force: true });
    }
  }

  async addIngredient(name: string, quantity: string) {
    await this.addIngredientButton.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.ingredientNameInputs.last().fill(name, { force: true });
    await this.ingredientQtyInputs.last().fill(quantity, { force: true });
  }

  async addStep(text: string) {
    await this.addStepButton.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.stepTextareas.last().fill(text, { force: true });
  }

  async clickSave() {
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await this.saveButton.click({ force: true });
  }

  async clearAllCheckboxes() {
    const count = await this.allCheckboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = this.allCheckboxes.nth(i);
      if (await cb.isChecked()) {
        await cb.evaluate(el => (el as HTMLInputElement).click());
        await this.page.waitForTimeout(300);
      }
    }
  }

  // Assertions
  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.addMeal);
  }

  async expectRedirectToDay() {
    await expect(this.page).toHaveURL(/\/day/);
  }
}