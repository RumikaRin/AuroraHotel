import crypto from "node:crypto";
import { db as defaultDb } from "../lib/db.ts";
import { sendPreviewEmail } from "../server/providers/email.ts";
import { ValidationError } from "../domain/errors.ts";

export interface RecordOutboxParams {
  type: string;
  payload: Record<string, unknown>;
}

export async function recordEmailOutbox(
  params: RecordOutboxParams,
  client = defaultDb,
) {
  if (!params.payload || typeof params.payload.guestEmail !== "string" || !params.payload.guestEmail.trim()) {
    throw new ValidationError("Outbox email payload must contain a valid guestEmail string");
  }

  return client.emailOutbox.create({
    data: {
      type: params.type,
      payload: JSON.parse(JSON.stringify(params.payload)),
      status: "PENDING",
    },
  });
}

export async function processOutboxMessages(
  limit = 20,
  client = defaultDb,
) {
  const workerId = `worker-${crypto.randomUUID()}`;

  const candidates = await client.emailOutbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: 5 },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let processed = 0;
  for (const message of candidates) {
    const claimed = await client.emailOutbox.updateMany({
      where: {
        id: message.id,
        status: { in: ["PENDING", "FAILED"] },
      },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
      },
    });

    if (claimed.count !== 1) {
      continue;
    }

    try {
      const payload = message.payload as Record<string, unknown>;
      if (!payload.guestEmail || typeof payload.guestEmail !== "string") {
        throw new ValidationError("Missing guestEmail in outbox message payload");
      }

      const toEmail = payload.guestEmail;
      const subject = `Aurora Hotel Notification: ${message.type}`;
      const body = JSON.stringify(payload, null, 2);

      const result = await sendPreviewEmail({ to: toEmail, subject, body });
      if (!result || result.status === "failed") {
        throw new Error("Provider delivery failed");
      }

      await client.emailOutbox.updateMany({
        where: { id: message.id, status: "PROCESSING" },
        data: {
          status: "SENT",
        },
      });
      processed++;
    } catch (err: unknown) {
      const attempts = message.attempts + 1;
      const newStatus = attempts >= 5 ? "DEAD_LETTER" : "FAILED";
      const errorMessage = err instanceof Error ? err.message : String(err);
      await client.emailOutbox.updateMany({
        where: { id: message.id, status: "PROCESSING" },
        data: {
          status: newStatus,
          lastError: errorMessage,
        },
      });
    }
  }

  return { total: candidates.length, processed, workerId };
}
