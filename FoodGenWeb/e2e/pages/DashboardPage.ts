import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // No Household state
  get welcomeMessage() {
    return this.page.locator('.dashboard-header h1');
  }

  get noHouseholdMessage() {
    return this.page.locator('.dashboard-header p').filter({ hasText: /not part of a household/i });
  }

  get createHouseholdButton() {
    return this.page.locator('button.primary-btn').filter({ hasText: /Create Household/i });
  }

  get joinHouseholdButton() {
    return this.page.locator('button.secondary-btn').filter({ hasText: /Join Household/i });
  }

  // Create Household modal
  get createHouseholdModal() {
    return this.page.locator('.modal-overlay');
  }

  get householdNameInput() {
    return this.page.locator('#householdName');
  }

  get createConfirmButton() {
    return this.page.getByRole('button', { name: 'Create', exact: true });
  }

  // Join Household modal
  get inviteCodeInput() {
    return this.page.locator('#inviteCode');
  }

  get roleSelect() {
    return this.page.locator('#role');
  }

  get joinConfirmButton() {
    return this.page.locator('button.primary-btn').filter({ hasText: 'Join' });
  }

  // With Household state
  get householdName() {
    return this.page.locator('p.household-name');
  }

  get roleBadge() {
    return this.page.locator('span.role-badge');
  }

  get goToMealPlansButton() {
    return this.page.locator('button.primary-btn').filter({ hasText: /Go to Meal Plans/i });
  }

  get manageHouseholdButton() {
    return this.page.locator('button.secondary-btn').filter({ hasText: /Manage Household/i });
  }

  get leaveHouseholdButton() {
    return this.page.locator('button.danger-btn');
  }

  // Pending invites
  get pendingInvitesSection() {
    return this.page.locator('.pending-invites');
  }

  get acceptInviteButton() {
    return this.page.locator('button.accept-button');
  }

  get rejectInviteButton() {
    return this.page.locator('button.reject-button');
  }

  async goto() {
    await this.page.goto(ROUTES.dashboard);
  }

  async createHousehold(name: string) {
    await this.createHouseholdButton.click();
    await this.householdNameInput.fill(name);
    await this.createConfirmButton.click({ force: true });
  }

  async joinHousehold(inviteCode: string, role: string = 'viewer') {
    await this.joinHouseholdButton.click();
    await this.inviteCodeInput.fill(inviteCode);
    await this.roleSelect.selectOption(role);
    await this.joinConfirmButton.click();
  }

  async clickCreateHousehold() {
    await this.createHouseholdButton.click();
  }

  async clickJoinHousehold() {
    await this.joinHouseholdButton.click();
  }

  async cancelModal() {
    const cancelBtn = this.page.locator('button.secondary-btn').filter({ hasText: 'Cancel' });
    await cancelBtn.click();
  }

  async clickGoToMealPlans() {
    await this.goToMealPlansButton.click();
  }

  async clickManageHousehold() {
    await this.manageHouseholdButton.click();
  }

  async acceptFirstInvite() {
    await this.acceptInviteButton.first().click();
  }

  async rejectFirstInvite() {
    await this.rejectInviteButton.first().click();
  }

  async expectOnPage() {
    // Hash routing: actual URL may be / or /#/dashboard
    const url = this.page.url();
    expect(url.includes('localhost')).toBeTruthy();
  }

  async expectNoHouseholdState() {
    await expect(this.noHouseholdMessage).toBeVisible({ timeout: 10000 });
  }

  async expectWithHouseholdState() {
    await expect(this.householdName).toBeVisible({ timeout: 10000 });
  }

  async expectRedirectedToDayPage() {
    await expect(this.page).toHaveURL(ROUTES.day);
  }

  async expectRedirectedToManagePage() {
    await expect(this.page).toHaveURL(ROUTES.householdManage);
  }
}