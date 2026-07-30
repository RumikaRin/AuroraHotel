import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyCiEnvironment } from "../scripts/verify-ci-environment.mjs";

const testPooled =
  "postgresql://aurora_test_runner:s@ep-test-pooler.us-east-2.aws.neon.tech/aurora_test?sslmode=require";
const testDirect =
  "postgresql://aurora_test_runner:s@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require";

describe("CI environment isolation guard", () => {
  it("passes when CI environment uses test database identity", () => {
    const res = verifyCiEnvironment({
      CI: "true",
      DATABASE_ENVIRONMENT: "test",
      DATABASE_URL: testPooled,
      DIRECT_URL: testDirect,
    });
    assert.equal(res.isolated, true);
  });

  it("throws when CI points to production database", () => {
    assert.throws(
      () =>
        verifyCiEnvironment({
          CI: "true",
          DATABASE_ENVIRONMENT: "production",
          DATABASE_URL: testPooled.replace("aurora_test", "aurora_production"),
          DIRECT_URL: testDirect.replace("aurora_test", "aurora_production"),
        }),
      /CI environment isolation violation/i,
    );
  });
});
