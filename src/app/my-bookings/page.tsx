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
      <style>{`
        .lookup-page { min-height: 100vh; background: var(--linen); color: var(--espresso); }
        .lookup-main { padding-block: calc(var(--header-height) + 56px) 120px; }
        .lookup-intro { display: grid; grid-template-columns: 1fr .62fr; gap: 45px; align-items: end; padding-bottom: 44px; }
        .lookup-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .lookup-intro h1 { grid-column: 1; margin: 0; font: 500 clamp(58px, 8vw, 112px)/.82 var(--font-display); letter-spacing: -.055em; }
        .lookup-intro h1 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .lookup-intro > p:last-child { max-width: 360px; margin: 0 0 4px; color: var(--taupe); font-size: 13px; line-height: 1.8; }
        .lookup-form { padding: 28px 32px 32px; border: 1px solid rgba(181,154,107,.35); background: var(--warm-ivory); box-shadow: 0 18px 42px rgba(38,30,26,.1); }
        .lookup-form-heading, .lookup-result-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
        .lookup-form-heading h2, .lookup-result-heading h2 { margin: 0; font: 500 34px/1 var(--font-display); }
        .lookup-form-heading span, .lookup-result-heading > span { color: var(--taupe); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
        .lookup-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
        .lookup-field-grid label { display: grid; gap: 8px; }
        .lookup-field-grid label span { color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .lookup-field-grid input { width: 100%; min-height: 48px; border: 1px solid #d9cfc3; border-radius: 5px; background: var(--linen); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .lookup-field-grid input:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
        .lookup-form > button { width: 100%; min-height: 48px; margin-top: 18px; border: 0; border-radius: 5px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .lookup-form > button:hover:not(:disabled) { background: var(--walnut); }
        .lookup-form > button:disabled { opacity: .45; }
        .lookup-message { margin-top: 20px; padding: 14px 16px; border: 1px solid; font-size: 12px; }
        .lookup-message.error { border-color: #c98270; background: rgba(167,109,85,.1); color: #8e4c3a; }
        .lookup-message.success { border-color: #88ad8f; background: rgba(46,125,90,.1); color: #2e7d5a; }
        .lookup-result { margin-top: 54px; padding-top: 24px; border-top: 1px solid var(--line); }
        .lookup-status { color: var(--muted-terracotta) !important; font-weight: 700; }
        .lookup-status.confirmed { color: #2e7d5a !important; }
        .lookup-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding-block: 24px; border-bottom: 1px solid var(--line); }
        .lookup-details div { display: grid; gap: 6px; }
        .lookup-details small { color: var(--taupe); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .lookup-details strong { font-size: 12px; }
        .lookup-details span { color: var(--taupe); font-size: 10px; }
        .lookup-cancel { min-height: 44px; margin-top: 20px; padding: 0 14px; border: 1px solid #b75f52; background: transparent; color: #9a4d42; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .lookup-cancel:hover { background: #9a4d42; color: white; }
        @media (max-width: 800px) { .lookup-intro { grid-template-columns: 1fr; gap: 18px; } .lookup-details { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .lookup-main { padding-block: calc(var(--header-height) + 30px) 80px; } .lookup-intro h1 { font-size: 70px; } .lookup-form { padding: 22px 18px; } .lookup-field-grid { grid-template-columns: 1fr; } .lookup-form-heading, .lookup-result-heading { align-items: start; flex-direction: column; gap: 8px; } .lookup-details { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default function MyBookingsPage() {
  return <Suspense fallback={<LookupLoading />}><MyBookingsContent /></Suspense>;
}

function LookupLoading() {
  const { t } = useLanguage();
  return <div className="lookup-loading">{t("lookup.opening")}</div>;
}
