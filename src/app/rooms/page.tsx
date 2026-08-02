import { db } from "@/lib/db";
import { RoomsClient, RoomCategoryData } from "./RoomsClient";

export const dynamic = "force-dynamic";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  let categories: RoomCategoryData[] = [];

  try {
    const dbCategories = await db.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });

    categories = dbCategories.map((c) => {
      const amenitiesArr = Array.isArray(c.amenities)
        ? (c.amenities as string[])
        : typeof c.amenities === "string"
        ? JSON.parse(c.amenities)
        : [];

      const imagesArr = Array.isArray(c.images)
        ? (c.images as string[])
        : typeof c.images === "string"
        ? JSON.parse(c.images)
        : ["/images/aurora/deluxe-king.jpg"];

      const isOcean = c.slug.includes("ocean") || c.slug.includes("presidential") || c.slug.includes("executive");
      const isGarden = c.slug.includes("garden") || c.slug.includes("family");
      const viewType = isOcean ? "OCEAN" : isGarden ? "GARDEN" : "CITY";

      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        basePrice: c.basePrice,
        maxOccupancy: c.maxOccupancy,
        areaSqM: c.sizeSqm,
        bedConfig: c.bedConfiguration,
        viewType,
        image: imagesArr[0] || "/images/aurora/deluxe-king.jpg",
        gallery: imagesArr.length > 1 ? imagesArr : [imagesArr[0] || "/images/aurora/deluxe-king.jpg", "/images/aurora/hero-01.jpg", "/images/aurora/hero-02.jpg"],
        amenities: amenitiesArr,
      };
    });
  } catch {
    // Fallback data if DB query fails in preview/demo mode
    categories = [
      {
        id: "cat-deluxe-king",
        slug: "deluxe-ocean-king",
        name: "Deluxe Ocean King",
        description: "Phòng Deluxe cao cấp hướng biển với giường King sang trọng, ban công riêng biệt ngắm bình minh trên vịnh.",
        basePrice: 2500000,
        maxOccupancy: 2,
        areaSqM: 45,
        bedConfig: "1 King Bed",
        viewType: "OCEAN",
        image: "/images/aurora/deluxe-king.jpg",
        gallery: ["/images/aurora/deluxe-king.jpg", "/images/aurora/hero-01.jpg", "/images/aurora/hero-02.jpg"],
        amenities: ["Ocean View", "Private Balcony", "High-speed Wi-Fi", "Espresso Machine", "Marble Bathroom"],
      },
      {
        id: "cat-executive-suite",
        slug: "executive-bay-suite",
        name: "Executive Bay Suite",
        description: "Không gian sang trọng bậc nhất với phòng khách riêng biệt, tầm nhìn 180 độ ra đại dương và dịch vụ Club Lounge.",
        basePrice: 4200000,
        maxOccupancy: 3,
        areaSqM: 75,
        bedConfig: "1 Super King Bed",
        viewType: "OCEAN",
        image: "/images/aurora/executive-suite.jpg",
        gallery: ["/images/aurora/executive-suite.jpg", "/images/aurora/hero-03.jpg", "/images/aurora/hero-01.jpg"],
        amenities: ["Panaroma Ocean View", "Living Room", "Club Lounge Access", "Jacuzzi", "24/7 Butler"],
      },
    ];
  }

  const query = (await searchParams) || {};
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

  return (
    <RoomsClient
      initialCategories={categories}
      searchContext={{
        checkIn: first(query.checkIn),
        checkOut: first(query.checkOut),
        guests: first(query.guests),
      }}
    />
  );
}
