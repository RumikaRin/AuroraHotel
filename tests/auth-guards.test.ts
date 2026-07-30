import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  requireAdmin,
  requireStaff,
  requireUser,
} from "../src/server/auth/guards.ts";

describe("auth guards", () => {
  it("rejects null sessions with 401 status", async () => {
    await assert.rejects(
      async () => {
        await requireUser(null);
      },
      (err: unknown) => {
        assert.equal((err as { status?: number }).status, 401);
        return true;
      },
    );
  });

  it("rejects non-staff user for staff guard with 403 status", async () => {
    await assert.rejects(
      async () => {
        await requireStaff({ user: { id: "u1", role: "CUSTOMER" } });
      },
      (err: unknown) => {
        assert.equal((err as { status?: number }).status, 403);
        return true;
      },
    );
  });

  it("rejects staff user for admin guard with 403 status", async () => {
    await assert.rejects(
      async () => {
        await requireAdmin({ user: { id: "u1", role: "STAFF" } });
      },
      (err: unknown) => {
        assert.equal((err as { status?: number }).status, 403);
        return true;
      },
    );
  });

  it("accepts admin user for admin guard", async () => {
    const user = await requireAdmin({ user: { id: "u1", role: "ADMIN" } });
    assert.deepEqual(user, { id: "u1", role: "ADMIN" });
  });
});
