import { verifyCronSecret } from "../../../../../server/cron/cron-auth.ts";
import { processOutboxMessages } from "../../../../../services/outbox.service.ts";
import { releaseAvailability } from "../../../../../services/availability.service.ts";
import { db } from "../../../../../lib/db.ts";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!verifyCronSecret(authHeader, process.env.CRON_SECRET)) {
    return Response.json({ success: false, error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    // 1. Process outbox email queue with atomic claim/lease
    const outboxResult = await processOutboxMessages(20);

    // 2. Release ONLY actually expired pending booking holds (30-min expiration limit)
    const holdExpirationCutoff = new Date(Date.now() - 30 * 60 * 1000);
    const expiredBookings = await db.booking.findMany({
      where: {
        status: "PENDING_PAYMENT",
        createdAt: { lt: holdExpirationCutoff },
      },
      take: 50,
    });

    let releasedHoldsCount = 0;
    for (const bk of expiredBookings) {
      const { count } = await db.booking.updateMany({
        where: { id: bk.id, status: "PENDING_PAYMENT" },
        data: { status: "CANCELLED" },
      });
      if (count === 1) {
        await releaseAvailability(
          {
            roomCategoryId: bk.roomCategoryId,
            checkIn: bk.checkIn,
            checkOut: bk.checkOut,
          },
          db
        );
        releasedHoldsCount++;
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      outbox: outboxResult,
      releasedHoldsCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Maintenance job failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
