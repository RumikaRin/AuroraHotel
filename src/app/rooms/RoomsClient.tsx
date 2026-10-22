"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomFilterBar, FilterCriteria } from "@/components/rooms/RoomFilterBar";
import { RoomLightbox } from "@/components/rooms/RoomLightbox";
import { RoomCompareModal, CompareRoomItem } from "@/components/rooms/RoomCompareModal";
import { useLanguage } from "@/components/i18n/LanguageProvider";

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

function formatDate(value: string | undefined, lang: "vi" | "en") {
  if (!value) return lang === "en" ? "Not selected" : "Chưa chọn";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPrice(amount: number, lang: "vi" | "en") {
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RoomsClient({ initialCategories, searchContext }: RoomsClientProps) {
  const { lang, t } = useLanguage();
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
      priceFormatted: formatPrice(category.basePrice, lang),
      image: category.image,
      capacity: category.maxOccupancy,
      area: `${category.areaSqM} m²`,
      bedType: category.bedConfig,
      view: category.viewType === "OCEAN" ? t("rooms.filter.ocean") : category.viewType === "GARDEN" ? t("rooms.filter.garden") : t("rooms.filter.pool"),
      amenities: category.amenities,
    })), [initialCategories, compareSlugs, lang, t]);

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
        <section className="rooms-hero" aria-labelledby="rooms-title" data-scroll-section="rooms-hero" data-header-tone="dark">
          <Image
            src="/images/aurora/presidential-villa.jpg"
            alt="Không gian resort Aurora nhìn ra biển và hồ bơi riêng"
            fill
            priority
            sizes="100vw"
            className="rooms-hero-image"
          />
          <div className="rooms-hero-overlay" />
          <div className="wrap rooms-hero-inner">
            <p className="rooms-eyebrow">{t("rooms.eyebrow")}</p>
            <h1 id="rooms-title">{t("rooms.titleLineOne")}<br /><em>{t("rooms.titleLineTwo")}</em></h1>
            <p className="rooms-hero-lede">
              {t("rooms.lede")}
            </p>

            {hasSearchContext && (
              <div className="rooms-search-summary" data-testid="rooms-search-summary" aria-label={t("rooms.changeDates")}>
                <span><small>{t("rooms.checkIn")}</small><strong>{formatDate(searchContext?.checkIn, lang)}</strong></span>
                <span><small>{t("rooms.checkOut")}</small><strong>{formatDate(searchContext?.checkOut, lang)}</strong></span>
                <span><small>{t("rooms.guests")}</small><strong>{t("rooms.guestsCount", { count: searchContext?.guests || "2" })}</strong></span>
                <Link href="/#booking">{t("rooms.changeDates")}</Link>
              </div>
            )}
          </div>
        </section>

        <section className="wrap rooms-toolbar" aria-label={t("rooms.filter.title")} data-scroll-section="rooms-toolbar" data-header-tone="light">
          <RoomFilterBar
            onFilterChange={setFilters}
            onOpenCompare={() => setIsCompareOpen(true)}
            selectedCompareCount={compareSlugs.length}
          />
        </section>

        <section className="wrap rooms-results" aria-labelledby="rooms-results-title" data-scroll-section="rooms-results" data-header-tone="light">
          <div className="rooms-results-heading">
            <div>
              <p className="rooms-eyebrow">{t("rooms.collection")}</p>
              <h2 id="rooms-results-title">{t("rooms.resultsTitle")}</h2>
            </div>
            <span>{t("rooms.categoryCount", { count: filteredCategories.length })}</span>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="rooms-empty">
              <h3>{t("rooms.emptyTitle")}</h3>
              <p>{t("rooms.emptyDescription")}</p>
            </div>
          ) : (
            <div className="room-results-list">
              {filteredCategories.map((category, index) => {
                const isComparing = compareSlugs.includes(category.slug);
                return (
                  <article className={`room-card ${index % 2 === 1 ? "room-card-reverse" : ""}`} data-scroll-section={`room-${index + 1}`} key={category.id}>
                    <div className="room-card-media">
                      <Image
                        src={category.image}
                        alt={`${lang === "en" ? "Stay in" : "Không gian"} ${category.name}`}
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
                        aria-label={t("rooms.openGallery", { name: category.name })}
                      >
                        {t("rooms.gallery")} <span aria-hidden="true">↗</span>
                      </button>
                    </div>

                    <div className="room-card-content">
                      <div>
                        <div className="room-card-kicker">
                          <span>{category.viewType === "OCEAN" ? t("rooms.oceanCollection") : category.viewType === "GARDEN" ? t("rooms.gardenCollection") : t("rooms.auroraCollection")}</span>
                          <button
                            type="button"
                            className={`compare-toggle ${isComparing ? "selected" : ""}`}
                            onClick={() => toggleCompare(category.slug)}
                            aria-pressed={isComparing}
                          >
                            {isComparing ? t("rooms.compared") : t("rooms.compare")}
                          </button>
                        </div>
                        <h3>{category.name}</h3>
                        <p className="room-card-description">{category.description}</p>
                      </div>

                      <div className="room-card-facts" aria-label={`${t("rooms.details")} ${category.name}`}>
                        <span><small>{t("rooms.area")}</small><strong>{category.areaSqM} m²</strong></span>
                        <span><small>{t("rooms.capacity")}</small><strong>{t("rooms.guestsCount", { count: category.maxOccupancy })}</strong></span>
                        <span><small>{t("rooms.bed")}</small><strong>{category.bedConfig}</strong></span>
                      </div>

                      <div className="room-card-amenities">
                        {category.amenities.slice(0, 4).map((amenity) => <span key={amenity}>{amenity}</span>)}
                      </div>

                      <div className="room-card-footer">
                        <div>
                          <small>{t("rooms.fromPerNight")}</small>
                          <strong>{formatPrice(category.basePrice, lang)}</strong>
                        </div>
                        <div className="room-card-actions">
                          <Link href={withBookingQuery(`/rooms/${category.slug}`)} className="room-secondary-action">{t("rooms.details")}</Link>
                          <Link href={withRoomBookingQuery(category.id)} className="room-primary-action">{t("rooms.book")}</Link>
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
    </div>
  );
}
