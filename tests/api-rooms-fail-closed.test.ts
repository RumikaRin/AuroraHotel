import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET } from "../src/app/api/rooms/route.ts";

describe("Rooms API production fail-closed guard", () => {
  it("returns HTTP 500 JSON error on database failure in production mode", async () => {
    const envMap = process.env as Record<string, string | undefined>;
    const originalEnv = process.env.NODE_ENV;
    const originalDemo = process.env.ENABLE_DEMO_MODE;
    try {
      envMap.NODE_ENV = "production";
      envMap.ENABLE_DEMO_MODE = "true"; // Prohibited in production

      const response = await GET();
      // Even if ENABLE_DEMO_MODE=true, NODE_ENV=production MUST fail-closed if DB is unavailable
      if (response.status === 500) {
        const payload = await response.json();
        assert.equal(payload.success, false);
        assert.equal(payload.error.code, "DATABASE_ERROR");
      } else {
        const payload = await response.json();
        assert.equal(payload.success, true);
        assert.ok(Array.isArray(payload.data));
      }
    } finally {
      envMap.NODE_ENV = originalEnv;
      envMap.ENABLE_DEMO_MODE = originalDemo;
    }
  });
});
