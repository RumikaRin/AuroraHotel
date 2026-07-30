import { describe, expect, it } from "vitest";
import { claimWebhookEvent } from "../../src/server/webhooks/verify.js";

describe("webhook replay prevention", () => {
  it("rejects a replayed event", async () => {
    await expect(
      claimWebhookEvent(
        { claim: async () => ({ claimed: false }) },
        "event-1",
      ),
    ).rejects.toThrow("already processed");
  });
});
