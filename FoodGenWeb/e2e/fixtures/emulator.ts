import { Page } from '@playwright/test';

/**
 * Removes the Firebase emulator warning banner — a fixed, high-z-index overlay
 * that otherwise intercepts clicks on modal buttons (e.g. "Create Household" /
 * "Save"), silently preventing the action from firing.
 *
 * Uses addInitScript so it runs at document load (before the auth SDK injects
 * the banner), and a MutationObserver removes it if it is added later.
 */
export async function removeEmulatorBanner(page: Page): Promise<void> {
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
}

/**
 * Navigates to an app route by changing the URL hash in-place. This avoids a
 * full page reload that races Firebase auth restore — which momentarily renders
 * OnboardingPage and its redirect bounces the app back to /dashboard.
 *
 * @param route an app route, e.g. '/#/day', '/#/settings'
 */
export async function navigateInApp(page: Page, route: string): Promise<void> {
  const hash = '#' + route.replace(/^\/#/, '');
  await page.evaluate((h) => { window.location.hash = h; }, hash);
}