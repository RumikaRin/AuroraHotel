import assert from "node:assert/strict";
import test from "node:test";

import playwrightConfig from "../playwright.config.ts";

test("Playwright always starts its isolated E2E server and database reset", () => {
  const webServer = playwrightConfig.webServer;

  assert.ok(webServer);
  assert.ok(!Array.isArray(webServer));
  assert.equal(typeof webServer.reuseExistingServer, "boolean");
  assert.match(webServer.command, /npm run e2e:db/);
});
