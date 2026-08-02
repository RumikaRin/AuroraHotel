"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookingDrawer } from "@/components/booking/StickyBookingDrawer";

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

const PAYMENT_OPTIONS = [
  { value: "CREDIT_CARD", title: "Thẻ thanh toán", description: "Thanh toán qua cổng thẻ được hỗ trợ." },
  { value: "BANK_TRANSFER", title: "Chuyển khoản ngân hàng", description: "Thông tin chuyển khoản sẽ theo hướng dẫn của hệ thống." },
  { value: "CASH", title: "Thanh toán tiền mặt tại quầy", description: "Thanh toán tại quầy theo điều kiện của đơn đặt phòng." },
  { value: "MOCK_PAYMENT", title: "Thanh toán mô phỏng (Demo)", description: "Dùng cho môi trường demo nội bộ." },
] as const;

function formatPrice(amount?: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function calculateNights(checkIn: string, checkOut: string) {
  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  useEffect(() => {
    let active = true;
    fetch("/api/rooms")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) throw new Error("Không thể tải danh sách hạng phòng.");
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
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách hạng phòng."); });
    return () => { active = false; };
  }, [searchParams]);

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
          throw new Error(json.error?.message || json.message || "Không thể xác nhận báo giá cho ngày đã chọn.");
        }
        setQuote(json.data as Quote);
      } catch (error: unknown) {
        if ((error as Error)?.name === "AbortError") return;
        setQuote(null);
        setErrorMessage(error instanceof Error ? error.message : "Không thể xác nhận báo giá cho ngày đã chọn.");
      } finally {
        if (!controller.signal.aborted) setIsQuoteLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [roomCategoryId, ratePlanId, checkIn, checkOut, guests]);

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
      setErrorMessage("Vui lòng chờ báo giá được xác nhận trước khi tiếp tục.");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleSubmitBooking = async () => {
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage("Vui lòng nhập họ tên, email và số điện thoại để tiếp tục.");
      return;
    }
    if (!quote || !roomCategoryId || !ratePlanId) {
      setErrorMessage("Báo giá chưa sẵn sàng. Vui lòng kiểm tra lại ngày lưu trú.");
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
      if (!response.ok) throw new Error(json.error?.message || json.message || "Đặt phòng thất bại. Vui lòng thử lại.");

      if (json.replayed) {
        setBookingResult({ bookingId: typeof json.bookingId === "string" ? json.bookingId : undefined, totalAmount: quote.totalAmount, status: "REPLAYED" });
      } else {
        if (typeof json.bookingNumber !== "string" || !json.bookingNumber) throw new Error("Hệ thống chưa trả về mã đặt phòng hợp lệ.");
        setBookingResult({
          bookingId: typeof json.bookingId === "string" ? json.bookingId : undefined,
          bookingNumber: json.bookingNumber,
          totalAmount: typeof json.totalAmount === "number" ? json.totalAmount : quote.totalAmount,
          status: paymentMethod === "MOCK_PAYMENT" ? "CONFIRMED" : "PENDING_PAYMENT",
        });
      }
      setStep(3);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <Header />
      <main className="wrap booking-main" id="main-content">
        <div className="booking-intro">
          <p className="booking-eyebrow">Aurora · Direct booking</p>
          <h1>Đặt phòng<br /><em>theo nhịp của bạn.</em></h1>
          <p>Chọn ngày, xem báo giá từ hệ thống và hoàn tất thông tin trong một hành trình rõ ràng.</p>
        </div>

        <ol className="booking-steps" aria-label="Các bước đặt phòng">
          {["Chọn phòng & ngày", "Thông tin khách", "Xác nhận"] .map((label, index) => {
            const number = index + 1;
            return <li key={label} className={step >= number ? "active" : ""}><span>{String(number).padStart(2, "0")}</span><strong>{label}</strong></li>;
          })}
        </ol>

        <div className="booking-layout">
          <section className="booking-flow" aria-live="polite">
            {errorMessage && <div className="booking-error" role="alert">{errorMessage}</div>}

            {step === 1 && (
              <div className="booking-card">
                <div className="booking-card-heading"><p className="booking-eyebrow">Bước 01</p><h2>Chọn ngày & hạng phòng</h2><span>Giá được xác nhận qua báo giá hệ thống</span></div>
                <div className="booking-field-grid">
                  <label><span>Nhận phòng</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></label>
                  <label><span>Trả phòng</span><input type="date" value={checkOut} min={checkIn} onChange={(event) => setCheckOut(event.target.value)} required /></label>
                  <label><span>Số khách</span><select value={guests} onChange={(event) => setGuests(event.target.value)}><option value="1">1 khách</option><option value="2">2 khách</option><option value="3">3 khách</option><option value="4">4 khách</option></select></label>
                </div>
                <label className="booking-wide-field"><span>Hạng phòng</span><select value={roomCategoryId} onChange={(event) => handleCategoryChange(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                <label className="booking-wide-field"><span>Rate plan</span><select value={ratePlanId} onChange={(event) => setRatePlanId(event.target.value)}>{selectedCategory?.ratePlans?.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {Math.round(plan.priceMultiplier * 100)}% giá chuẩn</option>)}</select></label>
                <div className="booking-quote-state">{isQuoteLoading ? "Đang cập nhật báo giá…" : quote ? "Báo giá đã được xác nhận cho lựa chọn hiện tại." : "Chọn ngày để xem báo giá."}</div>
                <button type="button" className="booking-primary-button" onClick={handleGuestStep}>Tiếp tục nhập thông tin <span aria-hidden="true">↗</span></button>
              </div>
            )}

            {step === 2 && (
              <div className="booking-card">
                <div className="booking-card-heading"><p className="booking-eyebrow">Bước 02</p><h2>Thông tin khách & thanh toán</h2><span>Thông tin này được gửi nguyên vẹn tới checkout hiện có.</span></div>
                <div className="booking-field-stack">
                  <label><span>Họ & tên *</span><input type="text" placeholder="Nguyễn Văn A" value={guestName} onChange={(event) => setGuestName(event.target.value)} autoComplete="name" /></label>
                  <div className="booking-field-grid"><label><span>Email *</span><input type="email" placeholder="nguyen@example.com" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} autoComplete="email" /></label><label><span>Số điện thoại *</span><input type="tel" placeholder="+84 90 123 4567" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} autoComplete="tel" /></label></div>
                  <label><span>Yêu cầu đặc biệt <small>(tuỳ chọn)</small></span><textarea rows={4} placeholder="Ví dụ: tầng cao, giường phụ, dịp kỷ niệm..." value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} /></label>
                </div>
                <div className="payment-section"><div className="payment-heading"><h3>Phương thức thanh toán</h3><span>Chọn một phương thức được hỗ trợ</span></div><div className="payment-options">{PAYMENT_OPTIONS.map((option) => <button type="button" key={option.value} className={paymentMethod === option.value ? "selected" : ""} onClick={() => setPaymentMethod(option.value)} aria-pressed={paymentMethod === option.value}><span className="payment-radio" aria-hidden="true" /><span><strong>{option.title}</strong><small>{option.description}</small></span></button>)}</div></div>
                <div className="booking-form-actions"><button type="button" className="booking-secondary-button" onClick={() => setStep(1)}>← Quay lại</button><button type="button" className="booking-primary-button" onClick={handleSubmitBooking} disabled={isSubmitting}>{isSubmitting ? "Đang gửi yêu cầu…" : "Gửi yêu cầu đặt phòng ↗"}</button></div>
              </div>
            )}

            {step === 3 && bookingResult && (
              <div className={`booking-card booking-result ${bookingResult.status === "CONFIRMED" ? "confirmed" : "pending"}`}>
                <p className="booking-eyebrow">Bước 03 · {bookingResult.status === "CONFIRMED" ? "Confirmed" : bookingResult.status === "REPLAYED" ? "Recovered" : "Pending payment"}</p>
                <h2>{bookingResult.status === "CONFIRMED" ? "Đặt phòng đã được xác nhận." : bookingResult.status === "REPLAYED" ? "Yêu cầu này đã được nhận trước đó." : "Yêu cầu đặt phòng đang chờ thanh toán."}</h2>
                <p>{bookingResult.status === "CONFIRMED" ? "Hệ thống đã trả về mã đặt phòng chính thức. Bạn có thể dùng email để tra cứu lại bất cứ lúc nào." : bookingResult.status === "REPLAYED" ? "Không tạo thêm đơn mới. Dùng mã hệ thống bên dưới để tiếp tục tra cứu." : "Đơn đã được tạo, nhưng trạng thái thanh toán chưa hoàn tất. Vui lòng kiểm tra hướng dẫn thanh toán và tra cứu đơn."}</p>
                <div className="booking-result-facts">{bookingResult.bookingNumber ? <div><small>Mã đặt phòng</small><strong>{bookingResult.bookingNumber}</strong></div> : null}{bookingResult.bookingId ? <div><small>Mã hệ thống</small><strong>{bookingResult.bookingId}</strong></div> : null}<div><small>Tổng tiền từ báo giá</small><strong>{formatPrice(bookingResult.totalAmount)}</strong></div></div>
                <div className="booking-result-actions">{bookingResult.bookingNumber ? <button type="button" className="booking-primary-button" onClick={() => router.push(`/my-bookings?bookingNumber=${encodeURIComponent(bookingResult.bookingNumber || "")}&email=${encodeURIComponent(guestEmail)}`)}>Tra cứu đơn đặt phòng ↗</button> : <button type="button" className="booking-secondary-button" onClick={() => router.push("/my-bookings")}>Mở trang tra cứu đơn</button>}<button type="button" className="booking-secondary-button" onClick={() => router.push("/rooms")}>Quay lại xem phòng</button></div>
              </div>
            )}
          </section>

          <aside className="booking-summary" aria-label="Tóm tắt báo giá">
            <div className="booking-summary-card">
              <div className="booking-summary-heading"><p className="booking-eyebrow">Booking ledger</p><h2>Tóm tắt lựa chọn</h2></div>
              <dl><div><dt>Hạng phòng</dt><dd>{selectedCategory?.name || "Đang chọn"}</dd></div><div><dt>Lưu trú</dt><dd>{nights ? `${nights} đêm` : "Chưa đủ ngày"}</dd></div><div><dt>Nhận · trả phòng</dt><dd>{checkIn} → {checkOut}</dd></div><div><dt>Số khách</dt><dd>{guests} người</dd></div></dl>
              <div className="booking-summary-price"><div><span>Giá phòng</span><strong>{formatPrice(quote?.roomSubtotal)}</strong></div><div><span>Thuế & phí</span><strong>{formatPrice(quote?.taxAndFeeTotal)}</strong></div><div className="total"><span>Tổng từ báo giá</span><strong>{formatPrice(quote?.totalAmount)}</strong></div></div>
              <p className="booking-summary-note">Tổng tiền, điều kiện hủy và khả dụng là dữ liệu server; thay đổi ngày hoặc rate plan sẽ gọi lại báo giá.</p>
            </div>
          </aside>
        </div>
      </main>

      {step < 3 && <StickyBookingDrawer totalAmountFormatted={formatPrice(quote?.totalAmount)} roomCount={1} nightCount={nights} onNextStep={step === 1 ? handleGuestStep : handleSubmitBooking} nextStepText={step === 1 ? "Tiếp tục" : "Gửi yêu cầu"} isSubmitting={isSubmitting || isQuoteLoading} />}
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
        .booking-field-grid label, .booking-field-stack label, .booking-wide-field { display: grid; gap: 8px; }
        .booking-wide-field { margin-top: 18px; }
        .booking-field-grid label > span, .booking-field-stack label > span, .booking-wide-field > span { color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .booking-field-grid label > span small, .booking-field-stack label > span small { font-size: 9px; font-weight: 400; letter-spacing: 0; text-transform: none; }
        .booking-field-grid input, .booking-field-grid select, .booking-field-stack input, .booking-field-stack textarea, .booking-wide-field select { width: 100%; min-height: 46px; border: 1px solid #d9cfc3; border-radius: 5px; background: var(--linen); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .booking-field-stack textarea { min-height: 112px; padding-block: 12px; resize: vertical; }
        .booking-field-grid input:focus, .booking-field-grid select:focus, .booking-field-stack input:focus, .booking-field-stack textarea:focus, .booking-wide-field select:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
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
  return <Suspense fallback={<div className="booking-loading">Đang tải hành trình đặt phòng…</div>}><BookingContent /></Suspense>;
}
