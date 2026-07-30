// Edge-safe NextAuth config (FLOF src/auth.config.ts pattern).
// This file is imported by src/middleware.ts, which runs on the Edge runtime,
// so it must NOT import Prisma, bcryptjs or anything Node-only. The full
// config with the Credentials provider lives in src/auth.ts.

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role =
          token.role === "ADMIN" || token.role === "STAFF" || token.role === "CUSTOMER"
            ? token.role
            : "CUSTOMER";
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
        if (role !== "ADMIN" && role !== "STAFF") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (pathname.startsWith("/profile") && !isLoggedIn) return false;

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
