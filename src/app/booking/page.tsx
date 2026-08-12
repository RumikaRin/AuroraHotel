"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookingDrawer } from "@/components/booking/StickyBookingDrawer";
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
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
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
                <div className="booking-field-grid">
                  <label><span>{t("booking.checkIn")}</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></label>
                  <label><span>{t("booking.checkOut")}</span><input type="date" value={checkOut} min={checkIn} onChange={(event) => setCheckOut(event.target.value)} required /></label>
                  <div className="booking-select-field"><span>{t("booking.guests")}</span><AuroraSelect label={t("booking.guests")} value={guests} onValueChange={setGuests} options={["1", "2", "3", "4"].map((value) => ({ value, label: t("booking.guestCount", { count: value }) }))} /></div>
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

      <style>{`
        .booking-page { min-height: 100vh; background: var(--linen); color: var(--espresso); }
        .booking-main { padding-block: calc(var(--header-height) + 54px) 120px; }
        .booking-intro { display: grid; grid-template-columns: 1fr .7fr; grid-template-rows: auto 1fr; column-gap: 40px; align-items: end; padding-bottom: 42px; }
        .booking-intro .booking-eyebrow { grid-column: 1; grid-row: 1; }
        .booking-intro h1 { grid-column: 1; grid-row: 2; margin: 0; font: 500 clamp(56px, 8vw, 116px)/.82 var(--font-display); letter-spacing: -.055em; }
        .booking-intro h1 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .booking-intro > p:last-child { grid-column: 2; grid-row: 2; max-width: 360px; margin: 0 0 4px; color: var(--taupe); font-size: 13px; line-height: 1.8; }
        .booking-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .booking-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 34px; padding: 20px 0; border-top: 1px solid #d9cfc3; border-bottom: 1px solid #d9cfc3; list-style: none; }
        .booking-steps li { display: flex; align-items: center; gap: 12px; color: var(--taupe); font-size: 11px; }
        .booking-steps li span { color: var(--taupe); font: 500 24px/1 var(--font-display); }
        .booking-steps li.active { color: var(--espresso); }
        .booking-steps li.active span { color: var(--muted-terracotta); }
        .booking-layout { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .65fr); gap: 44px; align-items: start; }
        .booking-flow { min-width: 0; }
        .booking-error { margin-bottom: 18px; padding: 14px 16px; border: 1px solid #c98270; background: rgba(167,109,85,.1); color: #8e4c3a; font-size: 12px; line-height: 1.5; }
        .booking-card, .booking-summary-card { border: 1px solid #d9cfc3; background: var(--warm-ivory); }
        .booking-card { padding: clamp(24px, 4vw, 50px); }
        .booking-card-heading { padding-bottom: 24px; border-bottom: 1px solid var(--line); }
        .booking-card-heading .booking-eyebrow { margin-bottom: 8px; }
        .booking-card-heading h2 { margin: 0; font: 500 clamp(32px, 4vw, 50px)/.9 var(--font-display); letter-spacing: -.035em; }
        .booking-card-heading > span { display: block; margin-top: 13px; color: var(--taupe); font-size: 11px; }
        .booking-field-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 26px; }
        .booking-field-stack { display: grid; gap: 17px; margin-top: 24px; }
        .booking-field-grid label, .booking-field-grid .booking-select-field, .booking-field-stack label, .booking-wide-field { display: grid; gap: 8px; min-width: 0; }
        .booking-wide-field { margin-top: 18px; }
        .booking-field-grid label > span, .booking-field-grid .booking-select-field > span, .booking-field-stack label > span, .booking-wide-field > span { color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .booking-field-grid label > span small, .booking-field-stack label > span small { font-size: 9px; font-weight: 400; letter-spacing: 0; text-transform: none; }
        .booking-field-grid input, .booking-field-stack input, .booking-field-stack textarea { width: 100%; min-height: 46px; border: 1px solid #d9cfc3; border-radius: 5px; background: var(--linen); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .booking-field-stack textarea { min-height: 112px; padding-block: 12px; resize: vertical; }
        .booking-field-grid input:focus, .booking-field-stack input:focus, .booking-field-stack textarea:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
        .booking-quote-state { margin-top: 20px; padding: 12px 14px; background: rgba(181,154,107,.1); color: var(--walnut); font-size: 11px; line-height: 1.5; }
        .booking-primary-button, .booking-secondary-button { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 18px; border-radius: 5px; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .booking-primary-button { border: 1px solid var(--espresso); background: var(--espresso); color: var(--warm-ivory); transition: background .2s var(--ease), transform .2s var(--ease); }
        .booking-primary-button:hover:not(:disabled) { background: var(--walnut); border-color: var(--walnut); transform: translateY(-1px); }
        .booking-primary-button:disabled { cursor: wait; opacity: .48; }
        .booking-card > .booking-primary-button { width: 100%; margin-top: 24px; }
        .payment-section { margin-top: 30px; padding-top: 24px; border-top: 1px solid var(--line); }
        .payment-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; }
        .payment-heading h3 { margin: 0; font: 500 27px/1 var(--font-display); }
        .payment-heading span { color: var(--taupe); font-size: 10px; }
        .payment-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
        .payment-options button { display: flex; align-items: start; gap: 10px; min-height: 82px; padding: 14px; border: 1px solid #d9cfc3; background: transparent; color: var(--espresso); text-align: left; }
        .payment-options button:hover, .payment-options button.selected { border-color: var(--antique-brass); background: rgba(181,154,107,.12); }
        .payment-radio { width: 14px; height: 14px; flex: 0 0 auto; margin-top: 2px; border: 1px solid var(--taupe); border-radius: 50%; }
        .payment-options button.selected .payment-radio { border: 4px solid var(--antique-brass); }
        .payment-options button > span:last-child { display: grid; gap: 6px; }
        .payment-options strong { font-size: 11px; }
        .payment-options small { color: var(--taupe); font-size: 10px; line-height: 1.45; }
        .booking-form-actions, .booking-result-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
        .booking-secondary-button { border: 1px solid #b9a99a; background: transparent; color: var(--walnut); }
        .booking-secondary-button:hover { border-color: var(--espresso); background: rgba(38,30,26,.06); }
        .booking-form-actions .booking-primary-button { flex: 1; }
        .booking-result { text-align: left; }
        .booking-result.confirmed { border-color: rgba(46,125,90,.4); }
        .booking-result.pending { border-color: rgba(181,154,107,.55); }
        .booking-result h2 { max-width: 620px; margin: 0; font: 500 clamp(40px, 5vw, 68px)/.88 var(--font-display); letter-spacing: -.04em; }
        .booking-result > p:not(.booking-eyebrow) { max-width: 560px; margin: 20px 0 0; color: var(--taupe); font-size: 13px; line-height: 1.8; }
        .booking-result-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 32px; padding-block: 20px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .booking-result-facts div { display: grid; gap: 7px; }
        .booking-result-facts small { color: var(--taupe); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .booking-result-facts strong { color: var(--espresso); font-size: 12px; overflow-wrap: anywhere; }
        .booking-summary { position: sticky; top: 110px; }
        .booking-summary-card { padding: 26px; }
        .booking-summary-heading { padding-bottom: 17px; border-bottom: 1px solid var(--line); }
        .booking-summary-heading .booking-eyebrow { margin-bottom: 7px; }
        .booking-summary-heading h2 { margin: 0; font: 500 34px/1 var(--font-display); }
        .booking-summary-card dl { display: grid; gap: 16px; margin: 22px 0 0; }
        .booking-summary-card dl div { display: flex; justify-content: space-between; gap: 18px; font-size: 11px; }
        .booking-summary-card dt { color: var(--taupe); }
        .booking-summary-card dd { margin: 0; color: var(--espresso); font-weight: 600; text-align: right; }
        .booking-summary-price { display: grid; gap: 11px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line); }
        .booking-summary-price div { display: flex; justify-content: space-between; gap: 16px; color: var(--taupe); font-size: 11px; }
        .booking-summary-price strong { color: var(--espresso); font-weight: 700; }
        .booking-summary-price .total { align-items: baseline; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--line); color: var(--espresso); font-size: 12px; }
        .booking-summary-price .total strong { font: 600 26px/1 var(--font-display); }
        .booking-summary-note { margin: 22px 0 0; color: var(--taupe); font-size: 10px; line-height: 1.6; }
        @media (max-width: 900px) { .booking-intro { grid-template-columns: 1fr; grid-template-rows: auto; gap: 18px; } .booking-intro .booking-eyebrow, .booking-intro h1, .booking-intro > p:last-child { grid-column: 1; grid-row: auto; } .booking-layout { grid-template-columns: 1fr; } .booking-summary { position: static; order: -1; } .booking-summary-card { padding: 20px; } }
        @media (max-width: 620px) { .booking-main { padding-block: calc(var(--header-height) + 28px) 100px; } .booking-intro h1 { font-size: 68px; } .booking-steps { gap: 8px; } .booking-steps li { align-items: start; flex-direction: column; gap: 4px; font-size: 9px; line-height: 1.2; } .booking-card { padding: 22px 18px; } .booking-field-grid, .payment-options, .booking-result-facts { grid-template-columns: 1fr; } .payment-heading { align-items: start; flex-direction: column; gap: 7px; } .booking-form-actions, .booking-result-actions { align-items: stretch; flex-direction: column; } .booking-form-actions .booking-primary-button { order: -1; } .booking-summary-card dl div { align-items: start; } }
      `}</style>
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
