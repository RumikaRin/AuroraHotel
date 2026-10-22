import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await db.roomCategory.findUnique({
      where: { slug, isActive: true },
    });
    if (!category) return { title: "Room Not Found | Aurora Hotel" };

    return {
      title: `${category.name} | Aurora Hotel`,
      description: category.description.slice(0, 160),
    };
  } catch {
    return { title: "Chi tiết hạng phòng | Aurora Hotel" };
  }
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  let category = null;
  try {
    category = await db.roomCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        ratePlans: { where: { isActive: true } },
      },
    });
  } catch (error) {
    console.warn(`[RoomDetailPage] DB lookup failed for slug: ${slug}`, error);
  }

  if (!category) {
    notFound();
  }

  const amenities = Array.isArray(category.amenities)
    ? (category.amenities as string[])
    : [];
  const images = Array.isArray(category.images)
    ? (category.images as string[])
    : ["/images/aurora/deluxe-king.jpg"];

  const checkIn = typeof search.checkIn === "string" ? search.checkIn : "";
  const checkOut = typeof search.checkOut === "string" ? search.checkOut : "";
  const guests = typeof search.guests === "string" ? search.guests : "2";

  const bookingQuery = new URLSearchParams();
  bookingQuery.set("roomCategoryId", category.id);
  if (checkIn) bookingQuery.set("checkIn", checkIn);
  if (checkOut) bookingQuery.set("checkOut", checkOut);
  if (guests) bookingQuery.set("guests", guests);

  return (
    <div className="min-h-screen bg-aurora-ivory text-aurora-espresso flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-aurora-taupe flex gap-2 items-center">
          <Link href="/" className="hover:text-aurora-brass">Trang Chủ</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:text-aurora-brass">Hạng Phòng</Link>
          <span>/</span>
          <span className="text-aurora-espresso font-semibold">{category.name}</span>
        </nav>

        {/* Room Header */}
        <div className="space-y-4">
          <span className="text-xs text-aurora-brass font-bold uppercase tracking-wider">HẠNG PHÒNG NGHỈ DƯỠNG</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-light text-aurora-espresso">{category.name}</h1>
          <p className="max-w-3xl text-sm sm:text-base text-aurora-taupe leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-surface overflow-hidden">
          <div className="md:col-span-2 relative h-[360px] sm:h-[480px]">
            <Image
              src={images[0] || "/images/aurora/deluxe-king.jpg"}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative h-[170px] sm:h-[230px]">
                <Image
                  src={img}
                  alt={`${category.name} - view ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Specifications & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8 border-t border-aurora-mist">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-3 gap-4 p-6 bg-aurora-linen/40 rounded-surface border border-aurora-mist">
              <div>
                <span className="text-xs text-aurora-taupe block">Diện tích</span>
                <strong className="text-lg text-aurora-espresso">{category.sizeSqm} m²</strong>
              </div>
              <div>
                <span className="text-xs text-aurora-taupe block">Sức chứa</span>
                <strong className="text-lg text-aurora-espresso">Tối đa {category.maxOccupancy} khách</strong>
              </div>
              <div>
                <span className="text-xs text-aurora-taupe block">Giường</span>
                <strong className="text-lg text-aurora-espresso">{category.bedConfiguration}</strong>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif-luxury text-2xl font-bold">Tiện Nghi Đẳng Cấp</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-aurora-espresso">
                {amenities.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-aurora-brass">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rate Plan & Booking CTA */}
          <div className="space-y-6">
            <div className="bg-aurora-ivory p-6 rounded-surface border border-aurora-brass/40 shadow-sm space-y-6">
              <div>
                <span className="text-xs text-aurora-taupe">Giá tiêu chuẩn mỗi đêm</span>
                <div className="text-3xl font-serif-display font-bold text-aurora-espresso">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(category.basePrice)}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-aurora-walnut uppercase tracking-wider block">Gói giá có sẵn:</span>
                {category.ratePlans.map((rp) => (
                  <div key={rp.id} className="p-3 border border-aurora-mist rounded-control space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{rp.name}</span>
                      <span className="text-aurora-brass font-mono">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          Math.round(category.basePrice * Number(rp.priceMultiplier))
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/booking?${bookingQuery.toString()}`}
                className="w-full min-h-[48px] bg-aurora-espresso text-aurora-ivory font-bold text-xs uppercase tracking-wider rounded-control flex items-center justify-center hover:bg-aurora-walnut transition-all"
              >
                Đặt Phòng Ngay
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
