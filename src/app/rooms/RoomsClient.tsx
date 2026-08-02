"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomFilterBar, FilterCriteria } from "@/components/rooms/RoomFilterBar";
import { RoomLightbox } from "@/components/rooms/RoomLightbox";
import { RoomCompareModal, CompareRoomItem } from "@/components/rooms/RoomCompareModal";

export interface RoomCategoryData {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  areaSqM: number;
  bedConfig: string;
  viewType: string;
  image: string;
  gallery: string[];
  amenities: string[];
}

interface RoomsClientProps {
  initialCategories: RoomCategoryData[];
  searchContext?: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
}

function formatDate(value?: string) {
  if (!value) return "Chưa chọn";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RoomsClient({ initialCategories, searchContext }: RoomsClientProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: "",
    maxPrice: 25000000,
    viewType: "ALL",
    minCapacity: 1,
  });
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    title: "",
    images: [] as string[],
  });

  const filteredCategories = useMemo(() => initialCategories.filter((category) => {
    const query = filters.searchQuery.trim().toLowerCase();
    const matchSearch = !query
      || category.name.toLowerCase().includes(query)
      || category.description.toLowerCase().includes(query);
    const matchPrice = category.basePrice <= filters.maxPrice;
    const matchView = filters.viewType === "ALL" || category.viewType === filters.viewType;
    const matchCapacity = category.maxOccupancy >= filters.minCapacity;
    return matchSearch && matchPrice && matchView && matchCapacity;
  }), [initialCategories, filters]);

  const toggleCompare = (slug: string) => {
    setCompareSlugs((previous) => {
      if (previous.includes(slug)) return previous.filter((item) => item !== slug);
      return previous.length >= 3 ? previous : [...previous, slug];
    });
  };

  const compareItems: CompareRoomItem[] = useMemo(() => initialCategories
    .filter((category) => compareSlugs.includes(category.slug))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      priceFormatted: formatPrice(category.basePrice),
      image: category.image,
      capacity: category.maxOccupancy,
      area: `${category.areaSqM} m²`,
      bedType: category.bedConfig,
      view: category.viewType === "OCEAN" ? "Hướng biển" : category.viewType === "GARDEN" ? "Hướng vườn" : "Hướng hồ bơi",
      amenities: category.amenities,
    })), [initialCategories, compareSlugs]);

  const bookingQuery = useMemo(() => {
    const query = new URLSearchParams();
    if (searchContext?.checkIn) query.set("checkIn", searchContext.checkIn);
    if (searchContext?.checkOut) query.set("checkOut", searchContext.checkOut);
    if (searchContext?.guests) query.set("guests", searchContext.guests);
    return query.toString();
  }, [searchContext]);

  const withBookingQuery = (path: string) => bookingQuery ? `${path}?${bookingQuery}` : path;
  const withRoomBookingQuery = (categoryId: string) => {
    const query = new URLSearchParams({ roomCategoryId: categoryId });
    if (searchContext?.checkIn) query.set("checkIn", searchContext.checkIn);
    if (searchContext?.checkOut) query.set("checkOut", searchContext.checkOut);
    if (searchContext?.guests) query.set("guests", searchContext.guests);
    return `/booking?${query.toString()}`;
  };
  const hasSearchContext = Boolean(searchContext?.checkIn || searchContext?.checkOut || searchContext?.guests);

  return (
    <div className="rooms-page">
      <Header />

      <main>
        <section className="rooms-hero" aria-labelledby="rooms-title" data-header-tone="dark">
          <div className="wrap rooms-hero-inner">
            <p className="rooms-eyebrow">Aurora · Hotel & Resort</p>
            <h1 id="rooms-title">Một căn phòng<br /><em>để nhớ.</em></h1>
            <p className="rooms-hero-lede">
              Từ phòng hướng biển trong lòng thành phố đến những suite mở ra vườn nhiệt đới — chọn không gian khớp với nhịp nghỉ của bạn.
            </p>

            {hasSearchContext && (
              <div className="rooms-search-summary" data-testid="rooms-search-summary" aria-label="Lịch tìm phòng đã chọn">
                <span><small>Nhận phòng</small><strong>{formatDate(searchContext?.checkIn)}</strong></span>
                <span><small>Trả phòng</small><strong>{formatDate(searchContext?.checkOut)}</strong></span>
                <span><small>Khách</small><strong>{searchContext?.guests || "2"} người</strong></span>
                <Link href="/#booking">Đổi ngày</Link>
              </div>
            )}
          </div>
        </section>

        <section className="wrap rooms-toolbar" aria-label="Bộ lọc hạng phòng" data-header-tone="light">
          <RoomFilterBar
            onFilterChange={setFilters}
            onOpenCompare={() => setIsCompareOpen(true)}
            selectedCompareCount={compareSlugs.length}
          />
        </section>

        <section className="wrap rooms-results" aria-labelledby="rooms-results-title" data-header-tone="light">
          <div className="rooms-results-heading">
            <div>
              <p className="rooms-eyebrow">The stay collection</p>
              <h2 id="rooms-results-title">Không gian theo cách của bạn</h2>
            </div>
            <span>{filteredCategories.length} hạng phòng</span>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="rooms-empty">
              <h3>Không tìm thấy hạng phòng phù hợp</h3>
              <p>Vui lòng thử điều chỉnh lại bộ lọc giá, tầm nhìn hoặc sức chứa.</p>
            </div>
          ) : (
            <div className="room-results-list">
              {filteredCategories.map((category, index) => {
                const isComparing = compareSlugs.includes(category.slug);
                return (
                  <article className={`room-card ${index % 2 === 1 ? "room-card-reverse" : ""}`} key={category.id}>
                    <div className="room-card-media">
                      <Image
                        src={category.image}
                        alt={`Không gian ${category.name}`}
                        fill
                        sizes="(max-width: 900px) 100vw, 58vw"
                        className="room-card-image"
                        priority={index === 0}
                      />
                      <div className="room-card-media-overlay" />
                      <span className="room-card-index">{String(index + 1).padStart(2, "0")} / {String(filteredCategories.length).padStart(2, "0")}</span>
                      <button
                        type="button"
                        className="room-gallery-trigger"
                        onClick={() => setLightboxData({ isOpen: true, title: category.name, images: category.gallery })}
                        aria-label={`Mở thư viện ảnh ${category.name}`}
                      >
                        Xem thư viện ảnh <span aria-hidden="true">↗</span>
                      </button>
                    </div>

                    <div className="room-card-content">
                      <div>
                        <div className="room-card-kicker">
                          <span>{category.viewType === "OCEAN" ? "Ocean collection" : category.viewType === "GARDEN" ? "Garden collection" : "Aurora collection"}</span>
                          <button
                            type="button"
                            className={`compare-toggle ${isComparing ? "selected" : ""}`}
                            onClick={() => toggleCompare(category.slug)}
                            aria-pressed={isComparing}
                          >
                            {isComparing ? "Đã chọn" : "+ So sánh"}
                          </button>
                        </div>
                        <h3>{category.name}</h3>
                        <p className="room-card-description">{category.description}</p>
                      </div>

                      <div className="room-card-facts" aria-label={`Thông tin ${category.name}`}>
                        <span><small>Diện tích</small><strong>{category.areaSqM} m²</strong></span>
                        <span><small>Sức chứa</small><strong>{category.maxOccupancy} khách</strong></span>
                        <span><small>Giường</small><strong>{category.bedConfig}</strong></span>
                      </div>

                      <div className="room-card-amenities">
                        {category.amenities.slice(0, 4).map((amenity) => <span key={amenity}>{amenity}</span>)}
                      </div>

                      <div className="room-card-footer">
                        <div>
                          <small>Giá từ mỗi đêm</small>
                          <strong>{formatPrice(category.basePrice)}</strong>
                        </div>
                        <div className="room-card-actions">
                          <Link href={withBookingQuery(`/rooms/${category.slug}`)} className="room-secondary-action">Chi tiết</Link>
                          <Link href={withRoomBookingQuery(category.id)} className="room-primary-action">Đặt phòng</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <RoomLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((previous) => ({ ...previous, isOpen: false }))}
        title={lightboxData.title}
        images={lightboxData.images}
      />

      <RoomCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        rooms={compareItems}
        onRemoveRoom={(slug) => setCompareSlugs((previous) => previous.filter((item) => item !== slug))}
      />

      <Footer />

      <style>{`
        .rooms-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .rooms-hero { position: relative; overflow: hidden; background: var(--espresso); color: var(--warm-ivory); }
        .rooms-hero::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 78% 20%, rgba(181,154,107,.18), transparent 30%); pointer-events: none; }
        .rooms-hero-inner { position: relative; z-index: 1; padding-block: clamp(96px, 12vw, 170px) 112px; }
        .rooms-eyebrow { margin: 0 0 18px; color: var(--antique-brass); font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .rooms-hero h1 { max-width: 780px; margin: 0; font: 500 clamp(58px, 9vw, 132px)/.82 var(--font-display); letter-spacing: -.055em; }
        .rooms-hero h1 em { color: var(--antique-brass); font-style: italic; font-weight: 400; }
        .rooms-hero-lede { max-width: 480px; margin: 30px 0 0; color: rgba(243,238,231,.72); font-size: 14px; line-height: 1.8; }
        .rooms-search-summary { display: flex; align-items: end; gap: 32px; width: fit-content; margin-top: 46px; padding: 18px 22px; border: 1px solid rgba(181,154,107,.42); border-radius: 10px; background: rgba(25,21,18,.32); }
        .rooms-search-summary span { display: grid; gap: 4px; min-width: 112px; }
        .rooms-search-summary small { color: rgba(243,238,231,.56); font-size: 9px; letter-spacing: .13em; text-transform: uppercase; }
        .rooms-search-summary strong { font-size: 13px; font-weight: 600; }
        .rooms-search-summary a { min-height: 44px; display: inline-flex; align-items: center; color: var(--antique-brass); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; border-bottom: 1px solid currentColor; }
        .rooms-toolbar { position: relative; z-index: 2; margin-top: -44px; }
        .rooms-results { padding-block: 54px 120px; }
        .rooms-results-heading { display: flex; align-items: end; justify-content: space-between; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
        .rooms-results-heading .rooms-eyebrow { margin-bottom: 8px; }
        .rooms-results-heading h2 { margin: 0; font: 500 clamp(36px, 4vw, 58px)/.92 var(--font-display); letter-spacing: -.035em; }
        .rooms-results-heading > span { color: var(--taupe); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
        .room-results-list { display: grid; gap: 34px; padding-top: 34px; }
        .room-card { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr); min-height: 520px; overflow: hidden; border: 1px solid #e2d8cc; background: var(--linen); }
        .room-card-reverse { grid-template-columns: minmax(360px, .88fr) minmax(0, 1.12fr); }
        .room-card-reverse .room-card-media { order: 2; }
        .room-card-media { position: relative; min-height: 520px; overflow: hidden; background: var(--walnut); }
        .room-card-image { object-fit: cover; transition: transform .8s var(--ease); }
        .room-card:hover .room-card-image { transform: scale(1.035); }
        .room-card-media-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(25,21,18,.7), transparent 48%); }
        .room-card-index { position: absolute; top: 24px; left: 26px; color: rgba(251,248,242,.86); font: 500 18px/1 var(--font-display); }
        .room-gallery-trigger { position: absolute; right: 22px; bottom: 22px; min-height: 44px; padding: 0 14px; border: 1px solid rgba(251,248,242,.42); border-radius: 7px; background: rgba(25,21,18,.46); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; backdrop-filter: blur(8px); transition: background .2s var(--ease), border-color .2s var(--ease); }
        .room-gallery-trigger:hover { border-color: var(--antique-brass); background: rgba(38,30,26,.85); }
        .room-card-content { display: flex; flex-direction: column; justify-content: space-between; gap: 28px; padding: clamp(28px, 4vw, 54px); }
        .room-card-kicker { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .room-card-kicker > span { padding-top: 2px; }
        .compare-toggle { min-height: 38px; padding: 0 10px; border: 1px solid #d5c8ba; border-radius: 6px; background: transparent; color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .compare-toggle:hover, .compare-toggle.selected { border-color: var(--antique-brass); background: rgba(181,154,107,.14); color: var(--espresso); }
        .room-card-content h3 { margin: 28px 0 16px; font: 500 clamp(36px, 4vw, 58px)/.9 var(--font-display); letter-spacing: -.04em; }
        .room-card-description { max-width: 480px; margin: 0; color: var(--taupe); font-size: 13px; line-height: 1.85; }
        .room-card-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-block: 20px; border-top: 1px solid #d9cfc3; border-bottom: 1px solid #d9cfc3; }
        .room-card-facts span { display: grid; gap: 7px; }
        .room-card-facts small, .room-card-footer small { color: var(--taupe); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .room-card-facts strong { font-size: 12px; font-weight: 600; }
        .room-card-amenities { display: flex; flex-wrap: wrap; gap: 7px; }
        .room-card-amenities span { padding: 7px 9px; border: 1px solid #d9cfc3; color: var(--walnut); font-size: 10px; }
        .room-card-footer { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-top: 4px; }
        .room-card-footer > div:first-child { display: grid; gap: 7px; }
        .room-card-footer strong { color: var(--espresso); font: 600 23px/1 var(--font-display); }
        .room-card-actions { display: flex; align-items: center; gap: 10px; }
        .room-secondary-action, .room-primary-action { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .room-secondary-action { border-bottom: 1px solid var(--taupe); color: var(--walnut); }
        .room-primary-action { border-radius: 6px; background: var(--espresso); color: var(--warm-ivory); transition: background .2s var(--ease), transform .2s var(--ease); }
        .room-primary-action:hover { background: var(--walnut); transform: translateY(-2px); }
        .rooms-empty { padding: 80px 20px; border: 1px solid var(--line); text-align: center; }
        .rooms-empty h3 { margin: 0 0 8px; font: 500 34px/1 var(--font-display); }
        .rooms-empty p { color: var(--taupe); font-size: 13px; }
        @media (max-width: 900px) {
          .rooms-hero-inner { padding-bottom: 92px; }
          .rooms-search-summary { width: 100%; gap: 14px; flex-wrap: wrap; }
          .rooms-search-summary span { min-width: 0; flex: 1 1 112px; }
          .room-card, .room-card-reverse { grid-template-columns: 1fr; }
          .room-card-reverse .room-card-media { order: 0; }
          .room-card-media { min-height: 390px; }
          .room-card-content { padding: 30px 24px; }
        }
        @media (max-width: 560px) {
          .rooms-results { padding-bottom: 72px; }
          .rooms-results-heading { align-items: start; gap: 16px; flex-direction: column; }
          .rooms-results-heading h2 { font-size: 42px; }
          .room-card-media { min-height: 330px; }
          .room-card-facts { grid-template-columns: 1fr 1fr; }
          .room-card-facts span:last-child { grid-column: span 2; }
          .room-card-footer { align-items: start; flex-direction: column; }
          .room-card-actions { width: 100%; }
          .room-secondary-action, .room-primary-action { flex: 1; }
        }
      `}</style>
    </div>
  );
}
