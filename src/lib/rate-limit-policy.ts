// Rate-limit policy map, distilled from FLOF
// src/lib/security/rate-limit-policy.ts. One central function decides which
// limiter bucket applies to a request; the middleware only consumes it.
//
// PURE LIB RULE: exercised by "node --test" (no "@/" alias), so only
// bare/relative imports are allowed here.

export type RateLimitPolicy = {
  keyPrefix: "auth" | "checkout" | "api";
  // "auth" and "publicWrite" fail CLOSED in production without Redis;
  // "api" fails open to the in-memory limiter (see src/middleware.ts).
  limiter: "auth" | "api" | "publicWrite";
  limit: number;
  windowMs: number;
};

const WINDOW_MS = 60_000;

function policy(
  keyPrefix: RateLimitPolicy["keyPrefix"],
  limiter: RateLimitPolicy["limiter"],
  limit: number,
): RateLimitPolicy {
  return { keyPrefix, limiter, limit, windowMs: WINDOW_MS };
}

export function getRateLimitPolicy(
  pathname: string,
  method?: string,
): RateLimitPolicy | null {
  const isWrite = method
    ? !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())
    : true;

  // Credentials login endpoint: brute-force target, tight limit.
  if (pathname === "/api/auth/callback/credentials") {
    return policy("auth", "auth", 10);
  }
  // Checkout creates orders and mutates stock: strict write limit.
  if (isWrite && pathname === "/api/checkout") {
    return policy("checkout", "publicWrite", 10);
  }
  // General API bucket. /api/auth/* (NextAuth internals) stays unlimited
  // except for the credentials callback above, matching FLOF.
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    return policy("api", "api", 60);
  }
  return null;
}
