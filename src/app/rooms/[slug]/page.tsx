import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EditorialHeader } from "@/components/layout/EditorialHeader";
import { EditorialFooter } from "@/components/layout/EditorialFooter";
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
    <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] flex flex-col font-sans">
      <EditorialHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex-1 w-full space-y-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[var(--text-muted)] flex gap-2 items-center">
          <Link href="/" className="hover:text-[var(--accent-brass)]">Trang Chủ</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:text-[var(--accent-brass)]">Suites & Villas</Link>
          <span>/</span>
          <span className="text-[var(--accent-brass)] font-semibold">{category.name}</span>
        </nav>

        {/* Room Header */}
        <div className="space-y-4">
          <span className="text-xs text-[var(--accent-brass)] font-bold uppercase tracking-wider">HẠNG PHÒNG NGHỈ DƯỠNG</span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[var(--text-primary)]">{category.name}</h1>
          <p className="max-w-3xl text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-surface overflow-hidden border border-[var(--brass-hairline)]">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8 border-t border-[var(--brass-hairline)]">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-3 gap-4 p-6 bg-[var(--bg-surface-card)] rounded-surface border border-[var(--brass-hairline)]">
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Diện tích</span>
                <strong className="text-lg text-[var(--text-primary)]">{category.sizeSqm} m²</strong>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Sức chứa</span>
                <strong className="text-lg text-[var(--text-primary)]">Tối đa {category.maxOccupancy} khách</strong>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Giường</span>
                <strong className="text-lg text-[var(--text-primary)]">{category.bedConfiguration}</strong>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif-luxury text-2xl font-bold text-[var(--text-primary)]">Tiện Nghi Đẳng Cấp</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                {amenities.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-[var(--accent-brass)]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rate Plan & Booking CTA */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-surface-card)] p-6 rounded-surface border border-[var(--brass-hairline)] shadow-xl space-y-6">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Giá tiêu chuẩn mỗi đêm</span>
                <div className="text-3xl font-serif-luxury font-bold text-[var(--accent-brass)]">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(category.basePrice)}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Gói giá có sẵn:</span>
                {category.ratePlans.map((rp) => (
                  <div key={rp.id} className="p-3 border border-[var(--brass-hairline)] bg-[var(--bg-surface)] rounded-control space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[var(--text-primary)]">{rp.name}</span>
                      <span className="text-[var(--accent-brass)] font-mono">
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
                className="w-full min-h-[48px] bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-bright)] text-[#110e0c] font-bold text-xs uppercase tracking-wider rounded-control flex items-center justify-center transition-all cursor-pointer shadow-lg"
              >
                Đặt Phòng Ngay
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface-card)]/95 backdrop-blur-md border-t border-[var(--brass-hairline)] px-5 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Giá từ / đêm</span>
          <div className="text-lg font-serif-luxury font-bold text-[var(--accent-brass)]">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(category.basePrice)}
          </div>
        </div>
        <Link
          href={`/booking?${bookingQuery.toString()}`}
          className="min-h-[44px] px-6 bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-bright)] text-[#110e0c] font-bold text-xs uppercase tracking-wider rounded-control flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          Đặt Phòng Ngay →
        </Link>
      </div>

      <EditorialFooter />
    </div>
  );
}
