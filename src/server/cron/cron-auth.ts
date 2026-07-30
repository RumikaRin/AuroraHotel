import { timingSafeEqual } from "node:crypto";

export function verifyCronSecret(
  authHeader: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!authHeader || !expectedSecret) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1];

  try {
    const tokenBuf = Buffer.from(token, "utf8");
    const expectedBuf = Buffer.from(expectedSecret, "utf8");
    if (tokenBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}
