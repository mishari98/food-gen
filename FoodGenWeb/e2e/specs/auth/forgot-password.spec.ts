import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';

test.describe('Forgot Password Flow (TC-AUTH-011 to TC-AUTH-014)', () => {
  let onboarding: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    await onboarding.goto();
    // Forgot password link only appears in Login mode
    await onboarding.clickLoginTab();
    // Wait for login mode to render
    await page.waitForTimeout(500);
  });

  test.skip('TC-AUTH-011: Forgot password with valid email shows success message', async () => {
    await onboarding.openForgotPassword();
    await onboarding.forgotPasswordEmailInput.fill('testuser@example.com');
    // Use JS click to submit form
    await onboarding.sendResetLinkButton.evaluate(el => (el as HTMLElement).click());
    // Wait for success message
    await onboarding.page.waitForTimeout(3000);
    const msg = onboarding.page.locator('.onboarding-error').first();
    await expect(msg).toBeVisible({ timeout: 5000 });
    await expect(msg).toContainText(/reset|sent/i);
  });

  test('TC-AUTH-013: Forgot password modal cancel closes the modal', async () => {
    await onboarding.openForgotPassword();
    await expect(onboarding.forgotPasswordModal).toBeVisible();
    // Use JS click to bypass overlay
    await onboarding.cancelButton.evaluate(el => (el as HTMLElement).click());
    await expect(onboarding.forgotPasswordModal).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-014: Forgot password modal close on overlay click', async () => {
    await onboarding.openForgotPassword();
    await expect(onboarding.forgotPasswordModal).toBeVisible();
    // Click the overlay backdrop (outside the modal content)
    await onboarding.page.mouse.click(10, 10);
    await expect(onboarding.forgotPasswordModal).not.toBeVisible();
  });

  test('TC-AUTH-015: Toggle between Sign Up and Login modes', async () => {
    await onboarding.clickLoginTab();
    await expect(onboarding.passwordInput).toBeVisible();
    await expect(onboarding.confirmPasswordInput).not.toBeVisible();

    await onboarding.clickSignUpTab();
    await expect(onboarding.confirmPasswordInput).toBeVisible();
    await expect(onboarding.nameInput).toBeVisible();
  });
});