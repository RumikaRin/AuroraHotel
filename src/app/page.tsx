import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OptionCRoomReel } from "@/components/home/OptionCRoomReel";
import { DirectBookingBenefits } from "@/components/public/DirectBookingBenefits";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";
import { LocalizedText } from "@/components/i18n/LocalizedText";

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
      include: { ratePlans: true },
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
      <a className="skip-link" href="#main-content"><LocalizedText id="home.skip" /></a>
      <Header />

      <main id="main-content">
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO & BOOKING KEY
           ═══════════════════════════════════════════ */}
        <HeroCarousel />

        {/* ═══════════════════════════════════════════
            SECTION 2: DIRECT BOOKING BENEFITS
           ═══════════════════════════════════════════ */}
        <DirectBookingBenefits />

        {/* ═══════════════════════════════════════════
            SECTION 3: CHAPTER I — PROLOGUE (100VH SNAP, WARM SAND #efe9dd)
           ═══════════════════════════════════════════ */}
        <section className="prologue-section" aria-label="Prologue - Câu chuyện Aurora" data-scroll-section="prologue" data-header-tone="light">
          <div className="wrap prologue-grid">
            <div className="prologue-copy">
              <div className="chapter-mark">
                <strong>I</strong>
                <span><LocalizedText id="home.prologueMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.prologueTitleOne" /><br />
                <em><LocalizedText id="home.prologueTitleTwo" /></em>
              </h2>

              <div className="prologue-pullquote">
                <LocalizedText id="home.prologueQuote" />
              </div>

              <p>
                <LocalizedText id="home.prologueDescription" />
              </p>
              <Link href="/experiences" className="text-link">
                <LocalizedText id="home.prologueCta" /> <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="photo-mosaic">
              <div className="mosaic-main">
                <Image
                  src="/images/prologue-architecture.png"
                  alt="Aurora resort architecture"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="40vw"
                />
              </div>
              <div className="mosaic-sub">
                <Image
                  src="/images/prologue-detail.png"
                  alt="Aurora spa and resort retreat"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="30vw"
                />
                <div className="mosaic-caption">
                  <span><LocalizedText id="home.naturalMaterials" /></span>
                  <span><LocalizedText id="home.location" /></span>
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
        <section className="ledger-section" id="ledger" aria-label="Minh bạch giá và rate plan" data-scroll-section="ledger" data-header-tone="dark">
          <div className="wrap ledger-grid">
            <div className="ledger-copy">
              <div className="chapter-mark">
                <strong>IV</strong>
                <span><LocalizedText id="home.ledgerMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.ledgerTitleOne" /><br />
                <em><LocalizedText id="home.ledgerTitleTwo" /></em>
              </h2>
              <p>
                <LocalizedText id="home.ledgerDescription" />
              </p>
              <Link href="/rooms" className="text-link">
                <LocalizedText id="home.ledgerCta" /> <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="hairline-ledger-table">
              <div className="ledger-table-header">
                <h3>{roomCategories[0]?.name || "Premier Garden Suite"}</h3>
                <span><LocalizedText id="home.ledgerStay" /></span>
              </div>

              <div className="ledger-table-row">
                <div className="rate-desc">
                  <strong><LocalizedText id="home.flexPlan" /></strong>
                  <span><LocalizedText id="home.flexDescription" /></span>
                </div>
                <div className="rate-cost">
                  <strong>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      (roomCategories[0]?.basePrice || 3250000) * 3
                    )}
                  </strong>
                  <Link
                    href={`/rooms/${roomCategories[0]?.slug || "premier-garden-suite"}`}
                    className="btn-table-rate"
                  >
                    <LocalizedText id="home.chooseRate" />
                  </Link>
                </div>
              </div>

              <div className="ledger-table-row">
                <div className="rate-desc">
                  <strong><LocalizedText id="home.advancePlan" /></strong>
                  <span><LocalizedText id="home.advanceDescription" /></span>
                </div>
                <div className="rate-cost">
                  <strong>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Math.round((roomCategories[0]?.basePrice || 3250000) * 3 * 0.9)
                    )}
                  </strong>
                  <Link
                    href={`/rooms/${roomCategories[0]?.slug || "premier-garden-suite"}`}
                    className="btn-table-rate"
                  >
                    <LocalizedText id="home.chooseRate" />
                  </Link>
                </div>
              </div>

              <div className="ledger-footer-note">
                <span><LocalizedText id="home.ledgerTax" /></span>
                <Link
                  href="/rooms"
                  style={{
                    color: "white",
                    textDecoration: "underline",
                    minHeight: 44,
                    minWidth: 44,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <LocalizedText id="home.ledgerDetails" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7: CHAPTER V — EPILOGUE (WARM IVORY #f7f4ed)
           ═══════════════════════════════════════════ */}
        <section className="epilogue-section" aria-label="Khởi đầu kỳ nghỉ" data-scroll-section="epilogue" data-header-tone="light">
          <div className="wrap epilogue-grid">
            <div className="epilogue-copy">
              <div className="chapter-mark">
                <strong>V</strong>
                <span><LocalizedText id="home.epilogueMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.epilogueTitleOne" /><br />
                <em><LocalizedText id="home.epilogueTitleTwo" /></em>
              </h2>
              <p>
                <LocalizedText id="home.epilogueDescription" />
              </p>
              <div className="epilogue-links">
                <Link href="/rooms" className="text-link">
                  <LocalizedText id="home.epilogueBook" /> <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/rooms" className="text-link" style={{ borderColor: "#8a8f8b", color: "#69726c" }}>
                  <LocalizedText id="home.epilogueRooms" /> <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <div className="epilogue-photo-wrapper">
              <Image
                src="/images/epilogue-resort.png"
                alt="An Aurora stay"
                fill
                style={{ objectFit: "cover" }}
                sizes="40vw"
              />
              <div className="epilogue-badge">
                <span><LocalizedText id="home.epilogueLocation" /></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        /* Desktop-only chapter rhythm: each editorial section occupies one
           deliberate viewport. Mobile keeps natural document flow. */
        @media (min-width: 901px) {
          html[data-scroll-mode="chapter"] main [data-scroll-section] {
            height: 100svh;
            min-height: 720px;
            max-height: 100svh;
            overflow: clip;
          }
          .prologue-section,
          .ledger-section,
          .epilogue-section { padding-block: clamp(54px, 7svh, 88px); }
          .mosaic-main,
          .epilogue-photo-wrapper { height: min(520px, calc(100svh - 126px)); }
          .mosaic-sub { height: min(400px, calc(100svh - 190px)); }
          .sanctuary-section { padding-block: clamp(36px, 5svh, 54px); }
          .bento-grid { height: clamp(250px, 37svh, 330px); }
        }

        /* Prologue styles */
        .prologue-section {
          background: var(--linen);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          min-height: max(100svh, 720px);
          display: flex;
          align-items: center;
          padding-block: clamp(88px, 9svh, 120px);
        }
        .prologue-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .chapter-mark {
          display: flex; gap: 16px; align-items: baseline; color: var(--clay); margin-bottom: 24px;
        }
        .chapter-mark strong { font: 500 44px/1 "Cormorant Garamond", serif; }
        .chapter-mark span { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--walnut); }

        .prologue-copy h2 {
          font: 400 clamp(44px, 5.5vw, 76px)/0.92 "Cormorant Garamond", serif;
          letter-spacing: -0.035em;
          color: var(--espresso);
          margin-bottom: 28px;
        }
        .prologue-copy h2 em { color: var(--clay); font-style: italic; }

        .prologue-pullquote {
          font: 400 20px/1.5 "Cormorant Garamond", serif;
          font-style: italic;
          color: var(--espresso);
          padding-left: 20px;
          border-left: 2px solid var(--gold);
          margin-bottom: 28px;
        }
        .prologue-copy p {
          color: var(--walnut);
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
          background: rgba(251,248,242,0.94);
          backdrop-filter: blur(8px);
          padding: 12px 18px;
          font-size: 10px;
          color: var(--espresso);
          border-radius: 4px;
          display: flex; justify-content: space-between;
        }

        /* Ledger styles */
        .ledger-section {
          background: var(--warm-carbon);
          color: white;
          min-height: max(100svh, 720px);
          display: flex;
          align-items: center;
          padding-block: clamp(88px, 9svh, 120px);
        }
        .ledger-grid {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 80px;
          align-items: center;
        }
        .ledger-copy .chapter-mark { color: var(--gold-light); }
        .ledger-copy .chapter-mark span { color: #f1c97f; font-weight: 600; }
        .ledger-copy h2 {
          font: 500 clamp(48px, 6vw, 84px)/0.88 "Cormorant Garamond", serif;
          color: white;
          margin: 18px 0 28px;
          letter-spacing: -0.04em;
        }
        .ledger-copy h2 em { color: var(--gold); font-style: italic; }
        .ledger-copy p {
          color: rgba(243,238,231,.7);
          font-size: 13px;
          line-height: 1.85;
          margin-bottom: 32px;
        }
        .ledger-copy .text-link {
          color: white; border-color: rgba(255,255,255,0.4);
        }
        .ledger-copy .text-link:hover { color: var(--gold); border-color: var(--gold); }

        .hairline-ledger-table {
          border-top: 1px solid rgba(243,238,231,.18);
          border-bottom: 1px solid rgba(243,238,231,.18);
        }
        .ledger-table-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          padding-block: 20px 16px; border-bottom: 1px solid rgba(243,238,231,.18);
        }
        .ledger-table-header h3 { font: 500 32px/1 "Cormorant Garamond", serif; margin: 0; color: white; }
        .ledger-table-header span { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(243,238,231,.58); }

        .ledger-table-row {
          display: grid; grid-template-columns: 1fr auto; gap: 32px;
          padding-block: 28px; border-bottom: 1px solid rgba(243,238,231,.18);
        }
        .rate-desc strong { display: block; color: white; font-size: 14px; font-weight: 600; }
        .rate-desc span { display: block; margin-top: 6px; color: rgba(243,238,231,.68); font-size: 11px; line-height: 1.6; }
        .rate-cost { text-align: right; }
        .rate-cost strong { display: block; color: var(--gold); font-size: 18px; font-weight: 600; }
        .btn-table-rate {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
          margin-top: 8px; padding: 10px 18px; border: 0; border-radius: 6px;
          background: var(--antique-brass); color: var(--espresso); font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.2s, transform 0.2s;
        }
        .btn-table-rate:hover { background: var(--warm-ivory); transform: translateY(-1px); }

        .ledger-footer-note {
          display: flex; justify-content: space-between; padding-top: 18px;
          font-size: 10px; color: rgba(243,238,231,.58);
        }

        /* Epilogue styles */
        .epilogue-section {
          background: var(--warm-ivory);
          border-top: 1px solid var(--line);
          min-height: max(100svh, 720px);
          display: flex;
          align-items: center;
          padding-block: clamp(88px, 9svh, 120px);
        }
        .epilogue-grid {
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 80px;
          align-items: center;
        }
        .epilogue-copy h2 {
          font: 500 clamp(54px, 6.5vw, 96px)/0.86 "Cormorant Garamond", serif;
          color: var(--espresso);
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
          background: rgba(25,21,18,0.88);
          backdrop-filter: blur(8px);
          color: white;
          padding: 14px 22px;
          border-radius: 4px;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @media (max-width: 980px) {
          .prologue-section, .ledger-section, .epilogue-section {
            min-height: unset;
            display: block;
            padding-block: 64px;
          }
          .prologue-grid, .photo-mosaic, .ledger-grid, .epilogue-grid { grid-template-columns: 1fr; gap: 36px; }
          .mosaic-main, .epilogue-photo-wrapper { height: clamp(280px, 45vh, 420px); }
          .mosaic-sub { height: 260px; margin-top: 0; }
        }
      `}</style>
    </div>
  );
}
