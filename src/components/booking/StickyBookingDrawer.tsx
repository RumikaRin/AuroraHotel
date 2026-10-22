"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface StickyBookingDrawerProps {
  totalAmountFormatted: string;
  roomCount: number;
  nightCount: number;
  discountFormatted?: string;
  onNextStep: () => void;
  nextStepText: string;
  isSubmitting?: boolean;
}

export function StickyBookingDrawer({ totalAmountFormatted, roomCount, nightCount, discountFormatted, onNextStep, nextStepText, isSubmitting = false }: StickyBookingDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <aside className="booking-mobile-drawer" aria-label={t("booking.drawerSummary")}>
      {isExpanded && (
        <div className="booking-mobile-details">
          <div><span>{t("booking.drawerRooms")}</span><strong>{roomCount}</strong></div>
          <div><span>{t("booking.drawerStay")}</span><strong>{nightCount ? t("booking.nights", { count: nightCount }) : t("booking.notEnoughDates")}</strong></div>
          {discountFormatted && <div><span>{t("booking.drawerOffer")}</span><strong>-{discountFormatted}</strong></div>}
          <p>{t("booking.drawerNote")}</p>
        </div>
      )}
      <div className="booking-mobile-bar">
        <button type="button" className="booking-mobile-toggle" onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded}>
          <span>{t("booking.drawerDetails")}</span><strong>{totalAmountFormatted}</strong>
        </button>
        <button type="button" className="booking-mobile-next" onClick={onNextStep} disabled={isSubmitting}>{isSubmitting ? t("booking.drawerUpdating") : nextStepText} <span aria-hidden="true">↗</span></button>
      </div>
    </aside>
  );
}
