import { db } from "@/lib/db";

export async function extendAvailabilityWindow(daysToMaintain = 90, client = db) {
  const categories = await client.roomCategory.findMany({ where: { isActive: true } });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const targetEndDate = new Date(today);
  targetEndDate.setUTCDate(today.getUTCDate() + daysToMaintain);

  let createdCount = 0;

  for (const cat of categories) {
    for (
      const d = new Date(today);
      d <= targetEndDate;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const dateCopy = new Date(d);
      const existing = await client.dayAvailability.findUnique({
        where: {
          roomCategoryId_date: {
            roomCategoryId: cat.id,
            date: dateCopy,
          },
        },
      });

      if (!existing) {
        await client.dayAvailability.create({
          data: {
            roomCategoryId: cat.id,
            date: dateCopy,
            totalInventory: 10,
            bookedCount: 0,
            holdCount: 0,
            blockedCount: 0,
            version: 0,
          },
        });
        createdCount++;
      }
    }
  }

  return { success: true, createdEntries: createdCount };
}
