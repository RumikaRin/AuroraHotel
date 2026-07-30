import { defineConfig, devices } from "@playwright/test";

// Playwright enables colored output for its workers. Remove an inherited
// NO_COLOR value so Node does not emit a warning for every child process.
delete process.env.NO_COLOR;

const port = 3105;
const baseUrl = `http://127.0.0.1:${port}`;

// Env for the app under test. SQLite paths in DATABASE_URL are resolved
// relative to prisma/schema.prisma, so "file:./e2e.db" lands at
// prisma/e2e.db, which is already gitignored (prisma/*.db) and is rebuilt
// from migrations + seed by scripts/reset-e2e-db.mjs on every run (the
// webServer command below chains it before starting the app, because
// Playwright boots the webServer before any globalSetup hook runs).
export const e2eEnv = {
  DATABASE_URL: "file:./e2e.db",
  AUTH_SECRET: "e2e-only-secret-do-not-use-in-production-0123456789",
  AUTH_TRUST_HOST: "true",
  AUTH_URL: baseUrl,
  PORT: String(port),
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: baseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run e2e:db && npm run dev",
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: e2eEnv,
  },
});
