if (process.env.NODE_ENV !== "test") {
  import("server-only").catch(() => {});
}

export const STAFF_ROLES = new Set(["ADMIN", "STAFF"] as const);
export const ADMIN_ROLES = new Set(["ADMIN"] as const);
