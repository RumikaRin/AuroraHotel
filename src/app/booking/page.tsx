"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookingDrawer } from "@/components/booking/StickyBookingDrawer";
import { AvailabilityPicker } from "@/components/booking/AvailabilityPicker";
import { AuroraSelect } from "@/components/controls/AuroraSelect";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type RatePlan = { id: string; name: string; priceMultiplier: number };
type Category = { id: string; name: string; slug: string; basePrice: number; ratePlans: RatePlan[] };
type Quote = {
  roomSubtotal: number;
  serviceSubtotal: number;
  discountTotal: number;
  taxAndFeeTotal: number;
  totalAmount: number;
  nights: number;
  rooms: Array<{ roomCategoryName: string; ratePlanName: string; nightlyPrice: number }>;
};
type BookingResult = {
  bookingId?: string;
  bookingNumber?: string;
  totalAmount?: number;
  status: "CONFIRMED" | "PENDING_PAYMENT" | "REPLAYED";
};

function formatPrice(amount: number | undefined, lang: "vi" | "en") {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function calculateNights(checkIn: string, checkOut: string) {
  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roomCategoryId, setRoomCategoryId] = useState(searchParams.get("roomCategoryId") || "");
  const [ratePlanId, setRatePlanId] = useState(searchParams.get("ratePlanId") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("MOCK_PAYMENT");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const idempotencyKeyRef = useRef<string | null>(null);
  const paymentOptions = [
    { value: "CREDIT_CARD", title: t("booking.paymentCardTitle"), description: t("booking.paymentCardDescription") },
    { value: "BANK_TRANSFER", title: t("booking.paymentTransferTitle"), description: t("booking.paymentTransferDescription") },
    { value: "CASH", title: t("booking.paymentCashTitle"), description: t("booking.paymentCashDescription") },
    { value: "MOCK_PAYMENT", title: t("booking.paymentDemoTitle"), description: t("booking.paymentDemoDescription") },
  ] as const;

  useEffect(() => {
    let active = true;
    fetch("/api/rooms")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) throw new Error(t("booking.roomLoadFailed"));
        if (!active) return;
        const data = json.data as Category[];
        setCategories(data);
        const requestedCategory = searchParams.get("roomCategoryId");
        const selectedCategory = data.find((category) => category.id === requestedCategory || category.slug === requestedCategory) || data[0];
        if (selectedCategory) {
          setRoomCategoryId(selectedCategory.id);
          const requestedPlan = searchParams.get("ratePlanId");
          const selectedPlan = selectedCategory.ratePlans?.find((plan) => plan.id === requestedPlan) || selectedCategory.ratePlans?.[0];
          if (selectedPlan) setRatePlanId(selectedPlan.id);
        }
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : t("booking.roomLoadFailed")); });
    return () => { active = false; };
  }, [searchParams, t]);

  useEffect(() => {
    if (!roomCategoryId || !checkIn || !checkOut) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsQuoteLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            checkIn,
            checkOut,
            rooms: [{ roomCategoryId, ratePlanId: ratePlanId || undefined, numGuests: Number(guests) || 1 }],
          }),
        });
        const json = await response.json();
        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error?.message || json.message || t("booking.quoteFailed"));
        }
        setQuote(json.data as Quote);
      } catch (error: unknown) {
        if ((error as Error)?.name === "AbortError") return;
        setQuote(null);
        setErrorMessage(error instanceof Error ? error.message : t("booking.quoteFailed"));
      } finally {
        if (!controller.signal.aborted) setIsQuoteLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [roomCategoryId, ratePlanId, checkIn, checkOut, guests, t]);

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [roomCategoryId, ratePlanId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests, paymentMethod]);

  const selectedCategory = categories.find((category) => category.id === roomCategoryId);
  const nights = quote?.nights || calculateNights(checkIn, checkOut);
  const canContinue = Boolean(roomCategoryId && ratePlanId && checkIn && checkOut && quote && !isQuoteLoading);

  const handleCategoryChange = (categoryId: string) => {
    setRoomCategoryId(categoryId);
    const category = categories.find((item) => item.id === categoryId);
    setRatePlanId(category?.ratePlans?.[0]?.id || "");
  };

  const handleGuestStep = () => {
    if (!canContinue) {
      setErrorMessage(t("booking.waitQuote"));
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleSubmitBooking = async () => {
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage(t("booking.missingGuest"));
      return;
    }
    if (!quote || !roomCategoryId || !ratePlanId) {
      setErrorMessage(t("booking.quoteNotReady"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    const idempotencyKey = idempotencyKeyRef.current || crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          roomCategoryId,
          ratePlanId,
          checkIn,
          checkOut,
          numGuests: Number(guests) || 1,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
          paymentMethod,
        }),
      });
      const json = await response.json();
      if (response.status === 401) {
        throw new Error(json.error?.message || json.message || t("booking.checkoutFailed"));
      }
      if (!response.ok) throw new Error(json.error?.message || json.message || t("booking.checkoutFailed"));

      if (json.replayed) {
        setBookingResult({ bookingId: typeof json.bookingId === "string" ? json.bookingId : undefined, totalAmount: quote.totalAmount, status: "REPLAYED" });
      } else {
        if (typeof json.bookingNumber !== "string" || !json.bookingNumber) throw new Error(t("booking.invalidResponse"));
        setBookingResult({
          bookingId: typeof json.bookingId === "string" ? json.bookingId : undefined,
          bookingNumber: json.bookingNumber,
          totalAmount: typeof json.totalAmount === "number" ? json.totalAmount : quote.totalAmount,
          status: paymentMethod === "MOCK_PAYMENT" ? "CONFIRMED" : "PENDING_PAYMENT",
        });
      }
      setStep(3);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : t("booking.unknownError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <Header />
      <main className="wrap booking-main" id="main-content">
        <div className="booking-intro">
          <p className="booking-eyebrow">{t("booking.introEyebrow")}</p>
          <h1>{t("booking.titleOne")}<br /><em>{t("booking.titleTwo")}</em></h1>
          <p>{t("booking.intro")}</p>
        </div>

        <ol className="booking-steps" aria-label={t("booking.stepsAria")}>
          {[t("booking.stepOne"), t("booking.stepTwo"), t("booking.stepThree")].map((label, index) => {
            const number = index + 1;
            return <li key={label} className={step >= number ? "active" : ""}><span>{String(number).padStart(2, "0")}</span><strong>{label}</strong></li>;
          })}
        </ol>

        <div className="booking-layout">
          <section className="booking-flow" aria-live="polite">
            {errorMessage && <div className="booking-error" role="alert">{errorMessage}</div>}

            {step === 1 && (
              <div className="booking-card">
                <div className="booking-card-heading"><p className="booking-eyebrow">{t("booking.stepOneEyebrow")}</p><h2>{t("booking.stepOneTitle")}</h2><span>{t("booking.systemQuote")}</span></div>
                <div className="mt-6 mb-2">
                  <AvailabilityPicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                    onGuestsChange={setGuests}
                  />
                </div>
                <div className="booking-wide-field booking-select-field"><span>{t("booking.roomCategory")}</span><AuroraSelect label={t("booking.roomCategory")} value={roomCategoryId} onValueChange={handleCategoryChange} placeholder={t("booking.loadingRoom")} disabled={categories.length === 0} options={categories.map((category) => ({ value: category.id, label: category.name, description: t("booking.perNight", { price: formatPrice(category.basePrice, lang) }) }))} /></div>
                <div className="booking-wide-field booking-select-field"><span>{t("booking.ratePlan")}</span><AuroraSelect label={t("booking.ratePlan")} value={ratePlanId} onValueChange={setRatePlanId} placeholder={t("booking.loadingRate")} disabled={!selectedCategory?.ratePlans?.length} options={(selectedCategory?.ratePlans || []).map((plan) => ({ value: plan.id, label: plan.name, description: t("booking.standardRate", { percentage: Math.round(plan.priceMultiplier * 100) }) }))} /></div>
                <div className="booking-quote-state">{isQuoteLoading ? t("booking.updatingQuote") : quote ? t("booking.quoteConfirmed") : t("booking.chooseDates")}</div>
                <button type="button" className="booking-primary-button" onClick={handleGuestStep}>{t("booking.continue")} <span aria-hidden="true">↗</span></button>
              </div>
            )}

            {step === 2 && (
              <div className="booking-card">
                <div className="booking-card-heading"><p className="booking-eyebrow">{t("booking.stepTwoEyebrow")}</p><h2>{t("booking.stepTwoTitle")}</h2><span>{t("booking.existingCheckout")}</span></div>
                <div className="booking-field-stack">
                  <label><span>{t("booking.name")}</span><input type="text" placeholder="Nguyễn Văn A" value={guestName} onChange={(event) => setGuestName(event.target.value)} autoComplete="name" /></label>
                  <div className="booking-field-grid"><label><span>{t("booking.email")}</span><input type="email" placeholder="nguyen@example.com" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} autoComplete="email" /></label><label><span>{t("booking.phone")}</span><input type="tel" placeholder="+84 90 123 4567" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} autoComplete="tel" /></label></div>
                  <label><span>{t("booking.specialRequests")} <small>{t("booking.optional")}</small></span><textarea rows={4} placeholder={t("booking.specialPlaceholder")} value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} /></label>
                </div>
                <div className="payment-section"><div className="payment-heading"><h3>{t("booking.paymentTitle")}</h3><span>{t("booking.paymentSubtitle")}</span></div><div className="payment-options">{paymentOptions.map((option) => <button type="button" key={option.value} className={paymentMethod === option.value ? "selected" : ""} onClick={() => setPaymentMethod(option.value)} aria-pressed={paymentMethod === option.value}><span className="payment-radio" aria-hidden="true" /><span><strong>{option.title}</strong><small>{option.description}</small></span></button>)}</div></div>
                <div className="booking-form-actions"><button type="button" className="booking-secondary-button" onClick={() => setStep(1)}>{t("booking.back")}</button><button type="button" className="booking-primary-button" onClick={handleSubmitBooking} disabled={isSubmitting}>{isSubmitting ? t("booking.submitting") : t("booking.submit")}</button></div>
              </div>
            )}

            {step === 3 && bookingResult && (
              <div className={`booking-card booking-result ${bookingResult.status === "CONFIRMED" ? "confirmed" : "pending"}`}>
                <p className="booking-eyebrow">{t("booking.stepThree")} · {bookingResult.status === "CONFIRMED" ? t("booking.resultConfirmedLabel") : bookingResult.status === "REPLAYED" ? t("booking.resultReplayedLabel") : t("booking.resultPendingLabel")}</p>
                <h2>{bookingResult.status === "CONFIRMED" ? t("booking.success") : bookingResult.status === "REPLAYED" ? t("booking.replayed") : t("booking.pending")}</h2>
                <p>{bookingResult.status === "CONFIRMED" ? t("booking.resultConfirmedBody") : bookingResult.status === "REPLAYED" ? t("booking.resultReplayedBody") : t("booking.resultPendingBody")}</p>
                <div className="booking-result-facts">{bookingResult.bookingNumber ? <div><small>{t("booking.resultBookingReference")}</small><strong>{bookingResult.bookingNumber}</strong></div> : null}{bookingResult.bookingId ? <div><small>{t("booking.resultSystemReference")}</small><strong>{bookingResult.bookingId}</strong></div> : null}<div><small>{t("booking.resultQuoteTotal")}</small><strong>{formatPrice(bookingResult.totalAmount, lang)}</strong></div></div>
                <div className="booking-result-actions">{bookingResult.bookingNumber ? <button type="button" className="booking-primary-button" onClick={() => router.push(`/my-bookings?bookingNumber=${encodeURIComponent(bookingResult.bookingNumber || "")}&email=${encodeURIComponent(guestEmail)}`)}>{t("booking.resultLookup")}</button> : <button type="button" className="booking-secondary-button" onClick={() => router.push("/my-bookings")}>{t("booking.resultOpenLookup")}</button>}<button type="button" className="booking-secondary-button" onClick={() => router.push("/rooms")}>{t("booking.resultBackRooms")}</button></div>
              </div>
            )}
          </section>

          <aside className="booking-summary" aria-label={t("booking.summaryTitle")}>
            <div className="booking-summary-card">
              <div className="booking-summary-heading"><p className="booking-eyebrow">{t("booking.summaryEyebrow")}</p><h2>{t("booking.summaryTitle")}</h2></div>
              <dl><div><dt>{t("booking.summaryRoom")}</dt><dd>{selectedCategory?.name || t("booking.selecting")}</dd></div><div><dt>{t("booking.summaryStay")}</dt><dd>{nights ? t("booking.nights", { count: nights }) : t("booking.notEnoughDates")}</dd></div><div><dt>{t("booking.summaryDates")}</dt><dd>{checkIn} → {checkOut}</dd></div><div><dt>{t("booking.summaryGuests")}</dt><dd>{t("booking.guestCount", { count: guests })}</dd></div></dl>
              <div className="booking-summary-price"><div><span>{t("booking.roomPrice")}</span><strong>{formatPrice(quote?.roomSubtotal, lang)}</strong></div><div><span>{t("booking.taxes")}</span><strong>{formatPrice(quote?.taxAndFeeTotal, lang)}</strong></div><div className="total"><span>{t("booking.quoteTotal")}</span><strong>{formatPrice(quote?.totalAmount, lang)}</strong></div></div>
              <p className="booking-summary-note">{t("booking.summaryNote")}</p>
            </div>
          </aside>
        </div>
      </main>

      {step < 3 && <StickyBookingDrawer totalAmountFormatted={formatPrice(quote?.totalAmount, lang)} roomCount={1} nightCount={nights} onNextStep={step === 1 ? handleGuestStep : handleSubmitBooking} nextStepText={step === 1 ? t("booking.continue") : t("booking.submit")} isSubmitting={isSubmitting || isQuoteLoading} />}
      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return <Suspense fallback={<BookingLoading />}><BookingContent /></Suspense>;
}

function BookingLoading() {
  const { t } = useLanguage();
  return <div className="booking-loading">{t("booking.loadingJourney")}</div>;
}
