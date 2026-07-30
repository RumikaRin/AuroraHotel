import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(
  rawPayload: Buffer,
  signatureHex: string,
  secret: string,
): boolean {
  if (!/^[a-f0-9]+$/iu.test(signatureHex) || signatureHex.length % 2 !== 0) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawPayload).digest();
  const received = Buffer.from(signatureHex, "hex");
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(expected, received);
}

export interface WebhookReplayStore {
  claim(eventId: string): Promise<{ claimed: boolean }>;
}

export async function claimWebhookEvent(
  store: WebhookReplayStore,
  eventId: string,
): Promise<void> {
  if (!eventId.trim()) {
    throw new Error("Webhook event ID is required");
  }
  const result = await store.claim(eventId);
  if (!result.claimed) {
    throw new Error("Webhook event was already processed");
  }
}
