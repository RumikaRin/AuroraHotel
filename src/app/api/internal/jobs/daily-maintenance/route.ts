import { verifyCronSecret } from "../../../../../server/cron/cron-auth.ts";
import { processOutboxMessages } from "../../../../../services/outbox.service.ts";
import { db } from "../../../../../lib/db.ts";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!verifyCronSecret(authHeader, process.env.CRON_SECRET)) {
    return Response.json({ success: false, error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const outboxResult = await processOutboxMessages(20);

    const now = new Date();
    const releasedHolds = await db.dayAvailability.updateMany({
      where: {
        holdCount: { gt: 0 },
      },
      data: {
        holdCount: 0,
      },
    });

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      outbox: outboxResult,
      releasedHoldsCount: releasedHolds.count,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Maintenance job failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
