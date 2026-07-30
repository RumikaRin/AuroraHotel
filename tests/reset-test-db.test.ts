import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalConnection,
  resetTestDatabase,
} from "../scripts/reset-test-db.mjs";

const pooled =
  "postgresql://aurora_test_runner:s@ep-test-pooler.us-east-2.aws.neon.tech/aurora_test?sslmode=require";
const direct =
  "postgresql://aurora_test_runner:s@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require";

describe("Fail-closed Neon test reset runner", () => {
  it("executes exact sequence when all identity and environment guards pass", async () => {
    const events: Array<[string, ...unknown[]]> = [];
    await resetTestDatabase({
      pooledUrl: pooled,
      directUrl: direct,
      environment: "test",
      confirmation: "aurora_test",
      queryIdentity: async () => {
        events.push(["identity", "aurora_test", "aurora_test_runner"]);
        return { database: "aurora_test", role: "aurora_test_runner" };
      },
      resetSchema: async (_url: string, exp: { database: string }) => {
        events.push(["drop-create-schema", exp.database]);
      },
      runPrisma: async (args: string[]) => {
        events.push(["prisma", args]);
      },
    });

    assert.deepEqual(events, [
      ["identity", "aurora_test", "aurora_test_runner"],
      ["drop-create-schema", "aurora_test"],
      ["prisma", ["migrate", "deploy"]],
      ["prisma", ["db", "seed"]],
    ]);
  });

  const negativeCases = [
    { name: "production env", environment: "production" },
    { name: "empty confirmation", confirmation: "" },
    { name: "wrong confirmation", confirmation: "aurora_production" },
    { name: "pooled url database mismatch", pooledUrl: pooled.replace("aurora_test", "aurora_prod") },
    { name: "live database mismatch", queryDb: "aurora_preview", queryRole: "aurora_test_runner" },
    { name: "live role mismatch", queryDb: "aurora_test", queryRole: "aurora_preview_app" },
    { name: "same as production url", productionUrl: direct },
  ];

  for (const tc of negativeCases) {
    it(`refuses reset when ${tc.name}`, async () => {
      const events: unknown[] = [];
      await assert.rejects(
        () =>
          resetTestDatabase({
            pooledUrl: tc.pooledUrl ?? pooled,
            directUrl: direct,
            environment: tc.environment ?? "test",
            confirmation: tc.confirmation ?? "aurora_test",
            productionUrl: tc.productionUrl,
            queryIdentity: async () => {
              events.push(["identity"]);
              return {
                database: tc.queryDb ?? "aurora_test",
                role: tc.queryRole ?? "aurora_test_runner",
              };
            },
            resetSchema: async () => {
              events.push(["drop-create-schema"]);
            },
            runPrisma: async () => {
              events.push(["prisma"]);
            },
          }),
        /Refusing remote test reset|Live Neon identity mismatch|Neon identity mismatch/i,
      );

      assert.equal(
        events.some((e) => (e as unknown[])[0] === "drop-create-schema" || (e as unknown[])[0] === "prisma"),
        false,
      );
    });
  }

  it("canonicalizes connection string stripping password", () => {
    assert.equal(
      canonicalConnection(
        "postgresql://user:secret-pass@ep-test.neon.tech/aurora_test?sslmode=require",
      ),
      "postgresql://user@ep-test.neon.tech/aurora_test?sslmode=require",
    );
  });
});
