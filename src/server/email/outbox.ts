export interface EmailOutboxMessage {
  deduplicationKey: string;
  recipient: string;
  templateId: string;
  payload: Record<string, unknown>;
}

export interface EmailOutboxTransaction {
  enqueueUnique(message: EmailOutboxMessage): Promise<{ created: boolean }>;
}

export async function enqueueEmail(
  transaction: EmailOutboxTransaction,
  message: EmailOutboxMessage,
): Promise<{ replay: boolean }> {
  if (!message.deduplicationKey.trim() || !message.recipient.trim()) {
    throw new Error("Email outbox identity fields are required");
  }
  const result = await transaction.enqueueUnique(message);
  return { replay: !result.created };
}
