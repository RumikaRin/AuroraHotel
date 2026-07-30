import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyDeploymentConfig } from "../scripts/verify-cloud-deployment.mjs";

describe("Cloud Deployment Verification Script", () => {
  it("validates deployment endpoints safely", async () => {
    const mockFetcher = async (url: string) => {
      if (url.includes("/api/health/live")) {
        return { ok: true, status: 200, json: async () => ({ status: "live", environment: "preview" }) };
      }
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    };

    const res = await verifyDeploymentConfig({
      baseUrl: "https://aurora-preview.vercel.app",
      environment: "preview",
      fetcher: mockFetcher as unknown as typeof fetch,
    });

    assert.equal(res.verified, true);
  });
});
