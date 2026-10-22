// Edge-safe NextAuth config (FLOF src/auth.config.ts pattern).
// This file is imported by src/middleware.ts, which runs on the Edge runtime,
// so it must NOT import Prisma, bcryptjs or anything Node-only. The full
// config with the Credentials provider lives in src/auth.ts.

import type { NextAuthConfig } from "next-auth";
import type { RoleType } from "@/types/next-auth";

const ALLOWED_ROLES: RoleType[] = [
  "ADMIN",
  "MANAGER",
  "RECEPTIONIST",
  "HOUSEKEEPER",
  "CUSTOMER",
  "GUEST",
  "STAFF",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        const tokenRole = token.role as RoleType;
        session.user.role = ALLOWED_ROLES.includes(tokenRole) ? tokenRole : "CUSTOMER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        // Returning false redirects to pages.signIn with a callbackUrl.
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "STAFF") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/operations/reception")) {
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "RECEPTIONIST") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/operations/housekeeping")) {
        if (!isLoggedIn) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "HOUSEKEEPER") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/profile") && !isLoggedIn) return false;

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
