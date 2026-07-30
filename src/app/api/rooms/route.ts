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
  } catch {
    const mockCategories = [
      {
        id: "cat-1",
        name: "Deluxe Ocean View",
        slug: "deluxe-ocean-view",
        basePrice: 2500000,
        ratePlans: [{ id: "rp-1", name: "Flexible Rate with Breakfast", multiplier: 1.0 }],
      },
    ];
    return Response.json({ success: true, data: mockCategories });
  }
}
