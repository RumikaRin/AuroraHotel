import type { NextRequest } from "next/server";
import { db } from "../../../../lib/db.ts";
import { verifyCronSecret } from "../../../../server/cron/cron-auth.ts";

export const dynamic = "force-dynamic";

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
