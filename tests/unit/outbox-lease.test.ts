import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recordEmailOutbox, processOutboxMessages } from "../../src/services/outbox.service.ts";
import { ValidationError } from "../../src/domain/errors.ts";

describe("Email Outbox Atomic Lease & Payload Validation", () => {
  it("rejects record creation when guestEmail is missing", async () => {
    await assert.rejects(
      async () => {
        await recordEmailOutbox({
          type: "BOOKING_CONFIRMATION",
          payload: { bookingId: "bk-1" },
        });
      },
      (err: unknown) => err instanceof ValidationError,
    );
  });

  it("atomically leases and processes outbox messages", async () => {
    let claimedCount = 0;
    let sentStatus = "";

    const mockDb = {
      emailOutbox: {
        findMany: async () => [
          { id: "msg-100", type: "BOOKING_CONFIRMATION", payload: { guestEmail: "user@example.com" }, attempts: 0 },
        ],
        updateMany: async (args: { data: { status: string } }) => {
          if (args.data.status === "PROCESSING") {
            claimedCount++;
            return { count: 1 };
          }
          if (args.data.status === "SENT") {
            sentStatus = "SENT";
            return { count: 1 };
          }
          return { count: 0 };
        },
      },
    };

    const result = await processOutboxMessages(
      20,
      mockDb as unknown as Parameters<typeof processOutboxMessages>[1],
    );

    assert.equal(claimedCount, 1);
    assert.equal(sentStatus, "SENT");
    assert.equal(result.processed, 1);
  });
});
