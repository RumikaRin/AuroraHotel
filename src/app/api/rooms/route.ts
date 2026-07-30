import { db } from "../../../lib/db.ts";

export async function GET() {
  try {
    const queryPromise = db.roomCategory.findMany({
      where: { isActive: true },
      include: {
        ratePlans: { where: { isActive: true } },
      },
      orderBy: { basePrice: "asc" },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 2000),
    );
    const categories = await Promise.race([queryPromise, timeoutPromise]);
    return Response.json({ success: true, data: categories });
  } catch (error) {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEMO_MODE === "true"
    ) {
      console.warn("[DEMO_MODE] Database query failed, returning fallback mock rooms");
      const mockCategories = [
        {
          id: "cat-1",
          name: "Deluxe Ocean View",
          slug: "deluxe-ocean-view",
          basePrice: 2500000,
          ratePlans: [
            {
              id: "rp-1",
              name: "Flexible Rate with Breakfast",
              multiplier: 1.0,
            },
          ],
        },
      ];
      return Response.json({ success: true, data: mockCategories });
    }

    console.error("[DATABASE_ERROR] Failed to fetch rooms:", error instanceof Error ? error.message : String(error));
    return Response.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to retrieve room categories",
        },
      },
      { status: 500 },
    );
  }
}
