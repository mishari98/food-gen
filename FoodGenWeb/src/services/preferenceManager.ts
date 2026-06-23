function getLocalStorage(): Storage {
  return window.localStorage;
}

// --- Onboarding ---

export async function isOnboardingComplete(): Promise<boolean> {
  return getLocalStorage().getItem('onboarding_complete') === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  getLocalStorage().setItem('onboarding_complete', 'true');
}

// --- Display Name ---

export async function getDisplayName(): Promise<string> {
  return getLocalStorage().getItem('displayName') || '';
}

export async function setDisplayName(name: string): Promise<void> {
  getLocalStorage().setItem('displayName', name);
}

// --- Seed Data ---

export async function isSeedDataLoaded(): Promise<boolean> {
  return getLocalStorage().getItem('seed_data_loaded') === 'true';
}

export async function setSeedDataLoaded(): Promise<void> {
  getLocalStorage().setItem('seed_data_loaded', 'true');
}