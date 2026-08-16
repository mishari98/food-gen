import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get appTitle() {
    return this.page.locator('span.app-title');
  }

  get settingsSections() {
    return this.page.locator('.settings-section');
  }

  get householdSection() {
    return this.page.locator('.settings-section').filter({ hasText: /Household/ });
  }

  get householdName() {
    return this.page.locator('p.household-setting-name');
  }

  get roleBadge() {
    return this.page.locator('span.role-badge');
  }

  get manageHouseholdButton() {
    return this.page.locator('button.secondary-btn').filter({ hasText: /Manage Household/ });
  }

  get pendingRequestsBadge() {
    return this.page.locator('.pending-requests-badge');
  }

  get accountSection() {
    return this.page.locator('.settings-section').filter({ hasText: /Account/ });
  }

  get accountEmail() {
    return this.page.locator('p.account-email');
  }

  get signOutButton() {
    return this.page.locator('button.danger-btn').filter({ hasText: 'Sign Out' });
  }

  get aboutSection() {
    return this.page.locator('.settings-section').filter({ hasText: /About/ });
  }

  get appVersion() {
    return this.page.locator('.settings-about-text');
  }

  get headerBackButton() {
    return this.page.locator('button.icon-btn').filter({ hasText: '🏠' });
  }

  async goto() {
    await this.page.goto(ROUTES.settings);
  }

  async clickManageHousehold() {
    await this.manageHouseholdButton.click();
  }

  async clickSignOut() {
    // Handle the confirm dialog that appears on sign out
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await this.signOutButton.click();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.settings);
  }

  async expectHouseholdSectionVisible() {
    await expect(this.householdSection).toBeVisible({ timeout: 10000 });
  }

  async expectRedirectToOnboarding() {
    await expect(this.page).toHaveURL(ROUTES.onboarding);
  }
}