import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    // Vitest is for unit/component tests only. Scope discovery to src/ so the
    // Playwright E2E specs (e2e/**/*.spec.ts) are never collected by Vitest.
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
