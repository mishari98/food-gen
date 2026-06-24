import { describe, it, expect, beforeEach } from 'vitest';
import {
  isOnboardingComplete,
  setOnboardingComplete,
  getDisplayName,
  setDisplayName,
  isSeedDataLoaded,
  setSeedDataLoaded,
} from '../../services/preferenceManager';

describe('preferenceManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // ── Onboarding ──

  describe('isOnboardingComplete', () => {
    it('returns false initially', async () => {
      const result = await isOnboardingComplete();
      expect(result).toBe(false);
    });

    it('returns true after set', async () => {
      await setOnboardingComplete();
      const result = await isOnboardingComplete();
      expect(result).toBe(true);
    });
  });

  describe('setOnboardingComplete', () => {
    it('sets the localStorage value', async () => {
      await setOnboardingComplete();
      expect(window.localStorage.getItem('onboarding_complete')).toBe('true');
    });
  });

  // ── Display Name ──

  describe('getDisplayName', () => {
    it('returns empty string initially', async () => {
      const result = await getDisplayName();
      expect(result).toBe('');
    });

    it('returns stored name after set', async () => {
      await setDisplayName('Juan Dela Cruz');
      const result = await getDisplayName();
      expect(result).toBe('Juan Dela Cruz');
    });
  });

  describe('setDisplayName', () => {
    it('stores display name', async () => {
      await setDisplayName('Maria');
      expect(window.localStorage.getItem('displayName')).toBe('Maria');
    });

    it('stores special characters', async () => {
      await setDisplayName('José Rizal 🏆');
      const result = await getDisplayName();
      expect(result).toBe('José Rizal 🏆');
    });
  });

  // ── Seed Data ──

  describe('isSeedDataLoaded', () => {
    it('returns false initially', async () => {
      const result = await isSeedDataLoaded();
      expect(result).toBe(false);
    });

    it('returns true after set', async () => {
      await setSeedDataLoaded();
      const result = await isSeedDataLoaded();
      expect(result).toBe(true);
    });
  });

  describe('setSeedDataLoaded', () => {
    it('sets the localStorage value', async () => {
      await setSeedDataLoaded();
      expect(window.localStorage.getItem('seed_data_loaded')).toBe('true');
    });
  });
});