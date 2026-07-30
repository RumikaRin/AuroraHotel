import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default async function HomePage() {
  let roomCategories: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    description: string;
    images: unknown;
    type?: string;
    amenities?: unknown;
  }> = [];
  try {
    const queryPromise = db.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500),
    );
    roomCategories = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ])) as typeof roomCategories;
  } catch {
    roomCategories = [
      {
        id: "cat-1",
        name: "Deluxe Ocean View",
        slug: "deluxe-ocean-view",
        basePrice: 2500000,
        description:
          "Phòng Deluxe sang trọng với tầm nhìn hướng biển tuyệt đẹp, thiết kế đương đại hòa quyện văn hóa Việt Nam.",
        images: [],
        type: "Deluxe",
        amenities: ["Ocean View", "King Bed", "Rain Shower"],
      },
      {
        id: "cat-2",
        name: "Executive Suite",
        slug: "executive-suite",
        basePrice: 4500000,
        description:
          "Căn hộ Suite đẳng cấp với không gian riêng biệt, phòng khách rộng rãi và tầm nhìn panoramic.",
        images: [],
        type: "Suite",
        amenities: ["Panoramic View", "Living Room", "Butler Service"],
      },
      {
        id: "cat-3",
        name: "Presidential Villa",
        slug: "presidential-villa",
        basePrice: 12000000,
        description:
          "Biệt thự riêng với hồ bơi vô cực, vườn nhiệt đới và dịch vụ quản gia 24/7.",
        images: [],
        type: "Villa",
        amenities: ["Private Pool", "Tropical Garden", "24/7 Butler"],
      },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-aurora-ivory text-aurora-midnight">
      <Header />

      <main>
        {/* ═══════════════════════════════════════════════════
            HERO — Cinematic full-width, ~85dvh on desktop
           ═══════════════════════════════════════════════════ */}
        <section className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-hotel.png"
              alt="Aurora Hotel — Contemporary luxury oceanfront resort at golden hour"
              fill
              priority
              className="object-cover animate-hero-ken"
              sizes="100vw"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-aurora-midnight/70 via-aurora-midnight/40 to-aurora-midnight/80" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-content-narrow mx-auto px-4 sm:px-6 lg:px-8 text-center text-aurora-ivory py-20">
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-aurora-gold font-semibold animate-fade-in-up">
              Contemporary Oceanfront Luxury
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mt-6 animate-fade-in-up delay-100">
              Trải Nghiệm
              <br />
              <span className="italic">Nghỉ Dưỡng Thượng Lưu</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-aurora-mist max-w-xl mx-auto font-light leading-relaxed mt-6 animate-fade-in-up delay-200">
              Không gian sang trọng tĩnh lặng bên bờ biển thơ mộng.
              <br className="hidden sm:block" />
              Nơi mỗi kỳ nghỉ trở thành kỷ niệm khó quên.
            </p>

            {/* Scroll indicator */}
            <div className="mt-12 animate-fade-in delay-500">
              <svg
                className="w-6 h-6 mx-auto text-aurora-gold/70 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            BOOKING BAR — Overlapping hero boundary
           ═══════════════════════════════════════════════════ */}
        <section className="relative z-20 -mt-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-content-narrow mx-auto">
            <div className="bg-aurora-paper p-6 sm:p-8 rounded-surface shadow-xl border border-aurora-gold/20">
              <form
                action="/rooms"
                method="GET"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
              >
                <div>
                  <label
                    htmlFor="checkIn"
                    className="block text-xs font-semibold uppercase tracking-wider text-aurora-forest mb-1.5"
                  >
                    Nhận phòng
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    aria-label="Nhận phòng"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full text-sm p-3 rounded-input border border-aurora-mist bg-aurora-ivory focus:outline-none focus:ring-2 focus:ring-aurora-gold/60 transition-shadow"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkOut"
                    className="block text-xs font-semibold uppercase tracking-wider text-aurora-forest mb-1.5"
                  >
                    Trả phòng
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    aria-label="Trả phòng"
                    defaultValue={
                      new Date(Date.now() + 86400000 * 2)
                        .toISOString()
                        .slice(0, 10)
                    }
                    className="w-full text-sm p-3 rounded-input border border-aurora-mist bg-aurora-ivory focus:outline-none focus:ring-2 focus:ring-aurora-gold/60 transition-shadow"
                  />
                </div>
                <div>
                  <label
                    htmlFor="guests"
                    className="block text-xs font-semibold uppercase tracking-wider text-aurora-forest mb-1.5"
                  >
                    Số khách
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    aria-label="Số khách"
                    defaultValue="2"
                    className="w-full text-sm p-3 rounded-input border border-aurora-mist bg-aurora-ivory focus:outline-none focus:ring-2 focus:ring-aurora-gold/60 transition-shadow appearance-none"
                  >
                    <option value="1">1 Khách</option>
                    <option value="2">2 Khách</option>
                    <option value="3">3 Khách</option>
                    <option value="4">4 Khách</option>
                    <option value="5">5+ Khách</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-btn text-sm font-semibold bg-aurora-midnight text-aurora-gold hover:bg-aurora-charcoal transition-all duration-200 shadow-md min-h-[44px]"
                  >
                    Tìm phòng trống
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            ROOM SHOWCASE — Suite Spotlight layout
           ═══════════════════════════════════════════════════ */}
        <section className="py-section-mobile lg:py-section">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">
                Our Collection
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-aurora-midnight mt-3">
                Phòng & Suite Thượng Lưu
              </h2>
              <p className="text-sm sm:text-base text-aurora-forest mt-3 max-w-lg mx-auto font-light">
                Tuyển chọn các hạng phòng nghỉ dưỡng sang trọng với tầm nhìn
                hướng biển tuyệt mỹ.
              </p>
            </div>

            {roomCategories.length === 0 ? (
              <p className="text-center text-sm text-semantic-error py-12">
                Đang cập nhật danh sách phòng...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {roomCategories.map((cat, index) => (
                  <article
                    key={cat.id}
                    className="group bg-aurora-paper rounded-surface overflow-hidden border border-aurora-mist/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col animate-fade-in-up"
                    style={{ animationDelay: `${(index + 1) * 120}ms` }}
                  >
                    {/* Image placeholder with gradient */}
                    <div className="relative h-56 sm:h-64 bg-gradient-to-br from-aurora-forest/20 to-aurora-midnight/30 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-aurora-ivory/40 font-display text-3xl italic">
                          {cat.name}
                        </span>
                      </div>
                      {/* Category badge */}
                      {cat.type && (
                        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-aurora-gold/90 text-aurora-midnight px-3 py-1 rounded-full">
                          {cat.type}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-aurora-midnight">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-aurora-charcoal mt-2 leading-relaxed line-clamp-3 flex-1">
                        {cat.description}
                      </p>

                      {/* Amenities */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(
                          Array.isArray(cat.amenities)
                            ? (cat.amenities as string[])
                            : []
                        )
                          .slice(0, 3)
                          .map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-aurora-ivory text-aurora-forest px-2.5 py-1 rounded-full border border-aurora-mist"
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="mt-6 pt-4 border-t border-aurora-mist/50 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-aurora-forest block">
                            Giá chỉ từ
                          </span>
                          <span className="text-lg font-semibold text-aurora-midnight">
                            {formatVND(cat.basePrice)}
                          </span>
                          <span className="text-[11px] text-aurora-forest">
                            {" "}
                            / đêm
                          </span>
                        </div>
                        <Link
                          href={`/rooms/${cat.slug}`}
                          className="px-5 py-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm font-semibold rounded-btn bg-aurora-midnight text-aurora-gold hover:bg-aurora-charcoal transition-colors duration-200 group-hover:bg-aurora-gold group-hover:text-aurora-midnight"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            EXPERIENCE TEASER
           ═══════════════════════════════════════════════════ */}
        <section className="bg-aurora-midnight text-aurora-ivory py-section-mobile lg:py-section">
          <div className="max-w-content-narrow mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">
              Trải Nghiệm Độc Đáo
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">
              Khám Phá Hành Trình
              <br />
              <span className="italic text-aurora-gold/80">Nghỉ Dưỡng Đẳng Cấp</span>
            </h2>
            <p className="text-sm sm:text-base text-aurora-mist mt-4 max-w-lg mx-auto font-light leading-relaxed">
              Từ ẩm thực đỉnh cao đến spa thư giãn, mỗi khoảnh khắc tại Aurora đều được kiến tạo để trở thành kỷ niệm.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/experiences"
                className="px-8 py-3.5 min-h-[44px] inline-flex items-center justify-center rounded-btn text-sm font-semibold bg-aurora-gold text-aurora-midnight hover:bg-aurora-gold/85 transition-all duration-200"
              >
                Khám Phá Ngay
              </Link>
              <Link
                href="/rooms"
                className="px-8 py-3.5 min-h-[44px] inline-flex items-center justify-center rounded-btn text-sm font-semibold border border-aurora-gold/40 text-aurora-gold hover:bg-aurora-gold/10 transition-all duration-200"
              >
                Xem Tất Cả Phòng
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
