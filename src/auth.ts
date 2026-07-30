// NextAuth v5 (beta) credentials auth, distilled from FLOF src/auth.ts.
//
// DIVERGENCES vs FLOF, all intentional simplifications for a starter:
// - No PrismaAdapter: with the JWT session strategy and a credentials-only
//   provider the adapter is unnecessary (no Account/Session tables).
// - No Google OAuth, no MFA, no DB-backed session registry / revocation.
//   FLOF validates every JWT against an AuthSession row so admins can revoke
//   sessions; re-add that when you need forced logout.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "GUEST";
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { role: true },
        });
        if (!user?.password) return null;

        const passwordOk = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );
        if (!passwordOk) return null;

        // FLOF PITFALL: this gate is why seeded accounts MUST have
        // emailVerified set in prisma/seed.ts. An unverified seeded admin
        // fails here with no useful error message on the login form.
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.type,
        };
      },
    }),
  ],
});
