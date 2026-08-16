/**
 * Shared test data constants used across E2E tests.
 * These correspond to the test accounts and data in the manual testing checklist.
 */

export const TEST_USERS = {
  admin: {
    name: 'E2E Admin',
    email: `e2e-admin-${Date.now()}@test.foodgen.app`,
    password: 'TestPass123!',
  },
  editor: {
    name: 'E2E Editor',
    email: `e2e-editor-${Date.now()}@test.foodgen.app`,
    password: 'TestPass123!',
  },
  viewer: {
    name: 'E2E Viewer',
    email: `e2e-viewer-${Date.now()}@test.foodgen.app`,
    password: 'TestPass123!',
  },
  newUser: {
    name: 'E2E New User',
    email: `e2e-new-${Date.now()}@test.foodgen.app`,
    password: 'TestPass123!',
  },
};

export const TEST_HOUSEHOLD = {
  name: 'E2E Test Family',
  inviteCode: 'TESTSET1',
};

export const TEST_MEALS = {
  adobo: 'Chicken Adobo',
  sinigang: 'Sinigang na Baboy',
  nilaga: 'Nilagang Baka',
  friedRice: 'Sinangag',
};

export const VALIDATION_MESSAGES = {
  emptyName: 'Please enter your name',
  passwordMismatch: 'Passwords do not match',
  shortPassword: 'Password must be at least 6 characters',
  emptyEmail: 'Please enter your email',
  invalidCode: 'Invalid invite code',
  emptyHouseholdName: 'Please enter a household name',
  noMealsPlanned: 'No meals planned yet',
  askAdmin: 'Ask your household admin to plan meals',
  noWeeklyPlan: 'No weekly plan yet',
  noPlansForWeek: 'No plans for this week',
  onlyAdmins: 'Only admins can manage household',
};

// The app uses HashRouter, so in-app routes are addressable via the URL hash.
// Using hash-based URLs keeps auth state (localStorage) across navigation.
export const ROUTES = {
  onboarding: '/',
  dashboard: '/#/dashboard',
  day: '/#/day',
  week: '/#/week',
  history: '/#/history',
  settings: '/#/settings',
  addMeal: '/#/add-meal',
  householdManage: '/#/household/manage',
};

export const STORAGE_KEYS = {
  authState: 'e2e-auth-state.json',
};