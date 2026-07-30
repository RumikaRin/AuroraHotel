import { USER_ROLES, type UserRole } from "../../domain/contracts.ts";
import { ForbiddenError } from "../../domain/errors.ts";

export type Permission =
  | "booking:read_own"
  | "booking:create_own"
  | "booking:cancel_own"
  | "booking:read_all"
  | "booking:create_any"
  | "booking:update_any"
  | "booking:cancel_any"
  | "room:assign"
  | "room:read_status"
  | "room:update_cleaning"
  | "checkin:perform"
  | "checkout:perform"
  | "audit:read"
  | "reports:read"
  | "rates:manage"
  | "*";

const rolePermissions: Record<UserRole, Set<Permission>> = {
  GUEST: new Set(["booking:read_own", "booking:create_own", "booking:cancel_own"]),
  RECEPTIONIST: new Set([
    "booking:read_all",
    "booking:create_any",
    "booking:update_any",
    "booking:cancel_any",
    "room:assign",
    "room:read_status",
    "checkin:perform",
    "checkout:perform",
  ]),
  HOUSEKEEPER: new Set(["room:read_status", "room:update_cleaning"]),
  MANAGER: new Set([
    "booking:read_all",
    "booking:create_any",
    "booking:update_any",
    "booking:cancel_any",
    "room:assign",
    "room:read_status",
    "room:update_cleaning",
    "checkin:perform",
    "checkout:perform",
    "audit:read",
    "reports:read",
    "rates:manage",
  ]),
  ADMIN: new Set(["*"]),
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = rolePermissions[role];
  if (!perms) return false;
  if (perms.has("*")) return true;
  return perms.has(permission);
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Permission denied: ${permission} required for role ${role}`);
  }
}
