"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DigitalPassbook } from "@/components/booking/DigitalPassbook";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface BookingRecord {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  status: string;
  cancelToken?: string;
  roomCategory?: { name?: string };
  ratePlan?: { name?: string };
}

function formatDate(value: string, lang: "vi" | "en") {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatPrice(value: number, lang: "vi" | "en") {
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function MyBookingsContent() {
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();
  const [bookingNumber, setBookingNumber] = useState(searchParams.get("bookingNumber") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<BookingRecord | null>(null);

  const handleLookup = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!bookingNumber.trim() || !email.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    setBookingData(null);
    setCancelSuccess(false);
    try {
      const response = await fetch("/api/bookings/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingNumber: bookingNumber.trim(), email: email.trim() }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || t("lookup.notFound"));
      setBookingData(json.data as BookingRecord);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : t("lookup.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingNumber && email) void handleLookup();
    // Lookup is intentionally performed once for query-prefilled links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelBooking = async () => {
    if (!bookingData?.cancelToken) return;
    if (!window.confirm(t("lookup.cancelConfirm"))) return;
    setIsCancelling(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/bookings/lookup", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: bookingData.id, token: bookingData.cancelToken }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || t("lookup.cancelFailed"));
      setBookingData({ ...bookingData, status: "CANCELLED" });
      setCancelSuccess(true);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : t("lookup.cancelError"));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="lookup-page">
      <a className="skip-link" href="#main-content">{t("lookup.skip")}</a>
      <Header />
      <main id="main-content" className="wrap lookup-main">
        <div className="lookup-intro"><p className="lookup-eyebrow">{t("lookup.eyebrow")}</p><h1>{t("lookup.titleOne")}<br /><em>{t("lookup.titleTwo")}</em></h1><p>{t("lookup.description")}</p></div>

        <form className="lookup-form" onSubmit={handleLookup}>
          <div className="lookup-form-heading"><h2>{t("lookup.formTitle")}</h2><span>{t("lookup.noSignIn")}</span></div>
          <div className="lookup-field-grid"><label><span>{t("lookup.bookingNumber")}</span><input type="text" value={bookingNumber} onChange={(event) => setBookingNumber(event.target.value.toUpperCase())} placeholder="AUR-260801-A1B2" required /></label><label><span>{t("lookup.bookingEmail")}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="guest@example.com" required /></label></div>
          <button type="submit" disabled={isLoading || !bookingNumber || !email}>{isLoading ? t("lookup.loading") : t("lookup.submit")}</button>
        </form>

        {errorMessage && <div className="lookup-message error" role="alert">{errorMessage}</div>}
        {cancelSuccess && <div className="lookup-message success" role="status">{t("lookup.cancelled")}</div>}

        {bookingData && (
          <section className="lookup-result" aria-labelledby="lookup-result-title">
            <div className="lookup-result-heading"><div><p className="lookup-eyebrow">{t("lookup.recordEyebrow")}</p><h2 id="lookup-result-title">{t("lookup.recordTitle")}</h2></div><span className={`lookup-status ${bookingData.status.toLowerCase()}`}>{bookingData.status}</span></div>
            <DigitalPassbook bookingNumber={bookingData.bookingNumber} guestName={bookingData.guestName} guestEmail={bookingData.guestEmail} roomCategoryName={bookingData.roomCategory?.name || t("lookup.defaultRoom")} checkIn={formatDate(bookingData.checkIn, lang)} checkOut={formatDate(bookingData.checkOut, lang)} totalAmountFormatted={formatPrice(bookingData.totalAmount, lang)} status={bookingData.status} />
            <div className="lookup-details"><div><small>{t("lookup.room")}</small><strong>{bookingData.roomCategory?.name || t("lookup.defaultRecordRoom")}</strong><span>{bookingData.ratePlan?.name || t("lookup.defaultRatePlan")}</span></div><div><small>{t("lookup.stay")}</small><strong>{formatDate(bookingData.checkIn, lang)} → {formatDate(bookingData.checkOut, lang)}</strong><span>{t("lookup.nights", { count: bookingData.nights })}</span></div><div><small>{t("lookup.contact")}</small><strong>{bookingData.guestName}</strong><span>{bookingData.guestPhone}</span></div><div><small>{t("lookup.total")}</small><strong>{formatPrice(bookingData.totalAmount, lang)}</strong><span>{t("lookup.serverPrice")}</span></div></div>
            {bookingData.status !== "CANCELLED" && bookingData.status !== "CHECKED_OUT" && <button type="button" className="lookup-cancel" onClick={handleCancelBooking} disabled={isCancelling}>{isCancelling ? t("lookup.cancelling") : t("lookup.cancel")}</button>}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export function MyBookingsPageClient() {
  return (
    <Suspense fallback={<LookupLoading />}>
      <MyBookingsContent />
    </Suspense>
  );
}

function LookupLoading() {
  const { t } = useLanguage();
  return <div className="lookup-loading">{t("lookup.opening")}</div>;
}
