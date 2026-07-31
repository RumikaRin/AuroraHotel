import { db } from "@/lib/db.ts";
import { toApiErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    return Response.json({ success: true, data: services });
  } catch (error) {
    return toApiErrorResponse(new Request("http://localhost"), error);
  }
}
