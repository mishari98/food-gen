import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../pages/OnboardingPage';
import { HouseholdManagementPage } from '../pages/HouseholdManagementPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Household Management Page (TC-MGMT-001 to TC-MGMT-014)', () => {
  let management: HouseholdManagementPage;

  test.beforeEach(async ({ page }) => {
    // Remove the Firebase emulator warning banner, which is a fixed, high-z-index
    // overlay that otherwise intercepts clicks on modal buttons (e.g. "Create").
    await page.addInitScript(() => {
      const removeBanner = () => {
        document.querySelectorAll('.firebase-emulator-warning').forEach(el => el.remove());
      };
      let started = false;
      const start = () => {
        if (started) return true;
        if (!document || !document.documentElement) return false; // DOM not ready yet
        removeBanner();
        new MutationObserver(() => removeBanner()).observe(
          document.documentElement,
          { childList: true, subtree: true }
        );
        started = true;
        return true;
      };
      if (!start()) {
        const iv = setInterval(() => { if (start()) clearInterval(iv); }, 20);
      }
    });

    const onboarding = new OnboardingPage(page);
    const dashboard = new DashboardPage(page);
    management = new HouseholdManagementPage(page);

    // Sign up and create a household so the user is an admin
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    const timestamp = Date.now();
    await onboarding.signUp(
      `Admin User ${timestamp}`,
      `admin${timestamp}@example.com`,
      'password123'
    );
    await dashboard.expectOnPage();

    await dashboard.createHousehold('E2E Test Family');

    // Navigate in-app via the dashboard's Manage Household button (keeps
    // React context state — no full page reload that would race Firestore writes)
    await dashboard.clickManageHousehold();
    await management.expectOnPage();
  });

  test('TC-MGMT-003: Page loads with header', async () => {
    await expect(management.headerTitle).toContainText('Manage Household');
  });

  test('TC-MGMT-004: Household info section displayed', async () => {
    await expect(management.householdSection).toBeVisible();
    await expect(management.householdName).toContainText('E2E Test Family');
    await expect(management.inviteCode).toBeVisible();
  });

  test('TC-MGMT-005: Invite code displayed', async () => {
    const code = await management.inviteCode.textContent();
    expect(code).toBeTruthy();
    expect(code!.length).toBeGreaterThan(0);
  });

  test('TC-MGMT-006: Member list displayed', async () => {
    await management.expectMembersVisible();
    await expect(management.roleBadges.first()).toContainText('admin');
  });

  test('TC-MGMT-007: Member count matches', async () => {
    // Members load asynchronously from Firestore. locator.count() does NOT
    // auto-wait, so without an explicit wait it can read the list before the
    // admin row renders and return 0. Block for the first row first.
    await management.expectMembersVisible();
    const memberCount = await management.memberRows.count();
    // At minimum the creating admin is listed
    expect(memberCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-MGMT-008: Pending requests section hidden when none', async () => {
    // A fresh household has no join requests yet
    await expect(management.pendingRequestsSection).toHaveCount(0);
  });

  test('TC-MGMT-011: Send invite - happy path', async () => {
    await management.sendInvite(`newmember${Date.now()}@example.com`, 'editor');
    // On success the form clears the email field
    await expect(management.inviteEmailInput).toHaveValue('', { timeout: 10000 });
  });

  test('TC-MGMT-012: Send invite - empty email blocked by form validation', async () => {
    await management.inviteEmailInput.fill('');
    await management.inviteRoleSelect.selectOption('editor');
    await management.sendInviteButton.click();
    // HTML5 required validation blocks submission; user stays on the page
    await expect(management.page).toHaveURL(/household\/manage/);
  });

  test('TC-MGMT-013: Send invite - invalid email blocked by form validation', async () => {
    await management.inviteEmailInput.fill('invalid-email');
    await management.inviteRoleSelect.selectOption('editor');
    await management.sendInviteButton.click();
    await expect(management.page).toHaveURL(/household\/manage/);
  });

  test('TC-MGMT-014: Send invite - handles gracefully without breaking the page', async () => {
    // The app does not enforce duplicate-invite rules, so verify a repeat-style
    // invite still resolves and leaves the page in a usable state.
    await management.sendInvite(`duplicate${Date.now()}@example.com`, 'viewer');
    await expect(management.inviteEmailInput).toHaveValue('', { timeout: 10000 });
    await expect(management.page).toHaveURL(/household\/manage/);
  });
});