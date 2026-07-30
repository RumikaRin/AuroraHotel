import { db } from "../../../../lib/db.ts";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection error";
    return Response.json(
      { status: "not_ready", error: message },
      { status: 503 }
    );
  }
}
