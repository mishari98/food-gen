import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { ROUTES, TEST_USERS } from '../../fixtures/test-data';

test.describe('Login Flow (TC-AUTH-007 to TC-AUTH-010)', () => {
  let onboarding: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickLoginTab();
  });

  test.skip('TC-AUTH-007: Login with valid credentials — redirects to dashboard', async ({ page }) => {
    // First sign up a user
    const user = TEST_USERS.admin;
    await onboarding.clickSignUpTab();
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    // Go to settings and sign out
    await page.goto('/settings');
    const { SettingsPage } = await import('../../pages/SettingsPage');
    const settings = new SettingsPage(page);
    await settings.expectOnPage();
    // Override window.confirm to auto-accept
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    await settings.clickSignOut();
    await page.waitForURL('/', { timeout: 10000 });

    // Login with same credentials
    await onboarding.clickLoginTab();
    await onboarding.login(user.email, user.password);
    await onboarding.expectRedirectedToDashboard();
  });

  test('TC-AUTH-008: Login with wrong password shows error', async () => {
    await onboarding.login('existing@example.com', 'wrongpassword');
    // Firebase emulator returns "auth/wrong-password" or "auth/invalid-credential"
    await onboarding.expectErrorMessage(/wrong-password|invalid.*credential|invalid login|error/i);
  });

  test('TC-AUTH-009: Login with non-existent email shows error', async () => {
    await onboarding.login('nonexistent@example.com', 'password123');
    await onboarding.expectErrorMessage(/user-not-found|not found|no.*account/i);
  });

  test('TC-AUTH-010: Login with empty fields shows validation', async () => {
    await onboarding.submitButton.click();
    // Browser HTML5 validation should prevent submission
    await expect(onboarding.page).toHaveURL('http://localhost:5173/');
  });
});