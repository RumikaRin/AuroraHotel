import { createHmac, timingSafeEqual } from "node:crypto";

export interface MockPaymentOptions {
  amount: number;
  currency: string;
  bookingNumber: string;
  method: string;
  idempotencyKey?: string;
}

export interface MockPaymentResult {
  status: "PAID" | "FAILED" | "PENDING";
  transactionRef: string;
  gatewayPayload: Record<string, unknown>;
}

export async function processMockPayment(
  options: MockPaymentOptions,
): Promise<MockPaymentResult> {
  const timestamp = Date.now();
  const transactionRef = `TXN-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    status: "PAID",
    transactionRef,
    gatewayPayload: {
      provider: "mock-payment-gateway",
      amount: options.amount,
      currency: options.currency,
      bookingNumber: options.bookingNumber,
      method: options.method,
      transactionRef,
      processedAt: new Date(timestamp).toISOString(),
    },
  };
}

export function verifyPaymentWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  if (!rawBody || !signatureHeader || !secret) return false;
  try {
    const expectedSig = createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signatureHeader, "utf8");
    const expectedBuffer = Buffer.from(expectedSig, "utf8");
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
