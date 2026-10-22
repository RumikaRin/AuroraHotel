import test from "node:test";
import assert from "node:assert/strict";

interface MockUser {
  id: string;
  email: string;
  roleId: string;
}

interface MockDb {
  users: MockUser[];
}

async function resolveCheckoutUser(
  session: { user?: { id?: string; email?: string } } | null,
  guestInput: { guestEmail: string; guestName: string; guestPhone: string },
  db: MockDb,
): Promise<{ id: string; email: string }> {
  if (session?.user?.id && session?.user?.email) {
    return { id: session.user.id, email: session.user.email };
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === guestInput.guestEmail.toLowerCase());
  if (existing) {
    return { id: existing.id, email: existing.email };
  }

  const newUser: MockUser = {
    id: `guest-${Date.now()}`,
    email: guestInput.guestEmail.toLowerCase(),
    roleId: "role-customer",
  };
  db.users.push(newUser);
  return { id: newUser.id, email: newUser.email };
}

test("Logged-in user uses session identity directly", async () => {
  const db: MockDb = { users: [] };
  const user = await resolveCheckoutUser(
    { user: { id: "user-123", email: "member@aurorahotel.vn" } },
    { guestEmail: "other@gmail.com", guestName: "Other", guestPhone: "0900000000" },
    db,
  );
  assert.equal(user.id, "user-123");
  assert.equal(user.email, "member@aurorahotel.vn");
  assert.equal(db.users.length, 0);
});

test("Guest user without session is automatically created in db", async () => {
  const db: MockDb = { users: [] };
  const user = await resolveCheckoutUser(
    null,
    { guestEmail: "traveler@gmail.com", guestName: "Nguyễn Khách", guestPhone: "0912345678" },
    db,
  );
  assert.equal(user.email, "traveler@gmail.com");
  assert.equal(db.users.length, 1);
  assert.equal(db.users[0].email, "traveler@gmail.com");
});

test("Returning guest user matches existing account without duplicate creation", async () => {
  const db: MockDb = { users: [{ id: "existing-guest", email: "traveler@gmail.com", roleId: "role-customer" }] };
  const user = await resolveCheckoutUser(
    null,
    { guestEmail: "traveler@gmail.com", guestName: "Nguyễn Khách", guestPhone: "0912345678" },
    db,
  );
  assert.equal(user.id, "existing-guest");
  assert.equal(db.users.length, 1);
});
