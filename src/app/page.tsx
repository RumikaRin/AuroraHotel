import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OptionCRoomReel } from "@/components/home/OptionCRoomReel";
import { BookingConsole } from "@/components/public/BookingConsole";
import { DirectBookingBenefits } from "@/components/public/DirectBookingBenefits";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let roomCategories: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    description: string;
    type?: string;
    amenities?: unknown;
    sizeSqm?: number;
    maxOccupancy?: number;
    bedConfiguration?: string;
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
        name: "Premier Garden Suite",
        slug: "premier-garden-suite",
        basePrice: 3250000,
        description:
          "Không gian riêng tư 48m² hướng vườn, ban công mở đón ánh sáng ấm áp và các đường nét vật liệu tự nhiên dành cho một nhịp nghỉ chậm hơn.",
        type: "Signature Suite",
        amenities: ["48 m²", "2 Khách", "King Bed", "Flexible & Saver"],
      },
      {
        id: "cat-2",
        name: "Deluxe Ocean King",
        slug: "deluxe-ocean-king",
        basePrice: 2450000,
        description:
          "Căn phòng hướng biển với tầm nhìn thẳng ra bãi biển Đà Nẵng, trang bị giường King lớn và góc thư giãn đọc sách riêng biệt.",
        type: "Ocean Collection",
        amenities: ["36 m²", "2 Khách", "King Bed", "2 Rate Plans"],
      },
      {
        id: "cat-3",
        name: "Family Retreat Villa",
        slug: "family-retreat-villa",
        basePrice: 4100000,
        description:
          "Bối cảnh nghỉ dưỡng rộng rãi 62m² dành cho gia đình 4 khách, tích hợp khu sinh hoạt chung và trọn gói điểm tâm sáng cao cấp.",
        type: "Family Collection",
        amenities: ["62 m²", "4 Khách", "King + Twin", "Breakfast Included"],
      },
    ];
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />

      <main id="main-content">
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO & BOOKING KEY
           ═══════════════════════════════════════════ */}
        <HeroCarousel />

        {/* ═══════════════════════════════════════════
            SECTION 2: FLOATING BOOKING CONSOLE & DIRECT BENEFITS
           ═══════════════════════════════════════════ */}
        <BookingConsole />
        <DirectBookingBenefits />

        {/* ═══════════════════════════════════════════
            SECTION 3: CHAPTER I — PROLOGUE (100VH SNAP, WARM SAND #efe9dd)
           ═══════════════════════════════════════════ */}
        <section className="snap-section prologue-section" aria-label="Prologue - Câu chuyện Aurora">
          <div className="wrap prologue-grid">
            <div className="prologue-copy">
              <div className="chapter-mark">
                <strong>I</strong>
                <span>Prologue</span>
              </div>
              <h2>
                A stay told through<br />
                <em>light, texture & time.</em>
              </h2>

              <div className="prologue-pullquote">
                &ldquo;Nơi ánh nắng tự nhiên chạm vào bề mặt đá nhám và mảng gỗ tự nhiên, tạo nên nhịp nghỉ chậm rãi dành riêng cho bạn.&rdquo;
              </div>

              <p>
                Aurora là trải nghiệm nghỉ dưỡng mang tinh thần Việt Nam đương đại — tiết chế, tự nhiên và được chăm chút để bạn tìm lại cảm giác thư thái thực sự bên bờ biển Đà Nẵng.
              </p>
              <Link href="/experiences" className="text-link">
                Khám phá câu chuyện Aurora <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="photo-mosaic">
              <div className="mosaic-main">
                <Image
                  src="/images/prologue-architecture.png"
                  alt="Kiến trúc resort Aurora"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="40vw"
                />
              </div>
              <div className="mosaic-sub">
                <Image
                  src="/images/prologue-detail.png"
                  alt="Góc thư giãn spa & resort"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="30vw"
                />
                <div className="mosaic-caption">
                  <span>Natural materials</span>
                  <span>Da Nang, Vietnam</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4: CHAPTER III — THE STAY COLLECTION (ROOM REEL)
           ═══════════════════════════════════════════ */}
        <OptionCRoomReel rooms={roomCategories} />

        {/* ═══════════════════════════════════════════
            SECTION 5: SANCTUARY EXPERIENCES
           ═══════════════════════════════════════════ */}
        <SanctuaryExperiences />

        {/* ═══════════════════════════════════════════
            SECTION 6: CHAPTER IV — THE BOOKING LEDGER (DEEP FOREST NIGHT #1c2a24)
           ═══════════════════════════════════════════ */}
        <section className="snap-section ledger-section" id="ledger" aria-label="Minh bạch giá và rate plan">
          <div className="wrap ledger-grid">
            <div className="ledger-copy">
              <div className="chapter-mark">
                <strong>IV</strong>
                <span>The Booking Ledger</span>
              </div>
              <h2>
                Luxury also means<br />
                <em>clarity.</em>
              </h2>
              <p>
                Minh bạch trong từng giao dịch. Khách hàng nhìn thấy toàn bộ quyền lợi, điều kiện hủy và tổng tiền phải trả trước khi xác nhận đặt phòng. Không giấu phí, không tạo áp lực giả.
              </p>
              <Link href="/rooms" className="text-link">
                Kiểm tra phòng trống <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="hairline-ledger-table">
              <div className="ledger-table-header">
                <h3>Premier Garden Suite</h3>
                <span>3 nights · 2 guests</span>
              </div>

              <div className="ledger-table-row">
                <div className="rate-desc">
                  <strong>Flexible Stay Plan</strong>
                  <span>Miễn phí hủy phòng trước 48h · Bao gồm điểm tâm sáng mỗi ngày</span>
                </div>
                <div className="rate-cost">
                  <strong>9.750.000 ₫</strong>
                  <Link href="/rooms/premier-garden-suite" className="btn-table-rate">
                    Chọn Rate
                  </Link>
                </div>
              </div>

              <div className="ledger-table-row">
                <div className="rate-desc">
                  <strong>Advance Saver Plan</strong>
                  <span>Gói ưu đãi tiết kiệm khi đặt sớm · Không hoàn hủy</span>
                </div>
                <div className="rate-cost">
                  <strong>8.925.000 ₫</strong>
                  <Link href="/rooms/premier-garden-suite" className="btn-table-rate">
                    Chọn Rate
                  </Link>
                </div>
              </div>

              <div className="ledger-footer-note">
                <span>Đã bao gồm thuế và phí dịch vụ</span>
                <Link href="/rooms" style={{ color: "white", textDecoration: "underline" }}>
                  Xem chi tiết cấu trúc giá →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7: CHAPTER V — EPILOGUE (WARM IVORY #f7f4ed)
           ═══════════════════════════════════════════ */}
        <section className="snap-section epilogue-section" aria-label="Khởi đầu kỳ nghỉ">
          <div className="wrap epilogue-grid">
            <div className="epilogue-copy">
              <div className="chapter-mark">
                <strong>V</strong>
                <span>Epilogue</span>
              </div>
              <h2>
                Your next chapter<br />
                <em>starts here.</em>
              </h2>
              <p>
                Chọn ngày lưu trú, so sánh các gói rate plan phù hợp và hoàn tất quá trình giữ phòng trong ba bước minh bạch.
              </p>
              <div className="epilogue-links">
                <Link href="/rooms" className="text-link">
                  Bắt đầu đặt phòng <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/rooms" className="text-link" style={{ borderColor: "#8a8f8b", color: "#69726c" }}>
                  Xem tất cả Suites <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <div className="epilogue-photo-wrapper">
              <Image
                src="/images/epilogue-resort.png"
                alt="Kỳ nghỉ tại Aurora"
                fill
                style={{ objectFit: "cover" }}
                sizes="40vw"
              />
              <div className="epilogue-badge">
                <span>16.0544° N, 108.2022° E · Da Nang Beach</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        /* Prologue styles */
        .prologue-section {
          background: var(--sand);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .prologue-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 72px;
          align-items: center;
        }
        .chapter-mark {
          display: flex; gap: 16px; align-items: baseline; color: var(--clay); margin-bottom: 24px;
        }
        .chapter-mark strong { font: 500 44px/1 "Cormorant Garamond", serif; }
        .chapter-mark span { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }

        .prologue-copy h2 {
          font: 400 clamp(44px, 5.5vw, 76px)/0.92 "Cormorant Garamond", serif;
          letter-spacing: -0.035em;
          color: var(--night);
          margin-bottom: 28px;
        }
        .prologue-copy h2 em { color: var(--clay); font-style: italic; }

        .prologue-pullquote {
          font: 400 20px/1.5 "Cormorant Garamond", serif;
          font-style: italic;
          color: var(--night);
          padding-left: 20px;
          border-left: 2px solid var(--gold);
          margin-bottom: 28px;
        }
        .prologue-copy p {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.85;
          margin-bottom: 32px;
          max-width: 480px;
        }

        .photo-mosaic {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 0.8fr;
          gap: 20px;
          align-items: center;
        }
        .mosaic-main {
          position: relative;
          height: 520px;
          overflow: hidden;
          border-radius: 4px;
        }
        .mosaic-sub {
          position: relative;
          height: 400px;
          overflow: hidden;
          border-radius: 4px;
          margin-top: 60px;
          border: 1px solid var(--line);
        }
        .mosaic-caption {
          position: absolute;
          bottom: 16px; left: 16px; right: 16px;
          background: rgba(255,253,248,0.92);
          backdrop-filter: blur(8px);
          padding: 12px 18px;
          font-size: 10px;
          color: var(--night);
          border-radius: 4px;
          display: flex; justify-content: space-between;
        }

        /* Ledger styles */
        .ledger-section {
          background: var(--night-soft);
          color: white;
        }
        .ledger-grid {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 80px;
          align-items: center;
        }
        .ledger-copy .chapter-mark { color: var(--gold-light); }
        .ledger-copy h2 {
          font: 500 clamp(48px, 6vw, 84px)/0.88 "Cormorant Garamond", serif;
          color: white;
          margin: 18px 0 28px;
          letter-spacing: -0.04em;
        }
        .ledger-copy h2 em { color: var(--gold); font-style: italic; }
        .ledger-copy p {
          color: #a6b2ab;
          font-size: 13px;
          line-height: 1.85;
          margin-bottom: 32px;
        }
        .ledger-copy .text-link {
          color: white; border-color: rgba(255,255,255,0.4);
        }
        .ledger-copy .text-link:hover { color: var(--gold); border-color: var(--gold); }

        .hairline-ledger-table {
          border-top: 1px solid var(--line-dark);
          border-bottom: 1px solid var(--line-dark);
        }
        .ledger-table-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          padding-block: 20px 16px; border-bottom: 1px solid var(--line-dark);
        }
        .ledger-table-header h3 { font: 500 32px/1 "Cormorant Garamond", serif; margin: 0; color: white; }
        .ledger-table-header span { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8ea096; }

        .ledger-table-row {
          display: grid; grid-template-columns: 1fr auto; gap: 32px;
          padding-block: 28px; border-bottom: 1px solid var(--line-dark);
        }
        .rate-desc strong { display: block; color: white; font-size: 14px; font-weight: 600; }
        .rate-desc span { display: block; margin-top: 6px; color: #a6b2ab; font-size: 11px; line-height: 1.6; }
        .rate-cost { text-align: right; }
        .rate-cost strong { display: block; color: var(--gold); font-size: 18px; font-weight: 600; }
        .btn-table-rate {
          display: inline-block;
          margin-top: 8px; padding: 10px 18px; border: 0; border-radius: 6px;
          background: var(--gold); color: var(--night); font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.2s, transform 0.2s;
        }
        .btn-table-rate:hover { background: var(--ivory); transform: translateY(-1px); }

        .ledger-footer-note {
          display: flex; justify-content: space-between; padding-top: 18px;
          font-size: 10px; color: #8ea096;
        }

        /* Epilogue styles */
        .epilogue-section {
          background: var(--ivory);
          border-top: 1px solid var(--line);
        }
        .epilogue-grid {
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 80px;
          align-items: center;
        }
        .epilogue-copy h2 {
          font: 500 clamp(54px, 6.5vw, 96px)/0.86 "Cormorant Garamond", serif;
          color: var(--night);
          letter-spacing: -0.04em;
          margin: 18px 0 28px;
        }
        .epilogue-copy h2 em { color: var(--clay); font-style: italic; }
        .epilogue-copy p {
          max-width: 440px; color: var(--muted); font-size: 13px; line-height: 1.85; margin-bottom: 36px;
        }
        .epilogue-links {
          display: flex; gap: 32px; align-items: center;
        }

        .epilogue-photo-wrapper {
          position: relative;
          height: 520px;
          overflow: hidden;
          border-radius: 4px;
        }
        .epilogue-badge {
          position: absolute;
          bottom: 24px; left: 24px;
          background: rgba(20,32,27,0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 14px 22px;
          border-radius: 4px;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @media (max-width: 980px) {
          .snap-section { min-height: auto; height: auto; padding-block: 80px; }
          .prologue-grid, .photo-mosaic, .ledger-grid, .epilogue-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
