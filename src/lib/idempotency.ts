// Idempotency helpers, copied from FLOF src/lib/idempotency.ts.
//
// PURE LIB RULE: exercised by "node --test" (no "@/" alias), so only
// bare/relative imports are allowed here.

import { createHash } from "node:crypto";

/**
 * Stable hash of the request body. Two retries of the same logical request
 * produce the same hash; a reused Idempotency-Key with a different hash is
 * rejected with 409 by the checkout service.
 */
export function hashCheckoutRequest(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

/**
 * Keys are client-generated (e.g. crypto.randomUUID()). Length bounds keep
 * trivially guessable keys and abusive megabyte-sized keys out of the DB.
 */
export function isValidIdempotencyKey(value: string | null) {
  return Boolean(value && value.length >= 16 && value.length <= 200);
}
