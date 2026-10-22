import { EditorialHeader } from "@/components/layout/EditorialHeader";
import { EditorialFooter } from "@/components/layout/EditorialFooter";
import { EditorialHero } from "@/components/home/EditorialHero";
import { ManifestoScrub } from "@/components/home/ManifestoScrub";
import { SpatialMasterplan } from "@/components/home/SpatialMasterplan";
import { KineticRoomAccordion } from "@/components/home/KineticRoomAccordion";
import { OceanGastronomy } from "@/components/home/OceanGastronomy";
import { WellnessSanctuary } from "@/components/home/WellnessSanctuary";
import { EcoExpeditions } from "@/components/home/EcoExpeditions";
import { CuratedJourneys } from "@/components/home/CuratedJourneys";
import { AccoladesRow } from "@/components/home/AccoladesRow";
import { ConciergeFaq } from "@/components/home/ConciergeFaq";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="page-shell bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors duration-500 min-h-screen">
      <a className="skip-link" href="#main-content">
        Chuyển đến nội dung chính
      </a>

      {/* Chapter 0: Refined Fixed Editorial Navigation */}
      <EditorialHeader />

      <main id="main-content">
        {/* Chapter 1: Hero Parallax & Booking Ribbon */}
        <EditorialHero />

        {/* Chapter 2: Architectural Manifesto Scroll Scrub */}
        <ManifestoScrub />

        {/* Chapter 3: Spatial Masterplan with Google Maps Lenis Isolation */}
        <SpatialMasterplan />

        {/* Chapter 4: Kinetic Accordion Suites Showcase */}
        <KineticRoomAccordion />

        {/* Chapter 5: Oceanfront Gastronomy & Wine Cellar */}
        <OceanGastronomy />

        {/* Chapter 6: Holistic Wellness & Botanical Spa */}
        <WellnessSanctuary />

        {/* Chapter 7: Eco-Expeditions & Curated Seasonal Journeys */}
        <EcoExpeditions />
        <CuratedJourneys />

        {/* Chapter 8: Accolades, Arrival Concierge FAQ & Giant Watermark Colophon */}
        <AccoladesRow />
        <ConciergeFaq />
      </main>

      <EditorialFooter />
    </div>
  );
}
