import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Neon Prisma configuration", () => {
  it("uses PostgreSQL, a JS driver adapter, pooled runtime and direct CLI URLs", async () => {
    const [schema, config, db] = await Promise.all([
      readFile("prisma/schema.prisma", "utf8"),
      readFile("prisma.config.ts", "utf8"),
      readFile("src/lib/db.ts", "utf8"),
    ]);
    assert.match(schema, /provider\s*=\s*"postgresql"/);
    assert.match(schema, /engineType\s*=\s*"client"/);
    assert.match(config, /DIRECT_URL/);
    assert.match(db, /PrismaNeon/);
    assert.match(db, /databaseUrl|DATABASE_URL/);
    assert.doesNotMatch(schema, /provider\s*=\s*"sqlite"/);
  });
});
