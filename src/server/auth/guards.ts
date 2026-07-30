if (process.env.NODE_ENV !== "test") {
  import("server-only").catch(() => {});
}

import { ADMIN_ROLES, STAFF_ROLES } from "./policies.ts";

export interface SessionUser {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface AuthSession {
  user?: SessionUser | null;
}

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export async function requireUser(
  session: AuthSession | null | undefined,
): Promise<{ id: string; role: string; email?: string | null; name?: string | null }> {
  if (!session?.user?.id) {
    throw new AuthError(401, "Unauthorized");
  }
  return {
    ...session.user,
    id: session.user.id,
    role: session.user.role ?? "CUSTOMER",
  };
}

export async function requireStaff(
  session: AuthSession | null | undefined,
): Promise<{ id: string; role: string; email?: string | null; name?: string | null }> {
  const user = await requireUser(session);
  if (!STAFF_ROLES.has(user.role as "ADMIN" | "STAFF")) {
    throw new AuthError(403, "Forbidden: Staff access required");
  }
  return user;
}

export async function requireAdmin(
  session: AuthSession | null | undefined,
): Promise<{ id: string; role: string; email?: string | null; name?: string | null }> {
  const user = await requireUser(session);
  if (!ADMIN_ROLES.has(user.role as "ADMIN")) {
    throw new AuthError(403, "Forbidden: Admin access required");
  }
  return user;
}
