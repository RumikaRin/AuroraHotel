import { createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "../../domain/errors.ts";

const TOKEN_SECRET = process.env.AUTH_SECRET || "aurora-token-signing-secret-key-32-chars-long";

export interface TokenPayload {
  bookingId: string;
  bookingNumber: string;
  guestEmail: string;
  action: "cancel" | "view";
  exp: number;
}

export function createLookupToken(payload: {
  bookingId: string;
  bookingNumber: string;
  guestEmail: string;
  action: "cancel" | "view";
  expiresInSeconds?: number;
}): string {
  const exp = Math.floor(Date.now() / 1000) + (payload.expiresInSeconds || 86400);
  const data: TokenPayload = {
    bookingId: payload.bookingId,
    bookingNumber: payload.bookingNumber,
    guestEmail: payload.guestEmail.toLowerCase(),
    action: payload.action,
    exp,
  };

  const bodyBase64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET).update(bodyBase64).digest("base64url");
  return `${bodyBase64}.${signature}`;
}

export function verifyLookupToken(token: string, expectedAction?: "cancel" | "view"): TokenPayload {
  if (!token || !token.includes(".")) {
    throw new UnauthorizedError("Invalid token format");
  }

  const [bodyBase64, signature] = token.split(".");
  const expectedSig = createHmac("sha256", TOKEN_SECRET).update(bodyBase64).digest("base64url");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new UnauthorizedError("Invalid token signature");
  }

  const data: TokenPayload = JSON.parse(Buffer.from(bodyBase64, "base64url").toString("utf8"));

  const nowSec = Math.floor(Date.now() / 1000);
  if (data.exp < nowSec) {
    throw new UnauthorizedError("Token has expired");
  }

  if (expectedAction && data.action !== expectedAction) {
    throw new UnauthorizedError("Invalid or mismatched token action");
  }

  return data;
}
