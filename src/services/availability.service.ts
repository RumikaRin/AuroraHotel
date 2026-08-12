import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, ValidationError } from "../domain/errors.ts";

export interface ReserveParams {
  roomCategoryId: string;
  checkIn: string | Date;
  checkOut: string | Date;
}

export function parseDates(checkIn: string | Date, checkOut: string | Date) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError("Invalid check-in or check-out date");
  }

  const diffMs = end.getTime() - start.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    throw new ValidationError("Check-out date must be after check-in date");
  }

  const dates: Date[] = [];
  for (let i = 0; i < nights; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d);
  }

  return { start, end, nights, dates };
}

export async function searchAvailableCategories(
  checkIn: string | Date,
  checkOut: string | Date,
  numGuests = 1,
  client = defaultDb,
) {
  const { nights, dates } = parseDates(checkIn, checkOut);

  const categories = await client.roomCategory.findMany({
    where: {
      isActive: true,
      maxOccupancy: { gte: numGuests },
    },
    include: {
      ratePlans: { where: { isActive: true } },
    },
  });

  const available: Array<{
    category: typeof categories[0];
    minAvailableCount: number;
  }> = [];

  for (const cat of categories) {
    const availabilities = await client.dayAvailability.findMany({
      where: {
        roomCategoryId: cat.id,
        date: { in: dates },
      },
    });

    if (availabilities.length < nights) {
      continue;
    }

    let minRemaining = Infinity;
    for (const da of availabilities) {
      const remaining = da.totalInventory - da.bookedCount - da.holdCount - da.blockedCount;
      if (remaining < minRemaining) {
        minRemaining = remaining;
      }
    }

    if (minRemaining > 0 && minRemaining !== Infinity) {
      available.push({
        category: cat,
        minAvailableCount: minRemaining,
      });
    }
  }

  return available;
}

export const checkAvailability = searchAvailableCategories;


export async function reserveAvailability(
  params: ReserveParams,
  client = defaultDb,
) {
  const { dates } = parseDates(params.checkIn, params.checkOut);

  const availabilities = await client.dayAvailability.findMany({
    where: {
      roomCategoryId: params.roomCategoryId,
      date: { in: dates },
    },
  });

  if (availabilities.length < dates.length) {
    throw new ConflictError("Room category has no inventory configured for selected dates");
  }

  for (const da of availabilities) {
    const available = da.totalInventory - da.bookedCount - da.holdCount - da.blockedCount;
    if (available < 1) {
      throw new ConflictError(`Room no longer available for date ${da.date.toISOString().slice(0, 10)}`);
    }

    const updated = await client.dayAvailability.updateMany({
      where: {
        id: da.id,
        version: da.version,
        bookedCount: { lte: da.totalInventory - 1 },
      },
      data: {
        bookedCount: { increment: 1 },
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConflictError("Concurrent reservation conflict. Please retry.");
    }
  }

  return { success: true, reservedNights: dates.length };
}

export async function releaseAvailability(
  params: ReserveParams,
  client = defaultDb,
) {
  const { dates } = parseDates(params.checkIn, params.checkOut);

  const availabilities = await client.dayAvailability.findMany({
    where: {
      roomCategoryId: params.roomCategoryId,
      date: { in: dates },
    },
  });

  for (const da of availabilities) {
    if (da.bookedCount > 0) {
      await client.dayAvailability.updateMany({
        where: { id: da.id },
        data: {
          bookedCount: { decrement: 1 },
          version: { increment: 1 },
        },
      });
    }
  }

  return { success: true };
}
