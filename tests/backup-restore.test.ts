import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateBackupTarget, validateRestoreTarget } from "../scripts/backup-neon.mjs";

const direct =
  "postgresql://aurora_test_runner:s@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require";

describe("Neon backup and restore safety guards", () => {
  it("allows backup for valid test or production URL", () => {
    const res = validateBackupTarget(direct, "test");
    assert.equal(res.database, "aurora_test");
  });

  it("refuses restore target when environment is production", () => {
    assert.throws(
      () => validateRestoreTarget(direct, "production", "aurora_production"),
      /Refusing restore to production/i,
    );
  });

  it("allows restore target when environment is restore-test with confirmation", () => {
    const restoreDirect =
      "postgresql://aurora_restore_runner:s@ep-restore.us-east-2.aws.neon.tech/aurora_restore_test?sslmode=require";
    const res = validateRestoreTarget(
      restoreDirect,
      "restore-test",
      "aurora_restore_test",
    );
    assert.equal(res.database, "aurora_restore_test");
  });
});
