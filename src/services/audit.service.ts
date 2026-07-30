import { db as defaultDb } from "../lib/db.ts";
import { type AuditAction } from "../domain/contracts.ts";

export interface RecordAuditParams {
  actorId?: string;
  bookingId?: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(
  params: RecordAuditParams,
  client = defaultDb,
) {
  return client.auditLog.create({
    data: {
      actorId: params.actorId,
      bookingId: params.bookingId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: params.payload as any,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
