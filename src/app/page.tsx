import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { BookingConsole } from "@/components/public/BookingConsole";
import { SuiteSpotlight } from "@/components/public/SuiteSpotlight";
import { SanctuaryExperiences } from "@/components/public/SanctuaryExperiences";
import { DirectBookingBenefits } from "@/components/public/DirectBookingBenefits";

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
    roomCategories = (await Promise.race([queryPromise, timeoutPromise])) as typeof roomCategories;
  } catch {
    roomCategories = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4ED] text-[#17211D] selection:bg-[#C5A46D] selection:text-[#17211D]">
      <Header />

      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Floating Booking Console Overlap */}
      <BookingConsole />

      {/* Direct Booking Privileges */}
      <DirectBookingBenefits />

      {/* Suite Spotlight / Room Showcase */}
      <SuiteSpotlight categories={roomCategories} />

      {/* Sanctuary Experiences (Ẩm Thực, Spa, Quản Gia) */}
      <SanctuaryExperiences />

      <Footer />
    </div>
  );
}
