import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertNeonPair,
  parseDatabaseIdentity,
} from "../src/server/config/database-identity.ts";

const pooled =
  "postgresql://aurora_test_runner:s@ep-test-pooler.us-east-2.aws.neon.tech/aurora_test?sslmode=require";
const direct =
  "postgresql://aurora_test_runner:s@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require";

describe("Neon connection identity", () => {
  it("accepts one pooled/direct pair for the same database and role", () => {
    assert.deepEqual(assertNeonPair(pooled, direct, "test"), {
      environment: "test",
      database: "aurora_test",
      role: "aurora_test_runner",
      pooledHost: "ep-test-pooler.us-east-2.aws.neon.tech",
      directHost: "ep-test.us-east-2.aws.neon.tech",
    });
  });

  for (const source of [
    "file:./e2e.db",
    "postgresql://aurora_test_runner:s@evil-neon.tech/aurora_test?sslmode=require",
    "postgresql://aurora_test_runner:s@ep-test.neon.tech/aurora_test",
  ]) {
    it(`rejects ${source}`, () => {
      assert.throws(() => parseDatabaseIdentity(source));
    });
  }

  it("rejects a production URL in the test environment", () => {
    assert.throws(() =>
      assertNeonPair(
        pooled.replace("aurora_test", "aurora_production"),
        direct.replace("aurora_test", "aurora_production"),
        "test",
      ),
    );
  });
});
