"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

interface DigitalPassbookProps {
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  roomCategoryName: string;
  checkIn: string;
  checkOut: string;
  totalAmountFormatted: string;
  status: string;
}

export function DigitalPassbook({ bookingNumber, guestName, guestEmail, roomCategoryName, checkIn, checkOut, totalAmountFormatted, status }: DigitalPassbookProps) {
  const { t } = useLanguage();
  const handlePrint = () => window.print();
  const isConfirmed = status === "CONFIRMED";

  return (
    <section className="digital-passbook" aria-label={t("passbook.aria")}>
      <div className="digital-passbook-header">
        <div><p>{t("passbook.eyebrow")}</p><h2>{t("passbook.title")}</h2></div>
        <div className="digital-passbook-number"><small>{t("passbook.bookingNumber")}</small><strong>{bookingNumber}</strong></div>
      </div>
      <div className="digital-passbook-body">
        <div className="digital-passbook-details">
          <div><small>{t("passbook.guest")}</small><strong>{guestName || t("passbook.defaultGuest")}</strong><span>{guestEmail}</span></div>
          <div><small>{t("passbook.room")}</small><strong>{roomCategoryName}</strong><span className={isConfirmed ? "confirmed" : "pending"}>{isConfirmed ? t("status.CONFIRMED") : t(`status.${status}`)}</span></div>
          <div><small>{t("passbook.checkIn")}</small><strong>{checkIn}</strong><span>{t("passbook.checkInTime")}</span></div>
          <div><small>{t("passbook.checkOut")}</small><strong>{checkOut}</strong><span>{t("passbook.checkOutTime")}</span></div>
          <div><small>{t("passbook.total")}</small><strong>{totalAmountFormatted}</strong><span>{t("passbook.quote")}</span></div>
        </div>
        <div className="digital-passbook-recovery">
          <span className="digital-passbook-icon" aria-hidden="true">↗</span>
          <h3>{t("passbook.recoveryTitle")}</h3>
          <p>{t("passbook.recoveryDescription")}</p>
          <button type="button" onClick={handlePrint}>{t("passbook.print")}</button>
        </div>
      </div>
    </section>
  );
}
