import { defineConfig, devices } from "@playwright/test";

// Playwright enables colored output for its workers. Remove an inherited
// NO_COLOR value so Node does not emit a warning for every child process.
delete process.env.NO_COLOR;

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else {
  dotenv.config();
}

const port = 3105;
const baseUrl = `http://127.0.0.1:${port}`;

export const e2eEnv = {
  NODE_ENV: "test",
  DATABASE_ENVIRONMENT: "test",
  DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.TEST_DIRECT_URL || process.env.DIRECT_URL || "",
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "",
  TEST_DIRECT_URL: process.env.TEST_DIRECT_URL || process.env.DIRECT_URL || "",
  ALLOW_REMOTE_TEST_RESET: "aurora_test",
  AUTH_SECRET: process.env.AUTH_SECRET || "e2e-only-secret-do-not-use-in-production-0123456789",
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
    reuseExistingServer: false,
    timeout: 120_000,
    env: e2eEnv,
  },
});
