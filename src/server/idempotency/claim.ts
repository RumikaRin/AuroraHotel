export interface IdempotencyRecord<Result> {
  key: string;
  requestHash: string;
  result: Result | null;
}

export interface IdempotencyStore<Result> {
  find(key: string): Promise<IdempotencyRecord<Result> | null>;
  create(input: { key: string; requestHash: string }): Promise<void>;
}

export class IdempotencyConflictError extends Error {}

export async function claimIdempotencyKey<Result>(
  store: IdempotencyStore<Result>,
  input: { key: string; requestHash: string },
): Promise<{ replay: false } | { replay: true; result: Result }> {
  const existing = await store.find(input.key);
  if (existing) {
    if (existing.requestHash !== input.requestHash) {
      throw new IdempotencyConflictError(
        "The idempotency key was already used with a different payload",
      );
    }
    if (existing.result === null) {
      throw new IdempotencyConflictError(
        "The idempotent operation is still in progress",
      );
    }
    return { replay: true, result: existing.result };
  }

  // The adapter must enforce a unique constraint on key and translate a
  // concurrent unique violation into a retry of this claim operation.
  await store.create(input);
  return { replay: false };
}
