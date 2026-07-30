import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "../../../../lib/db.ts";

export const dynamic = "force-dynamic";

export function verifyCronSecret(
  authHeader: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!authHeader || !expectedSecret) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1];

  try {
    const tokenBuf = Buffer.from(token, "utf8");
    const expectedBuf = Buffer.from(expectedSecret, "utf8");
    if (tokenBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!verifyCronSecret(authHeader, cronSecret)) {
    return Response.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  const pendingOutbox = await db.emailOutbox.findMany({
    where: { status: "PENDING" },
    take: 50,
  });

  let processedCount = 0;
  for (const item of pendingOutbox) {
    await db.emailOutbox.update({
      where: { id: item.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });
    processedCount++;
  }

  return Response.json({
    success: true,
    processedOutboxCount: processedCount,
    timestamp: new Date().toISOString(),
  });
}
