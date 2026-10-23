import { notFound } from "next/navigation";
import Link from "next/link";
import { EditorialHeader } from "@/components/layout/EditorialHeader";
import { EditorialFooter } from "@/components/layout/EditorialFooter";
import { RoomDetailGallery } from "@/components/rooms/RoomDetailGallery";
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex-1 w-full space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-[var(--text-muted)] flex gap-2 items-center">
          <Link href="/" className="hover:text-[var(--accent-brass)] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:text-[var(--accent-brass)] transition-colors">Suites & Villas</Link>
          <span>/</span>
          <span className="text-[var(--accent-brass)] font-semibold">{category.name}</span>
        </nav>

        {/* Room Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--accent-brass)] font-bold uppercase tracking-widest">HẠNG PHÒNG NGHỈ DƯỠNG</span>
            <span className="text-[var(--brass-hairline)]">|</span>
            <span className="text-xs text-[var(--text-muted)]">Kiến trúc Á Đông đương đại</span>
          </div>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[var(--text-primary)]">{category.name}</h1>
          <p className="max-w-3xl text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Interactive Image Gallery with Lightbox */}
        <RoomDetailGallery roomName={category.name} images={images} />

        {/* Specifications & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4 border-t border-[var(--brass-hairline)]">
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-[var(--bg-surface-card)] rounded-surface border border-[var(--brass-hairline)] shadow-sm">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Diện tích</span>
                <strong className="text-lg sm:text-xl font-serif-luxury text-[var(--text-primary)]">{category.sizeSqm} m²</strong>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Sức chứa</span>
                <strong className="text-lg sm:text-xl font-serif-luxury text-[var(--text-primary)]">Tối đa {category.maxOccupancy} khách</strong>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Bố trí giường</span>
                <strong className="text-lg sm:text-xl font-serif-luxury text-[var(--text-primary)]">{category.bedConfiguration}</strong>
              </div>
            </div>

            {/* Exclusive Privileges */}
            <div className="p-6 bg-[var(--bg-card)] rounded-surface border border-[var(--brass-hairline)] space-y-4">
              <span className="text-xs font-bold text-[var(--accent-brass)] uppercase tracking-widest block">ĐẶC QUYỀN RIÊNG BIỆT</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                <div className="flex items-start gap-2.5">
                  <span className="text-[var(--accent-brass)] text-base font-serif">✦</span>
                  <span>Trà chiều hoàng hôn & bánh mộc bản địa tại sảnh VIP</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[var(--accent-brass)] text-base font-serif">✦</span>
                  <span>Miễn phí hồ bơi vô cực khoáng mặn hướng thẳng biển</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[var(--accent-brass)] text-base font-serif">✦</span>
                  <span>Ưu tiên nhận phòng sớm & trả phòng muộn linh hoạt</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[var(--accent-brass)] text-base font-serif">✦</span>
                  <span>Quản gia riêng hỗ trợ đặt dịch vụ ẩm thực & xe nội khu 24/7</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h2 className="font-serif-luxury text-2xl font-light text-[var(--text-primary)]">Tiện Nghi Đẳng Cấp</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                {amenities.map((item, index) => (
                  <li key={index} className="flex items-center gap-2.5 py-1.5 border-b border-[var(--brass-hairline)]/40">
                    <span className="text-[var(--accent-brass)] font-bold">✓</span>
                    <span className="text-[var(--text-primary)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verified Sanctuary Guest Impressions */}
            <div className="space-y-4 pt-6 border-t border-[var(--brass-hairline)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--accent-brass)] font-bold uppercase tracking-widest block">CẢM NHẬN KHÁCH HÀNG</span>
                  <h3 className="font-serif-luxury text-2xl font-light text-[var(--text-primary)]">Dấu Ấn Kỷ Niệm</h3>
                </div>
                <div className="flex items-center gap-1 text-[var(--accent-brass)] text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  <span className="ml-1 text-xs text-[var(--text-muted)] font-mono">(4.9/5)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <blockquote className="p-5 rounded-control bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] space-y-3">
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    &ldquo;Không gian tĩnh lặng và thanh bình đến ngỡ ngàng. Đứng từ ban công ngắm bình minh trên biển Đà Nẵng là khoảnh khắc đẹp nhất chuyến đi.&rdquo;
                  </p>
                  <footer className="text-[11px] text-[var(--text-muted)] flex items-center justify-between pt-2 border-t border-[var(--brass-hairline)]/40">
                    <span className="font-semibold text-[var(--text-primary)]">Nguyễn Phương Thảo</span>
                    <span className="text-[var(--accent-brass)]">Kỳ nghỉ tháng 10/2026</span>
                  </footer>
                </blockquote>

                <blockquote className="p-5 rounded-control bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] space-y-3">
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    &ldquo;Giường đệm lông ngỗng cực kỳ thoải mái và dịch vụ chu đáo đến từng chi tiết nhỏ. Chắc chắn gia đình tôi sẽ quay lại.&rdquo;
                  </p>
                  <footer className="text-[11px] text-[var(--text-muted)] flex items-center justify-between pt-2 border-t border-[var(--brass-hairline)]/40">
                    <span className="font-semibold text-[var(--text-primary)]">David & Elena Miller</span>
                    <span className="text-[var(--accent-brass)]">Du khách quốc tế</span>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Rate Plan & Booking CTA Sticky Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-[var(--bg-surface-card)] p-6 rounded-surface border border-[var(--brass-hairline)] shadow-xl space-y-6">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Giá tốt nhất từ</span>
                <div className="text-3xl font-serif-luxury font-bold text-[var(--accent-brass)]">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(category.basePrice)}
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">Chưa bao gồm thuế và phí dịch vụ resort</span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Gói giá phòng có sẵn:</span>
                {category.ratePlans.map((rp) => (
                  <div key={rp.id} className="p-3.5 border border-[var(--brass-hairline)] bg-[var(--bg-surface)] rounded-control space-y-1.5 transition-colors hover:border-[var(--accent-brass)]">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[var(--text-primary)]">{rp.name}</span>
                      <span className="text-[var(--accent-brass)] font-mono">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          Math.round(category.basePrice * Number(rp.priceMultiplier))
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {Number(rp.priceMultiplier) <= 1 ? "Bao gồm ăn sáng & hủy phòng miễn phí trước 48h" : "Gói linh hoạt bao gồm trải nghiệm ẩm thực tối"}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={`/booking?${bookingQuery.toString()}`}
                className="w-full min-h-[48px] bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-bright)] text-[#110e0c] font-bold text-xs uppercase tracking-widest rounded-control flex items-center justify-center transition-all cursor-pointer shadow-lg hover:shadow-xl hover:translate-y-[-1px]"
              >
                Đặt Phòng Ngay
              </Link>

              <div className="text-center pt-2">
                <span className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                  <span className="text-[var(--accent-brass)]">🔒</span>
                  <span>Đảm bảo giá trực tiếp tốt nhất từ khách sạn</span>
                </span>
              </div>
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
