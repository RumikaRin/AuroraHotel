import { db as defaultDb } from "../lib/db.ts";
import { sendPreviewEmail } from "../server/providers/email.ts";

export interface RecordOutboxParams {
  type: string;
  payload: Record<string, unknown>;
}

export async function recordEmailOutbox(
  params: RecordOutboxParams,
  client = defaultDb,
) {
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
  const pendingMessages = await client.emailOutbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: 5 },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let processed = 0;
  for (const message of pendingMessages) {
    try {
      const payload = message.payload as Record<string, unknown>;
      const toEmail = (payload.guestEmail as string) || "guest@aurorahotel.com";
      const subject = `Aurora Hotel Notification: ${message.type}`;
      const body = JSON.stringify(payload, null, 2);

      await sendPreviewEmail({ to: toEmail, subject, body });

      await client.emailOutbox.update({
        where: { id: message.id },
        data: {
          status: "SENT",
          attempts: message.attempts + 1,
        },
      });
      processed++;
    } catch (err: unknown) {
      const attempts = message.attempts + 1;
      const newStatus = attempts >= 5 ? "DEAD_LETTER" : "FAILED";
      const errorMessage = err instanceof Error ? err.message : String(err);
      await client.emailOutbox.update({
        where: { id: message.id },
        data: {
          status: newStatus,
          attempts,
          lastError: errorMessage,
        },
      });
    }
  }

  return { total: pendingMessages.length, processed };
}

