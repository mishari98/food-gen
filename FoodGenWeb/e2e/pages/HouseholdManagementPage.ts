import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class HouseholdManagementPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get headerTitle() {
    return this.page.locator('span.app-title');
  }

  get backArrow() {
    return this.page.locator('button.icon-btn').filter({ hasText: '←' });
  }

  get accessDeniedMessage() {
    return this.page.locator('.content-area').getByText(/Only admins can manage household/i);
  }

  // Household info section (first settings-section on the page)
  get householdSection() {
    return this.page.locator('.settings-section').first();
  }

  get householdName() {
    return this.householdSection.locator('h3');
  }

  get inviteCode() {
    return this.householdSection.getByText(/Invite Code:/i);
  }

  // Members section
  get membersSection() {
    return this.page.locator('.settings-section').filter({ hasText: /Members/ });
  }

  get memberRows() {
    return this.page.locator('.member-row');
  }

  get roleBadges() {
    return this.page.locator('.member-row .role-badge');
  }

  // Pending requests only render when there is at least one request
  get pendingRequestsSection() {
    return this.page.locator('.settings-section').filter({ hasText: /Pending Requests/i });
  }

  get acceptRequestButton() {
    return this.pendingRequestsSection.locator('button.accept-button').first();
  }

  get rejectRequestButton() {
    return this.pendingRequestsSection.locator('button.reject-button').first();
  }

  // Invite form
  get inviteEmailInput() {
    return this.page.locator('#inviteEmail');
  }

  get inviteRoleSelect() {
    return this.page.locator('#inviteRole');
  }

  get sendInviteButton() {
    return this.page.getByRole('button', { name: /Send Invite/i });
  }

  get regenerateInviteCodeButton() {
    return this.page.locator('button.secondary-btn').filter({ hasText: /Regenerate Invite Code/i });
  }

  get leaveHouseholdButton() {
    return this.page.locator('button.danger-btn').filter({ hasText: /Leave Household/i });
  }

  // Actions
  async goto() {
    await this.page.goto(ROUTES.householdManage);
  }

  async sendInvite(email: string, role: string = 'editor') {
    await this.inviteEmailInput.fill(email);
    await this.inviteRoleSelect.selectOption(role);
    await this.sendInviteButton.click();
  }

  async acceptFirstRequest() {
    await this.acceptRequestButton.click();
  }

  async rejectFirstRequest() {
    await this.rejectRequestButton.click();
  }

  // Assertions
  async expectOnPage() {
    await expect(this.page).toHaveURL(/household\/manage/);
  }

  async expectAccessDenied() {
    await expect(this.accessDeniedMessage).toBeVisible({ timeout: 10000 });
  }

  async expectMembersVisible() {
    await expect(this.memberRows.first()).toBeVisible({ timeout: 10000 });
  }
}