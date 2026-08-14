import { defineConfig, devices } from '@playwright/test'

// The e2e suite drives the real components through the Ladle stories in
// src/__stories__, so it covers what jsdom-based unit tests cannot: focus
// management, real key events and the browsers we claim to support.
const PORT = 61000
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // The suite runs against the built stories rather than `ladle serve`: the
  // static build is deterministic, and the dev server needs the docs/ workspace
  // dependencies installed to boot.
  webServer: {
    command: 'pnpm run stories:build && pnpm run stories:preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
