import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recordAuditLog } from "../src/services/audit.service.ts";
import { recordEmailOutbox } from "../src/services/outbox.service.ts";

describe("Audit and outbox services", () => {
  it("creates structured audit log payload", async () => {
    const mockDb: any = {
      auditLog: {
        create: async (args: any) => args.data,
      },
    };
    const log = await recordAuditLog(
      {
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: "b-123",
        payload: { guestEmail: "test@example.com" },
      },
      mockDb,
    );
    assert.equal(log.action, "BOOKING_CREATED");
    assert.equal(log.entityType, "Booking");
    assert.equal(log.entityId, "b-123");
  });

  it("creates email outbox payload with pending status", async () => {
    const mockDb: any = {
      emailOutbox: {
        create: async (args: any) => args.data,
      },
    };
    const entry = await recordEmailOutbox(
      {
        type: "BOOKING_CONFIRMATION",
        payload: { bookingNumber: "AUR-1001", email: "guest@example.com" },
      },
      mockDb,
    );
    assert.equal(entry.type, "BOOKING_CONFIRMATION");
    assert.equal(entry.status, "PENDING");
  });
});
