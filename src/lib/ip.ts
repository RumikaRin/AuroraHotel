// Client IP extraction, distilled from FLOF src/lib/ip.ts.
// Trust order: x-forwarded-for first hop, then x-real-ip, then a fixed
// fallback. Only ever use this for rate-limit keys and audit metadata,
// never for authorization decisions (headers are spoofable off-platform).

import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
