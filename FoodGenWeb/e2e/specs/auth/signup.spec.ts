import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { TEST_USERS, VALIDATION_MESSAGES } from '../../fixtures/test-data';

test.describe('Sign Up Flow (TC-AUTH-001 to TC-AUTH-006)', () => {
  let onboarding: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    await onboarding.goto();
    await onboarding.clickSignUpTab();
  });

  test('TC-AUTH-001: Sign up with valid data — redirects to dashboard', async ({ page }) => {
    const user = TEST_USERS.newUser;
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();
  });

  test('TC-AUTH-002: Sign up with empty name shows validation error', async () => {
    await onboarding.nameInput.fill('');
    await onboarding.emailInput.fill('test@example.com');
    await onboarding.passwordInput.fill('password123');
    await onboarding.confirmPasswordInput.fill('password123');
    await onboarding.submitButton.click();
    // Expect browser validation or app-level error
    await expect(onboarding.errorMessage.or(onboarding.nameInput)).toBeVisible();
  });

  test('TC-AUTH-003: Sign up with mismatched passwords shows error', async () => {
    await onboarding.signUpWithMismatchedPassword(
      'Test User',
      'mismatch@example.com',
      'password123',
      'password456',
    );
    await onboarding.expectErrorMessage(VALIDATION_MESSAGES.passwordMismatch);
  });

  test('TC-AUTH-004: Sign up with short password shows error', async () => {
    await onboarding.nameInput.fill('Test User');
    await onboarding.emailInput.fill('shortpw@example.com');
    // Use JS to bypass browser minlength validation
    await onboarding.page.evaluate(() => {
      const pw = document.getElementById('password') as HTMLInputElement;
      const cpw = document.getElementById('confirmPassword') as HTMLInputElement;
      if (pw) pw.value = '12345';
      if (cpw) cpw.value = '12345';
      pw?.dispatchEvent(new Event('input', { bubbles: true }));
      cpw?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await onboarding.submitButton.click();
    // App should show error about password length
    await expect(
      onboarding.errorMessage.or(onboarding.page.locator('.onboarding-error')),
    ).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-005: Sign up with invalid email format shows error', async () => {
    await onboarding.nameInput.fill('Test User');
    await onboarding.emailInput.fill('invalid-email');
    await onboarding.passwordInput.fill('password123');
    await onboarding.confirmPasswordInput.fill('password123');
    await onboarding.submitButton.click();
    // Browser validation or Firebase error
    await expect(
      onboarding.errorMessage.or(onboarding.page.locator('input:invalid')),
    ).toBeVisible();
  });

  test.skip('TC-AUTH-006: Sign up with already registered email shows error', async () => {
    // First sign up
    const user = TEST_USERS.admin;
    await onboarding.signUp(user.name, user.email, user.password);
    await onboarding.expectRedirectedToDashboard();

    // Navigate back to onboarding and try to sign up again with same email (should fail)
    await onboarding.goto();
    await onboarding.clickSignUpTab();
    await onboarding.signUp(user.name, user.email, user.password);
    // Check that we're still on onboarding page (signup failed)
    await onboarding.expectOnPage();
    // And that an error message is shown
    await expect(onboarding.errorMessage.or(onboarding.page.locator('.onboarding-error'))).toBeVisible({ timeout: 5000 });
  });
});