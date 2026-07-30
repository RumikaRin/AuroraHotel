import { db as defaultDb } from "../lib/db.ts";

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
      payload: params.payload as any,
      status: "PENDING",
    },
  });
}
