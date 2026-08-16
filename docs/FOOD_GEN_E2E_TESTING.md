# FoodGenWeb — Playwright E2E Testing

> **Framework:** Playwright
> **Location:** `FoodGenWeb/e2e/`
> **Status:** Frame done; Auth/Dashboard/Day/Week/History written; Add Meal, Settings, Household Management written & validated (Firebase emulator). **485 tests, 11 spec files, 5 browser projects.**
> **Note:** Tests require Firebase connectivity to execute fully. See [Prerequisites](#prerequisites) below.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Running Tests](#running-tests)
4. [Project Structure](#project-structure)
5. [Page Object Models](#page-object-models)
6. [Test Specs](#test-specs)
7. [Implementation Roadmap](#implementation-roadmap)
8. [CI Integration](#ci-integration)

---

## Overview

Playwright is used for end-to-end testing of FoodGenWeb. It provides:

| Feature | Benefit |
|---------|---------|
| **Cross-browser** | Chromium, Firefox, WebKit — all tested |
| **Mobile emulation** | Pixel 7, iPhone 14 Pro viewports |
| **Network mocking** | Intercept Firebase API calls |
| **Auto-waiting** | No arbitrary `sleep()` calls |
| **Traces & Videos** | Debug failures with full context |
| **Page Object Model** | Clean, maintainable test code |

### Why Playwright over Cypress?

| Factor | Playwright | Cypress |
|--------|-----------|---------|
| Browser support | Chromium, Firefox, WebKit ✅ | Chromium-only ❌ |
| Vite ecosystem | Shares tooling with Vitest ✅ | Separate ecosystem |
| Multi-tab/window | Supported ✅ | Not supported ❌ |
| Firebase compatibility | API route interception ✅ | Single-origin restriction |
| Mobile emulation | Built-in device presets ✅ | Limited |

---

## Getting Started

### Prerequisites

- Node.js 18+
- `FoodGenWeb/` dependencies installed (`npm install`)
- Dev server running (`npm run dev`)
- **Firebase**: The app uses Firebase Authentication and Firestore. For tests to fully pass:
  - **Option A: Real Firebase** — The app connects to the production Firebase project by default. Tests will make real API calls.
  - **Option B: Firebase Emulator** — Run the Firebase Emulator Suite locally for isolated test data:
    ```bash
    npx firebase emulators:start --only auth,firestore
    ```
  - **Option C: Mock Firebase** — Not yet implemented; would require adding Firebase mocking in `global-setup.ts`

### Installation

Playwright is already installed as a dev dependency:

```bash
cd FoodGenWeb
npm install -D @playwright/test   # Already done
npx playwright install --with-deps chromium firefox webkit  # Already done
```

---

## Running Tests

### Quick Start (Production Firebase)

```bash
# Terminal 1: Start the dev server
cd FoodGenWeb
npm run dev

# Terminal 2: Run E2E tests (uses production Firebase)
cd FoodGenWeb
npm run test:e2e:chromium
```

### Quick Start (Firebase Emulator)

For isolated, repeatable tests without affecting production data:

```bash
# Terminal 1: Start Firebase Emulators (Auth + Firestore)
cd FoodGenWeb
firebase emulators:start --only auth,firestore

# Terminal 2: Start dev server (reads .env with emulator=true)
cd FoodGenWeb
npm run dev

# Terminal 3: Run E2E tests (connects to emulators)
cd FoodGenWeb
npx playwright test --config=e2e/playwright.config.ts --project=chromium
```

**Note:** The `.env` file is already configured with `VITE_USE_FIREBASE_EMULATOR=true`. To use production Firebase, change it to `false` or delete the `.env` file.

### All Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests across all 5 browser projects |
| `npm run test:e2e:ui` | Open Playwright UI mode (interactive test runner) |
| `npm run test:e2e:debug` | Run with Playwright debugger (Pause, step through) |
| `npm run test:e2e:chromium` | Run tests in Chromium only |
| `npm run test:e2e:firefox` | Run tests in Firefox only |
| `npm run test:e2e:webkit` | Run tests in WebKit (Safari) only |
| `npm run test:e2e:mobile` | Run on Pixel 7 + iPhone 14 Pro emulators |
| `npm run test:e2e:report` | View the HTML test report |

### Running Specific Tests

```bash
# Run a single test file
npx playwright test --config=e2e/playwright.config.ts e2e/specs/auth/signup.spec.ts

# Run tests matching a pattern
npx playwright test --config=e2e/playwright.config.ts --grep "TC-AUTH-001"

# Run with a specific project
npx playwright test --config=e2e/playwright.config.ts --project=chromium --grep "Generate meals"

# List all tests without running
npx playwright test --config=e2e/playwright.config.ts --list
```

### Viewing Reports

```bash
# After tests run, view the HTML report
npm run test:e2e:report
```

Test artifacts (screenshots, videos, traces) are saved to `e2e/reports/`.

---

## Project Structure

```
FoodGenWeb/e2e/
├── playwright.config.ts          # Configuration: 5 projects, timeouts, reporters
├── global-setup.ts               # Pre-test: verify app reachable, seed data
├── global-teardown.ts            # Post-test: cleanup test data
├── fixtures/
│   └── test-data.ts              # Shared test users, routes, constants
├── pages/                        # Page Object Models (POM)
│   ├── OnboardingPage.ts         # Sign up / Login / Forgot Password
│   ├── DashboardPage.ts          # Create/Join household, invites
│   ├── DayPage.ts                # Generate meals, meal cards, date nav
│   ├── WeekPage.ts               # Week plan, day rows, expand/collapse
│   ├── HistoryPage.ts            # History cards, week navigation
│   ├── SettingsPage.ts           # Household info, sign out
│   ├── AddMealPage.ts            # Form fields, ingredients, steps
│   └── HouseholdManagementPage.ts# Members, invites, requests
├── specs/                        # Test spec files (feature-organized)
│   ├── auth/
│   │   ├── signup.spec.ts
│   │   ├── login.spec.ts
│   │   └── forgot-password.spec.ts
│   ├── dashboard/
│   │   ├── create-household.spec.ts
│   │   └── join-household.spec.ts
│   └── meal-planning/
│       ├── day-page.spec.ts
│       ├── week-page.spec.ts
│       └── history-page.spec.ts
└── reports/                      # Artifacts (gitignored)
    └── html/
```

---

## Page Object Models

Each major page has a corresponding Page Object Model class that encapsulates:

- **Locators**: `get` accessors for UI elements
- **Actions**: Methods that perform interactions (click, fill, select)
- **Assertions**: `expect*` methods for common verifications

### Example: OnboardingPage

```typescript
// Get a locator
const nameInput = onboarding.nameInput;

// Perform an action
await onboarding.signUp('User', 'user@test.com', 'password123');

// Assert
await onboarding.expectRedirectedToDashboard();
```

### Example: Using Page Objects in a Test

```typescript
test('TC-AUTH-001: Sign up with valid data', async ({ page }) => {
  const onboarding = new OnboardingPage(page);
  await onboarding.goto();
  await onboarding.clickSignUpTab();
  await onboarding.signUp('Test User', 'test@example.com', 'password123');
  await onboarding.expectRedirectedToDashboard();
});
```

---

## Test Specs

Tests are organized by feature and mapped to the [Manual UI Testing Checklist](FOOD_GEN_MANUAL_UI_TESTING.md). Each test case is labeled with its TC-XXX-XXX identifier.

### Current Specs (485 tests)

| Spec File | Test Cases | Status | Execution |
|-----------|-----------|--------|-----------|
| `auth/signup.spec.ts` | TC-AUTH-001 to 006 | ✅ Written | 🔥 Requires Firebase |
| `auth/login.spec.ts` | TC-AUTH-007 to 010 | ✅ Written | 🔥 Requires Firebase |
| `auth/forgot-password.spec.ts` | TC-AUTH-011 to 015 | ✅ Written | ✅ UI toggle passes, modal requires Firebase |
| `dashboard/create-household.spec.ts` | TC-DASH-001 to 006 | ✅ Written | 🔥 Requires Firebase |
| `dashboard/join-household.spec.ts` | TC-DASH-007 to 010, 019 | ✅ Written | 🔥 Requires Firebase |
| `meal-planning/day-page.spec.ts` | TC-DAY-001 to 038 | ✅ Written | 🚧 Flaky — needs robust-nav fix (see troubleshooting) |
| `meal-planning/week-page.spec.ts` | TC-WEEK-001 to 022 | ✅ Written | 🚧 Flaky — needs robust-nav fix (see troubleshooting) |
| `meal-planning/history-page.spec.ts` | TC-HIST-001 to 018 | ✅ Written | 🚧 Flaky — needs robust-nav fix (see troubleshooting) |
| `add-meal.spec.ts` | TC-ADD-001 to 030 | ✅ Validated (24/24) | ✅ Chromium vs Firebase emulator |
| `settings.spec.ts` | TC-SET-001 to 011 | ✅ Validated (7/7) | ✅ Chromium vs Firebase emulator |
| `household-management.spec.ts` | TC-MGMT-001 to 014 | ✅ Validated (10/10) | ✅ Chromium vs Firebase emulator |
| **Total** | | **97 tests × 5 browsers = 485** | |

> 🔥 = Requires Firebase to be connected (see [Prerequisites](#prerequisites))
> 🚧 = Written but intermittently failing on a live run; see [Troubleshooting](#troubleshooting-key-gotchas) for the fix pattern.

### Test Naming Convention

Each test is named to match the manual checklist:

```
TC-AUTH-001: Sign up with valid data — redirects to dashboard
TC-DAY-010: Generate meals flow
TC-DASH-004: Create household redirects
```

---

## Implementation Roadmap

### Legend

| Icon | Meaning |
|------|---------|
| ✅ | Done |
| 🚧 | In Progress |
| ⬜ | Not Started |
| 🔥 | Requires Firebase |

### Phase 1 — Setup & Authentication ✅

- [x] Install Playwright + browsers (chromium, firefox, webkit)
- [x] Create `playwright.config.ts` with 5 projects
- [x] Create global setup/teardown
- [x] Create Page Object Models (8 pages)
- [x] Create test fixtures and utilities
- [x] Create auth test specs (signup, login, forgot-password)
- [x] Create dashboard test specs
- [x] Create meal planning test specs (day page)
- [x] Add npm scripts to `package.json`
- [x] Update `.gitignore`
- [x] Verify config with `--list` (170 tests discovered)
- [x] Generate documentation

### Phase 2 — Week & History Pages 🚧 (Code written; passing but flaky on live run)

- [x] Week page: empty state, generate week, expand/collapse
- [x] Week page: navigate weeks, regenerate day
- [x] History page: no household state, no plans state
- [x] History page: history cards, week navigation, year boundaries
- [x] History page: view day, regenerate from history
- [ ] **Apply the robust-nav + banner-removal fix** (see [Troubleshooting](#troubleshooting-key-gotchas)) to eliminate intermittent failures

### Phase 3 — Add Meal & Settings ✅ (Validated — Chromium vs Firebase emulator)

- [x] Add Meal page: form validation (name, slots, ingredients)
- [x] Add Meal page: add/remove ingredients and steps
- [x] Add Meal page: save meal flow
- [x] Settings page: household info display
- [x] Settings page: sign out flow (confirm/cancel)
- [x] Settings page: manage household navigation

### Phase 4 — Household Management ✅ (Validated — Chromium vs Firebase emulator)

- [x] Manage page: admin access control
- [x] Manage page: member list display
- [x] Manage page: invite member flow
- [x] Manage page: accept/reject join requests
- [x] Manage page: pending requests badge

### Phase 5 — Role-Based Access Control ⬜

- [ ] Admin: can generate meals, manage household
- [ ] Editor: can generate meals, suggest swaps
- [ ] Viewer: read-only, no action buttons
- [ ] Viewer: sees "Ask your household admin" messages

### Phase 6 — Meal Card Interactions ⬜

- [ ] View meal details modal
- [ ] Status cycling (Planned → In Progress → Completed → Skipped)
- [ ] Remove meal (confirm/cancel)
- [ ] Suggest swap flow
- [ ] Accept/reject suggestions
- [ ] Add meal manually from picker

### Phase 7 — Cross-Browser & Mobile ⬜

- [ ] Run full suite on Chromium, Firefox, WebKit
- [ ] Mobile viewport testing (Pixel 7, iPhone 14)
- [ ] Responsive design verification
- [ ] Touch interactions

### Phase 8 — CI Integration ⬜

- [ ] GitHub Actions workflow for E2E
- [ ] Firebase emulator setup for CI
- [ ] Parallel test execution
- [ ] Test artifact storage
- [ ] PR status checks

### Phase 9 — User Journey Flows ⬜

- [ ] Full signup → create household → generate day → view meal
- [ ] Login → join household → generate week → edit status
- [ ] Admin → invite member → member accepts → view plan
- [ ] Viewer role cannot generate meals
- [ ] Suggest meal swap → admin approves → plan updated
- [ ] Add custom meal → appears in meal picker

---

## Troubleshooting: Key Gotchas

The app uses **React Router `HashRouter`** and connects to the **Firebase emulator**, which together cause two recurring E2E failures. The fixes below (already applied to `add-meal`, `settings`, and `household-management`) are the standard pattern.

### 1. Full-page `page.goto()` after auth races and bounces to `/dashboard`

`page.goto('/#/settings')` (or `/day`, etc.) performs a full document reload. While the reload restores the Firebase auth session, `AuthRoute` momentarily renders `OnboardingPage`, whose `useEffect` redirects to `/dashboard`. Result: the test lands on the dashboard ("You're not part of a household yet") instead of the target page — flaky, not deterministic.

**Fix — navigate in-place (hash change, no reload) to preserve the loaded React context:**

```ts
// After sign-up + household creation, navigate WITHOUT a full reload:
await page.evaluate(() => { window.location.hash = '#/settings'; }); // or '#/day', '#/add-meal', ...
await page.expect().toHaveURL(/#\/settings/); // then assert
```

When a dashboard button already routes in-app (e.g. the admin "⚙️ Manage Household" button uses `navigate('/household/manage')`), prefer clicking it over `goto()`.

Always wait for the household to actually attach before navigating:

```ts
await dashboard.createHousehold('Test Family');
await dashboard.expectWithHouseholdState(); // fails fast if creation failed
```

### 2. The Firebase emulator banner intercepts clicks on modal buttons

The auth emulator injects a fixed, high-z-index `<p class="firebase-emulator-warning">` at the bottom of the viewport. It overlaps buttons near the bottom of modals (e.g. "Create Household" / "Save"), so a `click({ force: true })` ends up hitting the banner and the action silently never fires.

A CSS rule `.firebase-emulator-warning { display: none }` is unreliable when injected via `addInitScript` (which runs before `document.head` exists). Use a MutationObserver that **removes** the element:

```ts
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
      document.documentElement, { childList: true, subtree: true }
    );
    started = true;
    return true;
  };
  if (!start()) {
    const iv = setInterval(() => { if (start()) clearInterval(iv); }, 20);
  }
});
```

### 3. Prefer real Playwright actions over `page.evaluate` for React-controlled inputs

Setting `input.value` + dispatching synthetic events often does not update React state (controlled components). Use native locator actions whenever possible:

```ts
await page.getByPlaceholder('30').fill('45');                 // prepTime
await page.getByRole('button', { name: /Add Ingredient/ }).click();
await expect(page.locator('label.checkbox-label').filter({ hasText: /Breakfast/ })).toBeVisible();
```

---

## CI Integration

### GitHub Actions (Planned)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium firefox webkit
      - name: Build app
        run: npm run build
      - name: Run E2E tests
        run: npm run test:e2e:chromium
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: e2e/reports/
```

---

## Adding New Tests

1. **Create a Page Object** (if a new page): `e2e/pages/NewPage.ts`
2. **Add test data** to `e2e/fixtures/test-data.ts`
3. **Create a spec file**: `e2e/specs/feature-name/page-name.spec.ts`
4. **Run the test**: `npm run test:e2e:chromium -- --grep "your test name"`

### Best Practices

- Use `page.locator()` with text/content selectors (resilient to class changes)
- Prefer `getByRole`, `getByText`, `getByPlaceholder` when possible
- Use `data-testid` attributes for critical elements
- Follow the existing `beforeEach` pattern for auth setup
- Name tests with their `TC-XXX-XXX` identifiers
- Keep tests independent — no shared state between tests
- Use `or()` for handling multiple possible selectors