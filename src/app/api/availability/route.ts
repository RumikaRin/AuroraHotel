import { checkAvailability } from "../../../services/availability.service.ts";
import { z } from "zod";

const querySchema = z.object({
  checkIn: z.string().or(z.date()),
  checkOut: z.string().or(z.date()),
  roomCategoryId: z.string().optional(),
  guests: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkInStr = searchParams.get("checkIn") || new Date().toISOString().slice(0, 10);
    const checkOutStr = searchParams.get("checkOut") || new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const parsed = querySchema.parse({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      roomCategoryId: searchParams.get("roomCategoryId") || undefined,
      guests: searchParams.get("guests") || "1",
    });

    const results = await checkAvailability(
      parsed.checkIn,
      parsed.checkOut,
      parsed.guests
    );

    return Response.json({ success: true, data: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid parameters";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}
