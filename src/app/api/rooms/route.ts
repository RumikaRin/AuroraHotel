import { db } from "../../../lib/db.ts";

export async function GET() {
  try {
    const categories = await db.roomCategory.findMany({
      where: { isActive: true },
      include: {
        ratePlans: { where: { isActive: true } },
      },
      orderBy: { basePrice: "asc" },
    });

    return Response.json({ success: true, data: categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
