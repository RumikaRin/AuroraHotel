"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export interface CompareRoomItem {
  slug: string;
  name: string;
  priceFormatted: string;
  image: string;
  capacity: number;
  area: string;
  bedType: string;
  view: string;
  amenities: string[];
}

interface RoomCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: CompareRoomItem[];
  onRemoveRoom: (slug: string) => void;
}

export function RoomCompareModal({
  isOpen,
  onClose,
  rooms,
  onRemoveRoom,
}: RoomCompareModalProps) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191512]/85 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="compare-rooms-title">
      <div className="glass-luxury w-full max-w-5xl rounded-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col border border-aurora-gold/30 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-aurora-line">
          <div>
            <h3 id="compare-rooms-title" className="font-serif-luxury text-2xl text-aurora-midnight font-bold">
              {t("rooms.compare.title")}
            </h3>
            <p className="text-xs text-aurora-muted">
              {t("rooms.compare.description")}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-aurora-line/50 text-aurora-midnight transition-all cursor-pointer"
            aria-label={t("rooms.lightbox.close")}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        {rooms.length === 0 ? (
          <div className="py-12 text-center text-aurora-muted">
            {t("rooms.compare.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto py-4 flex-1">
            <div className={`grid gap-4 ${rooms.length === 1 ? "grid-cols-1" : rooms.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {rooms.map((room) => (
                <div
                  key={room.slug}
                  className="bg-white rounded-xl p-4 border border-aurora-line flex flex-col relative shadow-sm hover:border-aurora-gold transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onRemoveRoom(room.slug)}
                    className="absolute top-2 right-2 z-10 bg-black/60 text-white hover:bg-red-600 p-1.5 rounded-full transition-all cursor-pointer"
                    title={t("rooms.compare.remove")}
                    aria-label={t("rooms.compare.remove")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Thumbnail */}
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                    <Image src={room.image} alt={room.name} fill className="object-cover" />
                  </div>

                  <h4 className="font-serif-luxury text-lg font-bold text-aurora-midnight mb-1">
                    {room.name}
                  </h4>
                  <div className="text-sm font-bold text-aurora-gold mb-3">
                    {room.priceFormatted} <span className="text-xs font-normal text-aurora-muted">{t("rooms.compare.perNight")}</span>
                  </div>

                  {/* Property Table */}
                  <div className="space-y-2.5 text-xs text-aurora-ink border-t border-aurora-line pt-3 mb-4 flex-1">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-aurora-muted">{t("rooms.compare.capacity")}</span>
                      <span className="font-semibold">{t("rooms.guestsCount", { count: room.capacity })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-aurora-muted">{t("rooms.compare.area")}</span>
                      <span className="font-semibold">{room.area}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-aurora-muted">{t("rooms.compare.bed")}</span>
                      <span className="font-semibold">{room.bedType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-aurora-muted">{t("rooms.compare.view")}</span>
                      <span className="font-semibold">{room.view}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-aurora-muted block mb-1">{t("rooms.compare.amenities")}</span>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((item) => (
                          <span key={item} className="bg-aurora-ivory text-aurora-midnight px-2 py-0.5 rounded text-[11px] font-medium border border-aurora-line">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="block text-center w-full py-2.5 rounded-lg bg-aurora-midnight text-white text-xs font-bold hover:bg-aurora-gold hover:text-aurora-midnight transition-all cursor-pointer"
                  >
                    {t("rooms.compare.book")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
