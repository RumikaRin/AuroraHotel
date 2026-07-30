// Middleware adapted from FLOF src/middleware.ts. Responsibilities:
//   1. Per-request CSP nonce + security headers on EVERY response.
//   2. Rate limiting driven by the central policy map.
//   3. Auth guard for /admin and /profile (NextAuth "authorized" callback).
//
// DIVERGENCES vs FLOF (each one intentional for a minimal starter):
// - No locale prefix handling (FLOF rewrites /vi|/en URL prefixes).
// - No E2E isolation mode (FLOF relaxes limits when E2E_TEST_MODE=1).
// - Nonce uses btoa() instead of Buffer so the file stays Edge-clean.
// - FLOF sets only CSP here; the starter also sets X-Frame-Options etc.
//   (FLOF sets those elsewhere in its deployment config).

import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { UnifiedRateLimiter } from "@/lib/rate-limiter";
import { getClientIp } from "@/lib/ip";
import { getRateLimitPolicy, type RateLimitPolicy } from "@/lib/rate-limit-policy";
import {
  buildContentSecurityPolicy,
  staticSecurityHeaders,
} from "@/lib/security-headers";
import { createApiErrorResponse, getApiRequestId } from "@/lib/api-error";

const authMiddleware = NextAuth(authConfig).auth;
const runAuthMiddleware = authMiddleware as unknown as (
  request: NextRequest,
  event: unknown,
) => Promise<NextResponse | undefined>;

// One limiter instance per (window, limit, failureMode) combination, shared
// across requests within this runtime instance.
const rateLimiters = new Map<string, UnifiedRateLimiter>();

function limiterFor(policy: RateLimitPolicy) {
  // FAIL-CLOSED RULE (from FLOF): in production, sensitive buckets ("auth",
  // "publicWrite") must use a distributed backend. Without Redis they DENY
  // requests (503) rather than degrade to a bypassable in-memory limiter.
  // The general "api" bucket fails open to memory: read traffic should not
  // hard-down the whole site because Redis blipped.
  const failureMode =
    process.env.NODE_ENV === "production" && policy.limiter !== "api"
      ? "deny"
      : "memory";
  const key = `${policy.windowMs}:${policy.limit}:${failureMode}`;
  let limiter = rateLimiters.get(key);
  if (!limiter) {
    limiter = new UnifiedRateLimiter(policy.windowMs, policy.limit, {
      failureMode,
    });
    rateLimiters.set(key, limiter);
  }
  return limiter;
}

function withSecurityHeaders<T extends Response>(response: T, nonce: string) {
  response.headers.set(
    "Content-Security-Policy",
    buildContentSecurityPolicy(
      process.env.NODE_ENV === "production" ? "production" : "development",
      nonce,
    ),
  );
  for (const [name, value] of Object.entries(staticSecurityHeaders())) {
    response.headers.set(name, value);
  }
  return response;
}

function nextWithNonce(requestHeaders: Headers, nonce: string) {
  return withSecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    nonce,
  );
}

export default async function middleware(request: NextRequest, event: unknown) {
  const pathname = request.nextUrl.pathname;
  const nonce = btoa(crypto.randomUUID());

  // Forward the CSP on the REQUEST so Next.js stamps the nonce onto the
  // framework <script> tags it renders (this is how nonce propagation works
  // in the App Router; setting only the response header is not enough).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    buildContentSecurityPolicy(
      process.env.NODE_ENV === "production" ? "production" : "development",
      nonce,
    ),
  );

  // 1. Rate limiting (keyed by policy prefix + client IP).
  const rateLimitPolicy = getRateLimitPolicy(pathname, request.method);
  if (rateLimitPolicy) {
    const ip = getClientIp(request);
    const limiter = limiterFor(rateLimitPolicy);
    const rateCheck = await limiter.checkLimit(
      `${rateLimitPolicy.keyPrefix}_${ip}`,
    );
    if (!rateCheck.success) {
      const backendUnavailable = rateCheck.reason === "BACKEND_UNAVAILABLE";
      const response = createApiErrorResponse(
        {
          status: backendUnavailable ? 503 : 429,
          code: backendUnavailable ? "SERVICE_UNAVAILABLE" : "RATE_LIMITED",
          message: backendUnavailable
            ? "Request protection service is temporarily unavailable."
            : "Too many requests. Please try again later.",
        },
        getApiRequestId(request),
      );
      response.headers.set(
        "Retry-After",
        Math.max(0, Math.ceil((rateCheck.resetTime - Date.now()) / 1000)).toString(),
      );
      return withSecurityHeaders(response, nonce);
    }
  }

  // 2. Auth guard only where it can block navigation. Public routes keep the
  // plain pass-through so the nonce request override reaches the renderer.
  const needsAuthGuard =
    pathname.startsWith("/admin") || pathname.startsWith("/profile");
  if (!needsAuthGuard) {
    return nextWithNonce(requestHeaders, nonce);
  }

  const requestWithNonce = new NextRequest(request.nextUrl, {
    headers: requestHeaders,
  });
  const authResponse = await runAuthMiddleware(requestWithNonce, event);
  const isPassThrough =
    !authResponse || authResponse.headers.get("x-middleware-next") === "1";

  if (!isPassThrough) return withSecurityHeaders(authResponse, nonce);

  // Auth allowed the request: continue, but preserve any cookies NextAuth
  // set (e.g. session refresh) on our nonce-carrying response.
  const response = nextWithNonce(requestHeaders, nonce);
  for (const cookie of authResponse?.cookies?.getAll?.() ?? []) {
    response.cookies.set(cookie);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
