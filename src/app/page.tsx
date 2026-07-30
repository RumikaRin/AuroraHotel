import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SuiteSpotlight } from "@/components/home/SuiteSpotlight";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let roomCategories: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    description: string;
    images: unknown;
    type?: string;
    amenities?: unknown;
  }> = [];
  try {
    const queryPromise = db.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500),
    );
    roomCategories = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ])) as typeof roomCategories;
  } catch {
    roomCategories = [
      {
        id: "cat-1",
        name: "Deluxe Ocean View",
        slug: "deluxe-ocean-view",
        basePrice: 2500000,
        description:
          "Căn phòng hướng biển với đường nét gọn, giường king và khoảng ngồi riêng dành cho hai khách.",
        images: [],
        type: "Ocean collection",
        amenities: ["Ocean View", "King Bed", "Rain Shower"],
      },
      {
        id: "cat-2",
        name: "Premier Garden Suite",
        slug: "premier-garden-suite",
        basePrice: 3250000,
        description:
          "Không gian riêng tư hướng vườn, ánh sáng ấm và các chi tiết tự nhiên dành cho một nhịp nghỉ chậm hơn.",
        images: [],
        type: "Signature suite",
        amenities: ["Garden View", "Living Room", "Butler Service"],
      },
      {
        id: "cat-3",
        name: "Family Retreat",
        slug: "family-retreat",
        basePrice: 4100000,
        description:
          "Không gian rộng hơn cho gia đình, khu sinh hoạt chung và lựa chọn bữa sáng trong rate plan.",
        images: [],
        type: "Family collection",
        amenities: ["King + Twin Beds", "Family Lounge", "Breakfast Plan"],
      },
    ];
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />

      <main id="main-content">
        {/* ═══════════════════════════════════════════
            HERO — 92dvh, 3-slide carousel
           ═══════════════════════════════════════════ */}
        <HeroCarousel />

        {/* ═══════════════════════════════════════════
            BOOKING CONSOLE — overlapping hero
           ═══════════════════════════════════════════ */}
        <section
          id="booking"
          aria-label="Tìm phòng trống"
          style={{
            position: "relative",
            zIndex: 8,
            width: "min(1280px, calc(100% - 48px))",
            margin: "-56px auto 0",
            borderRadius: "var(--radius-panel)",
            background: "var(--paper)",
            boxShadow: "var(--shadow)",
          }}
        >
          <form
            action="/rooms"
            method="GET"
            className="booking-form"
          >
            <div className="booking-field">
              <label htmlFor="checkIn">Nhận phòng</label>
              <input
                id="checkIn"
                name="checkIn"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="booking-field">
              <label htmlFor="checkOut">Trả phòng</label>
              <input
                id="checkOut"
                name="checkOut"
                type="date"
                defaultValue={new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)}
              />
            </div>
            <div className="booking-field">
              <label htmlFor="guests">Khách và phòng</label>
              <select id="guests" name="guests" defaultValue="2 khách, 1 phòng">
                <option>2 khách, 1 phòng</option>
                <option>1 khách, 1 phòng</option>
                <option>3 khách, 1 phòng</option>
                <option>4 khách, 2 phòng</option>
              </select>
            </div>
            <button className="booking-submit" type="submit">Kiểm tra phòng</button>
          </form>
          <ul className="booking-trust">
            <li><strong>Giá trực tiếp minh bạch.</strong> Không có phí ẩn khi chọn rate plan.</li>
            <li><strong>Điều kiện rõ ràng.</strong> Chính sách hủy hiển thị trước khi thanh toán.</li>
            <li><strong>Thanh toán an toàn.</strong> Mỗi giao dịch chỉ được xử lý một lần.</li>
          </ul>
        </section>

        {/* ═══════════════════════════════════════════
            PROLOGUE — Chapter I narrative
           ═══════════════════════════════════════════ */}
        <section style={{ padding: "150px 0 124px" }}>
          <div className="wrap" style={{ display: "grid", gridTemplateColumns: ".68fr 1.32fr", gap: "9vw", alignItems: "start" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, color: "#8f734b" }}>
              <strong style={{ font: '500 42px/1 "Cormorant Garamond", serif' }}>I</strong>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const }}>
                Một nhịp nghỉ riêng
              </span>
            </div>
            <div>
              <h2 style={{
                maxWidth: 940,
                marginBottom: 48,
                color: "var(--night)",
                font: '500 clamp(54px, 6.4vw, 92px)/.9 "Cormorant Garamond", serif',
                letterSpacing: "-.04em",
                textWrap: "balance" as const,
              }}>
                Kỳ nghỉ được kể bằng <em style={{ color: "var(--clay)", fontWeight: 400 }}>ánh sáng, vật liệu và thời gian.</em>
              </h2>
              <div className="prologue-foot" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end" }}>
                <p style={{ maxWidth: 520, margin: 0, color: "var(--muted)", fontSize: 13, lineHeight: 1.85 }}>
                  Aurora kết nối sự yên tĩnh của một nơi trú ẩn với tiện nghi đặt phòng hiện đại. Mỗi điểm chạm đều phục vụ cho cảm giác thư thái và tin cậy.
                </p>
                <div>
                  <Link href="/experiences" className="text-link">Khám phá Aurora <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            ATMOSPHERE — Full-width image + copy
           ═══════════════════════════════════════════ */}
        <section style={{ paddingBottom: 142 }}>
          <div className="atmosphere-grid">
            <div className="atmosphere-photo">
              <Image
                src="/images/hero-hotel.png"
                alt="Không gian nội thất Aurora với vật liệu tự nhiên"
                fill
                style={{ objectFit: "cover" }}
                sizes="60vw"
              />
            </div>
            <div className="atmosphere-copy">
              <h2>Không gian để ngày trôi chậm lại.</h2>
              <p>Khoảng mở, bề mặt tự nhiên và ánh sáng dịu tạo nên sự sang trọng không cần phô trương. Mọi hành động đặt phòng vẫn luôn rõ ràng và dễ tiếp cận.</p>
              <div>
                <Link href="/experiences" className="text-link">Xem trải nghiệm <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            DARK STORY — Suite Spotlight + Experiences + CTA
           ═══════════════════════════════════════════ */}
        <div style={{ background: "var(--night)", color: "white" }}>
          {/* Suite Section */}
          <section id="suites" style={{ padding: "132px 0" }}>
            <div className="wrap">
              <div className="suite-heading">
                <h2>Chọn không gian dành cho bạn.</h2>
                <div className="suite-heading-copy">
                  <div className="eyebrow">Suite Spotlight</div>
                  <p>Một hạng phòng được đặt vào tâm điểm. Chuyển lựa chọn ngay bên dưới để xem ảnh, sức chứa, quyền lợi và giá khởi điểm.</p>
                </div>
              </div>

              <SuiteSpotlight rooms={roomCategories} />
            </div>
          </section>

          {/* Experiences Mosaic */}
          <section id="experiences" style={{ paddingBottom: 144 }}>
            <div className="wrap">
              <div style={{ maxWidth: 780, marginBottom: 50 }}>
                <h2 style={{
                  margin: "0 0 20px",
                  font: '500 clamp(54px, 6.2vw, 92px)/.88 "Cormorant Garamond", serif',
                  letterSpacing: "-.04em",
                  textWrap: "balance" as const,
                }}>
                  Một kỳ nghỉ không chỉ nằm trong căn phòng.
                </h2>
                <p style={{ maxWidth: 510, color: "#aab5ae", fontSize: 12, lineHeight: 1.8 }}>
                  Ẩm thực, wellness và những khoảng lặng bên biển được kết nối tự nhiên vào hành trình lưu trú.
                </p>
              </div>

              <div className="experience-mosaic">
                <Link href="/experiences" className="experience-item">
                  <Image
                    src="/images/hero-hotel.png"
                    alt="Không gian wellness yên tĩnh tại Aurora"
                    fill
                    style={{ objectFit: "cover", transition: "transform .8s var(--ease)" }}
                    sizes="60vw"
                  />
                  <div className="experience-copy">
                    <h3>Wellness theo nhịp riêng</h3>
                    <p>Liệu trình thư giãn có thể thêm trực tiếp vào booking sau khi chọn phòng.</p>
                  </div>
                </Link>
                <Link href="/experiences" className="experience-item">
                  <Image
                    src="/images/hero-hotel.png"
                    alt="Trải nghiệm ẩm thực theo mùa tại Aurora"
                    fill
                    style={{ objectFit: "cover", transition: "transform .8s var(--ease)" }}
                    sizes="40vw"
                  />
                  <div className="experience-copy">
                    <h3>Ẩm thực theo mùa</h3>
                    <p>Thực đơn dựa trên nguyên liệu địa phương và những buổi tối thư thả.</p>
                  </div>
                </Link>
                <Link href="/experiences" className="experience-item">
                  <Image
                    src="/images/hero-hotel.png"
                    alt="Kiến trúc và ánh sáng trong không gian Aurora"
                    fill
                    style={{ objectFit: "cover", transition: "transform .8s var(--ease)" }}
                    sizes="40vw"
                  />
                  <div className="experience-copy">
                    <h3>Kiến trúc của ánh sáng</h3>
                    <p>Không gian mở để thiên nhiên hiện diện trong từng thời điểm của ngày.</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Final Invitation */}
          <section style={{ padding: "142px 0", borderTop: "1px solid rgba(255,255,255,.12)" }}>
            <div className="wrap final-grid">
              <div>
                <h2 style={{
                  margin: "0 0 28px",
                  font: '500 clamp(58px, 6.7vw, 98px)/.86 "Cormorant Garamond", serif',
                  letterSpacing: "-.045em",
                  textWrap: "balance" as const,
                }}>
                  Kỳ nghỉ tiếp theo bắt đầu từ đây.
                </h2>
                <p style={{ maxWidth: 450, color: "#aab5ae", fontSize: 12, lineHeight: 1.8 }}>
                  Chọn ngày lưu trú, so sánh rate plan và hoàn tất booking trong ba bước rõ ràng.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, marginTop: 34 }}>
                  <Link
                    href="/rooms"
                    style={{
                      display: "inline-flex", minHeight: 50, alignItems: "center", padding: "0 22px",
                      borderRadius: "var(--radius-control)", background: "var(--gold)", color: "var(--night)",
                      fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const,
                      transition: "transform .2s var(--ease), background .2s var(--ease)",
                    }}
                  >
                    Kiểm tra phòng
                  </Link>
                  <Link
                    href="/rooms"
                    style={{
                      display: "inline-flex", minHeight: 50, alignItems: "center", padding: "0 22px",
                      borderRadius: "var(--radius-control)", border: "1px solid rgba(255,255,255,.28)",
                      color: "white", fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                      textTransform: "uppercase" as const,
                      transition: "transform .2s var(--ease), background .2s var(--ease)",
                    }}
                  >
                    Xem Suites
                  </Link>
                </div>
              </div>
              <div className="final-photo">
                <Image
                  src="/images/hero-hotel.png"
                  alt="Phòng nghỉ Aurora với tầm nhìn thư thái"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="50vw"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .booking-form {
          display: grid;
          grid-template-columns: 1fr 1fr .85fr .8fr;
          align-items: end;
          padding: 14px;
        }
        .booking-field {
          padding: 10px 20px;
          border-right: 1px solid var(--line);
        }
        .booking-field label {
          display: block;
          margin-bottom: 8px;
          color: var(--leaf);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .booking-field input,
        .booking-field select {
          width: 100%;
          min-height: 42px;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: var(--night);
          font-size: 13px;
          font-weight: 600;
        }
        .booking-field input:focus,
        .booking-field select:focus {
          outline: 0;
          box-shadow: 0 2px 0 var(--gold);
        }
        .booking-submit {
          min-height: 58px;
          border: 0;
          border-radius: var(--radius-control);
          background: var(--night);
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .11em;
          text-transform: uppercase;
          transition: transform .2s var(--ease), background .2s var(--ease);
        }
        .booking-submit:hover {
          transform: translateY(-2px);
          background: var(--leaf);
        }
        .booking-trust {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 0;
          padding: 14px 34px 18px;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 10px;
          list-style: none;
        }
        .booking-trust strong {
          color: var(--leaf);
          font-weight: 700;
        }

        .atmosphere-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(340px, .7fr);
          min-height: 720px;
        }
        .atmosphere-photo {
          position: relative;
          overflow: hidden;
        }
        .atmosphere-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(48px, 7vw, 112px);
          background: #e5ddcf;
        }
        .atmosphere-copy h2 {
          margin: 0 0 28px;
          color: var(--night);
          font: 500 clamp(48px, 5vw, 76px)/.92 "Cormorant Garamond", serif;
          letter-spacing: -.035em;
          text-wrap: balance;
        }
        .atmosphere-copy p {
          max-width: 430px;
          color: #626c66;
          font-size: 13px;
          line-height: 1.86;
        }

        .suite-heading {
          display: grid;
          grid-template-columns: .72fr 1.28fr;
          gap: 8vw;
          align-items: end;
          margin-bottom: 58px;
        }
        .suite-heading h2 {
          margin: 0;
          font: 500 clamp(58px, 7vw, 102px)/.84 "Cormorant Garamond", serif;
          letter-spacing: -.045em;
          text-wrap: balance;
        }
        .suite-heading-copy {
          max-width: 490px;
          justify-self: end;
          padding-bottom: 6px;
        }
        .suite-heading-copy p {
          margin: 14px 0 0;
          color: #aab5ae;
          font-size: 12px;
          line-height: 1.8;
        }

        .experience-mosaic {
          display: grid;
          grid-template-columns: 1.18fr .82fr;
          grid-template-rows: 330px 330px;
          gap: 18px;
        }
        .experience-item {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-panel);
          color: white;
        }
        .experience-item:first-child {
          grid-row: 1 / 3;
        }
        .experience-item::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(7,13,10,.78), transparent 58%);
          z-index: 1;
        }
        .experience-item:hover img {
          transform: scale(1.035) !important;
        }
        .experience-copy {
          position: absolute;
          z-index: 2;
          right: 0; bottom: 0; left: 0;
          padding: 28px;
        }
        .experience-copy h3 {
          margin: 0 0 8px;
          font: 500 clamp(28px, 3vw, 44px)/.95 "Cormorant Garamond", serif;
        }
        .experience-copy p {
          max-width: 460px;
          margin: 0;
          color: rgba(255,255,255,.75);
          font-size: 10px;
          line-height: 1.6;
        }

        .final-grid {
          display: grid;
          grid-template-columns: 1fr .92fr;
          gap: 9vw;
          align-items: center;
        }
        .final-photo {
          position: relative;
          min-height: 590px;
          overflow: hidden;
          border-radius: var(--radius-panel);
        }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 900px) {
          .booking-form { grid-template-columns: 1fr 1fr; }
          .booking-field:nth-child(2) { border-right: 0; }
          .booking-field:nth-child(3) { border-top: 1px solid var(--line); }
          .booking-submit { min-height: 54px; margin-top: 12px; }
          .booking-trust { grid-template-columns: 1fr; gap: 7px; }
          .atmosphere-grid,
          .suite-heading,
          .final-grid { grid-template-columns: 1fr; }
          .atmosphere-photo { min-height: 560px; }
          .atmosphere-copy { min-height: 480px; }
          .suite-heading { gap: 28px; }
          .suite-heading-copy { justify-self: start; }
          .experience-mosaic {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 520px 330px;
          }
          .experience-item:first-child { grid-column: 1/3; grid-row: auto; }
          .final-grid { gap: 58px; }
          .final-photo { min-height: 540px; }
          .prologue-foot { grid-template-columns: 1fr !important; gap: 30px !important; }
        }
        @media (max-width: 620px) {
          .booking-form { grid-template-columns: 1fr; padding: 12px; }
          .booking-field { padding: 11px 10px; border-right: 0; border-bottom: 1px solid var(--line); border-top: 0; }
          .atmosphere-photo { min-height: 430px; }
          .atmosphere-copy { min-height: auto; padding: 64px 22px 72px; }
          .atmosphere-copy h2 { font-size: 48px; }
          .experience-mosaic { grid-template-columns: 1fr; grid-template-rows: repeat(3, 420px); }
          .experience-item:first-child { grid-column: auto; }
          .final-photo { min-height: 420px; }
          .suite-heading h2 { font-size: 53px; }
        }
      `}</style>
    </div>
  );
}
