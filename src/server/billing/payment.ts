export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface PaymentRecord {
  id: string;
  amountMinor: bigint;
  currency: string;
  status: PaymentStatus;
}

export interface PaymentTransitionStore {
  findById(id: string): Promise<PaymentRecord | null>;
  updatePendingToPaid(input: {
    id: string;
    amountMinor: bigint;
    currency: string;
    providerReference: string;
  }): Promise<{ count: number }>;
}

export class PaymentVerificationError extends Error {}
export class PaymentConflictError extends Error {}

export async function markPaymentPaid(
  store: PaymentTransitionStore,
  input: {
    paymentId: string;
    amountMinor: bigint;
    currency: string;
    providerReference: string;
    signatureValid: boolean;
    providerSucceeded: boolean;
  },
): Promise<void> {
  if (!input.signatureValid || !input.providerSucceeded) {
    throw new PaymentVerificationError("Payment callback is not verified");
  }

  const payment = await store.findById(input.paymentId);
  if (
    payment === null ||
    payment.amountMinor !== input.amountMinor ||
    payment.currency !== input.currency
  ) {
    throw new PaymentVerificationError("Payment amount or currency mismatch");
  }

  const result = await store.updatePendingToPaid({
    id: input.paymentId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    providerReference: input.providerReference,
  });
  if (result.count !== 1) {
    throw new PaymentConflictError("Payment state changed concurrently");
  }
}
