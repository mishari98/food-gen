import { Page, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

export class OnboardingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading() {
    return this.page.locator('h1.onboarding-title');
  }

  get nameInput() {
    return this.page.locator('#displayName');
  }

  get emailInput() {
    return this.page.locator('#email');
  }

  get passwordInput() {
    return this.page.locator('#password');
  }

  get confirmPasswordInput() {
    return this.page.locator('#confirmPassword');
  }

  get submitButton() {
    return this.page.locator('button.onboarding-btn');
  }

  get signUpToggleButton() {
    return this.page.getByRole('button', { name: 'Sign Up' });
  }

  get loginToggleButton() {
    return this.page.getByRole('button', { name: 'Log In' });
  }

  get forgotPasswordLink() {
    return this.page.getByRole('button', { name: /Forgot Password/i });
  }

  get errorMessage() {
    return this.page.locator('.onboarding-error').first();
  }

  // Forgot password modal
  get forgotPasswordModal() {
    return this.page.locator('.modal-overlay');
  }

  get forgotPasswordEmailInput() {
    return this.page.locator('#resetEmail');
  }

  get sendResetLinkButton() {
    return this.page.getByRole('button', { name: /Send Reset Link/i });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  get successMessage() {
    return this.page.locator('.onboarding-error.success');
  }

  async goto() {
    await this.page.goto(ROUTES.onboarding);
  }

  async signUp(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }

  async signUpWithMismatchedPassword(name: string, email: string, password: string, confirmPassword: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async openForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async requestPasswordReset(email: string) {
    await this.openForgotPassword();
    await this.forgotPasswordEmailInput.fill(email);
    // Use JS click to bypass overlay interception
    await this.sendResetLinkButton.evaluate(el => (el as HTMLElement).click());
  }

  async clickSignUpTab() {
    await this.signUpToggleButton.click();
  }

  async clickLoginTab() {
    await this.loginToggleButton.click();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(ROUTES.onboarding);
  }

  async expectRedirectedToDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async expectErrorMessage(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message);
  }
}