// Module augmentation so session.user.id / session.user.role are typed.

import type { DefaultSession } from "next-auth";

export type RoleType =
  | "ADMIN"
  | "MANAGER"
  | "RECEPTIONIST"
  | "HOUSEKEEPER"
  | "CUSTOMER"
  | "GUEST"
  | "STAFF";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleType;
    } & DefaultSession["user"];
  }

  interface User {
    role?: RoleType | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RoleType | string;
  }
}
