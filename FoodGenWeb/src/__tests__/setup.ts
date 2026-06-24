import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Firebase config
vi.mock('../firebase/config', () => ({
  auth: {},
  db: {},
  app: {},
}));

// Mock firebase/auth module
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@test.com' } })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@test.com' } })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((_auth: any, callback: any) => {
    const unsubscribe = vi.fn();
    setTimeout(() => callback(null), 0);
    return unsubscribe;
  }),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

// Mock firebase/firestore module
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'test-doc' })),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [], empty: true })),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn((_q: any, callback: any) => {
    callback([]);
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
}));

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock window.localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const locationMock = {
  href: '',
  hash: '#/',
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', { value: locationMock, writable: true });
