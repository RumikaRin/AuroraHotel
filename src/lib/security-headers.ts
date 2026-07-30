// Security headers builder, distilled from FLOF src/lib/security/headers.ts.
//
// DIVERGENCE vs FLOF: FLOF whitelists Cloudinary/Unsplash/CartoCDN hosts for
// images and map tiles. The starter has no external asset hosts, so img-src
// and connect-src are 'self' only. Add hosts here when you integrate a CDN.
//
// PURE LIB RULE: exercised by "node --test" (no "@/" alias), so only
// bare/relative imports are allowed here.

type RuntimeEnvironment = "development" | "production" | "test";

export function buildContentSecurityPolicy(
  environment: RuntimeEnvironment,
  nonce?: string,
  options: { upgradeInsecureRequests?: boolean } = {},
) {
  const scriptSources = ["'self'"];
  // Per-request nonce + strict-dynamic: only scripts carrying the nonce (and
  // scripts they load) run. Next.js reads the Content-Security-Policy REQUEST
  // header set by the middleware and stamps the nonce on its own scripts.
  if (nonce) scriptSources.push(`'nonce-${nonce}'`, "'strict-dynamic'");
  if (environment !== "production") {
    // Dev-only escape hatches for React Fast Refresh / eval sourcemaps.
    scriptSources.push("'unsafe-inline'", "'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    // Production forbids inline styles entirely (FLOF rule): Tailwind ships
    // a real stylesheet, so 'self' is enough and style injection is blocked.
    environment === "production"
      ? "style-src 'self'"
      : "style-src 'self' 'unsafe-inline'",
    environment === "production"
      ? "style-src-attr 'none'"
      : "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (options.upgradeInsecureRequests ?? environment === "production") {
    directives.push("upgrade-insecure-requests");
  }
  return directives.join("; ");
}

/** Non-CSP hardening headers applied to every response by the middleware. */
export function staticSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
