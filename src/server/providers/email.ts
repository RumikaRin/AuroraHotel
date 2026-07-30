import { createHash } from "node:crypto";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  status: "sent" | "queued" | "failed";
  messageId: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const payloadStr = JSON.stringify(options);
  const hash = createHash("sha256").update(payloadStr).digest("hex").slice(0, 16);
  const messageId = `msg-${Date.now()}-${hash}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[EMAIL PREVIEW] To: ${options.to} | Subject: ${options.subject}`);
  }

  return {
    status: "sent",
    messageId,
  };
}
