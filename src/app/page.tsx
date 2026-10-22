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
        name: "Deluxe King Room",
        slug: "deluxe-king",
        basePrice: 2500000,
        description:
          "Không gian riêng tư 35m² trang bị giường King lớn, phòng tắm đá cẩm thạch sang trọng và góc nhìn trọn vẹn bờ biển Đà Nẵng.",
        type: "Deluxe Collection",
        amenities: ["35 m²", "2 Khách", "King Bed", "Ocean View"],
      },
      {
        id: "cat-2",
        name: "Executive Suite",
        slug: "executive-suite",
        basePrice: 4500000,
        description:
          "Bộ sưu tập Suite thượng lưu 65m² với khu vực phòng khách riêng, ban công lộng gió và đặc quyền Executive Lounge cao cấp.",
        type: "Signature Suite",
        amenities: ["65 m²", "3 Khách", "Super King Bed", "Executive Lounge"],
      },
      {
        id: "cat-3",
        name: "Presidential Suite",
        slug: "presidential-suite",
        basePrice: 12000000,
        description:
          "Tuyệt tác nghỉ dưỡng 120m² trên tầng cao nhất với tầm nhìn 360 độ toàn cảnh biển, dịch vụ quản gia 24/7 và bàn tiệc ẩm thực riêng biệt.",
        type: "Presidential Collection",
        amenities: ["120 m²", "4 Khách", "Grand King", "Butler Service"],
      },
    ];
  }

  return (
    <div className="page-shell">
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
            SECTION 3: PROLOGUE
           ═══════════════════════════════════════════ */}
        <section className="prologue-section" aria-label="Prologue - Câu chuyện Aurora" data-scroll-section="prologue" data-header-tone="light">
          <div className="wrap prologue-grid">
            <div className="prologue-copy">
              <div className="chapter-mark">
                <span className="eyebrow"><LocalizedText id="home.prologueMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.prologueTitleOne" /><br />
                <span className="text-secondary-line"><LocalizedText id="home.prologueTitleTwo" /></span>
              </h2>

              <div className="prologue-pullquote">
                <LocalizedText id="home.prologueQuote" />
              </div>

              <p>
                <LocalizedText id="home.prologueDescription" />
              </p>
              <Link href="/experiences" className="text-link">
                <LocalizedText id="home.prologueCta" /> <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="photo-mosaic">
              <div className="mosaic-main">
                <Image
                  src="/images/prologue-architecture.png"
                  alt="Aurora resort architecture"
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              </div>
              <div className="mosaic-sub">
                <Image
                  src="/images/prologue-detail.png"
                  alt="Aurora spa and resort retreat"
                  fill
                  className="object-cover"
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
            SECTION 6: THE BOOKING LEDGER
           ═══════════════════════════════════════════ */}
        <section className="ledger-section" id="ledger" aria-label="Minh bạch giá và rate plan" data-scroll-section="ledger" data-header-tone="dark">
          <div className="wrap ledger-grid">
            <div className="ledger-copy">
              <div className="chapter-mark">
                <span className="eyebrow ledger-eyebrow"><LocalizedText id="home.ledgerMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.ledgerTitleOne" /><br />
                <span className="text-secondary-line"><LocalizedText id="home.ledgerTitleTwo" /></span>
              </h2>
              <p>
                <LocalizedText id="home.ledgerDescription" />
              </p>
              <Link href="/rooms" className="text-link">
                <LocalizedText id="home.ledgerCta" /> <span aria-hidden="true">→</span>
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
                  className="ledger-details-link"
                >
                  <LocalizedText id="home.ledgerDetails" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7: EPILOGUE
           ═══════════════════════════════════════════ */}
        <section className="epilogue-section" aria-label="Khởi đầu kỳ nghỉ" data-scroll-section="epilogue" data-header-tone="light">
          <div className="wrap epilogue-grid">
            <div className="epilogue-copy">
              <div className="chapter-mark">
                <span className="eyebrow"><LocalizedText id="home.epilogueMark" /></span>
              </div>
              <h2>
                <LocalizedText id="home.epilogueTitleOne" /><br />
                <span className="text-secondary-line"><LocalizedText id="home.epilogueTitleTwo" /></span>
              </h2>
              <p>
                <LocalizedText id="home.epilogueDescription" />
              </p>
              <div className="epilogue-links">
                <Link href="/rooms" className="text-link">
                  <LocalizedText id="home.epilogueBook" /> <span aria-hidden="true">→</span>
                </Link>
                <Link href="/rooms" className="text-link epilogue-secondary-link">
                  <LocalizedText id="home.epilogueRooms" /> <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="epilogue-photo-wrapper">
              <Image
                src="/images/epilogue-resort.png"
                alt="An Aurora stay"
                fill
                className="object-cover"
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
    </div>
  );
}
