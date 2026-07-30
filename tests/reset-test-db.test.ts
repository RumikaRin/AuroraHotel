import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalConnection,
  resetTestDatabase,
} from "../scripts/reset-test-db.mjs";

describe("Fail-closed Neon test reset runner", () => {
  const validPooled =
    "postgresql://aurora_test_runner:secret@ep-test-pooler.c-3.ap-southeast-1.aws.neon.tech/aurora_test?sslmode=require";
  const validDirect =
    "postgresql://aurora_test_runner:secret@ep-test.c-3.ap-southeast-1.aws.neon.tech/aurora_test?sslmode=require";

  it("canonicalizes connection string stripping password", () => {
    const c = canonicalConnection(validPooled);
    assert.ok(!c.includes("secret"));
    assert.ok(c.includes("aurora_test"));
  });

  it("refuses reset when production env", async () => {
    await assert.rejects(
      resetTestDatabase({
        pooledUrl: validPooled,
        directUrl: validDirect,
        environment: "production",
        confirmation: "aurora_test",
        queryIdentity: async () => ({ database: "aurora_test", role: "aurora_test_runner" }),
        resetSchema: async () => {},
        runPrisma: async () => {},
      }),
      /Refusing remote test reset/,
    );
  });

  it("refuses reset when wrong confirmation token", async () => {
    await assert.rejects(
      resetTestDatabase({
        pooledUrl: validPooled,
        directUrl: validDirect,
        environment: "test",
        confirmation: "wrong_token",
        queryIdentity: async () => ({ database: "aurora_test", role: "aurora_test_runner" }),
        resetSchema: async () => {},
        runPrisma: async () => {},
      }),
      /Refusing remote test reset/,
    );
  });

  it("refuses reset when directUrl matches productionUrl", async () => {
    await assert.rejects(
      resetTestDatabase({
        pooledUrl: validPooled,
        directUrl: validDirect,
        environment: "test",
        confirmation: "aurora_test",
        productionUrl: validDirect,
        queryIdentity: async () => ({ database: "aurora_test", role: "aurora_test_runner" }),
        resetSchema: async () => {},
        runPrisma: async () => {},
      }),
      /Refusing remote test reset/,
    );
  });

  it("refuses reset when live database mismatch", async () => {
    await assert.rejects(
      resetTestDatabase({
        pooledUrl: validPooled,
        directUrl: validDirect,
        environment: "test",
        confirmation: "aurora_test",
        queryIdentity: async () => ({ database: "aurora_development", role: "aurora_test_runner" }),
        resetSchema: async () => {},
        runPrisma: async () => {},
      }),
      /Live Neon identity mismatch/,
    );
  });

  it("refuses reset when live role mismatch", async () => {
    await assert.rejects(
      resetTestDatabase({
        pooledUrl: validPooled,
        directUrl: validDirect,
        environment: "test",
        confirmation: "aurora_test",
        queryIdentity: async () => ({ database: "aurora_test", role: "wrong_role" }),
        resetSchema: async () => {},
        runPrisma: async () => {},
      }),
      /Live Neon identity mismatch/,
    );
  });

  it("executes reset sequence when all identity and environment guards pass", async () => {
    let schemaResetDone = false;
    const prismaCommands: string[][] = [];

    await resetTestDatabase({
      pooledUrl: validPooled,
      directUrl: validDirect,
      environment: "test",
      confirmation: "aurora_test",
      queryIdentity: async () => ({ database: "aurora_test", role: "aurora_test_runner" }),
      resetSchema: async () => {
        schemaResetDone = true;
      },
      runPrisma: async (args: string[]) => {
        prismaCommands.push(args);
      },
    });

    assert.equal(schemaResetDone, true);
    assert.deepEqual(prismaCommands, [
      ["migrate", "deploy"],
      ["db", "seed"],
    ]);
  });
});
