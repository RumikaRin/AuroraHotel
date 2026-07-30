export interface SessionRecord {
  id: string;
  userId: string;
  sessionVersion: number;
  expiresAt: Date;
  revokedAt: Date | null;
}

export class InvalidSessionError extends Error {}

export function assertSessionActive(
  record: SessionRecord | null,
  presentedVersion: number,
  now = new Date(),
): asserts record is SessionRecord {
  if (
    record === null ||
    record.revokedAt !== null ||
    record.expiresAt.getTime() <= now.getTime() ||
    record.sessionVersion !== presentedVersion
  ) {
    throw new InvalidSessionError("Session is expired, revoked, or stale");
  }
}
