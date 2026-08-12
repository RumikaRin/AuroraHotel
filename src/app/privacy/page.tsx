import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = {
  title: "Quyền riêng tư | Aurora Hotel",
  description: "Thông tin về cách Aurora Hotel xử lý dữ liệu đặt phòng và liên hệ của khách hàng.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="wrap" style={{ paddingBlock: "150px 96px" }}>
        <Link href="/" className="text-link"><LocalizedText id="policies.backHome" /></Link>
        <p className="eyebrow" style={{ marginTop: 48 }}><LocalizedText id="policies.eyebrow" /></p>
        <h1 className="display" style={{ maxWidth: 760, marginBottom: 24, fontSize: "clamp(44px, 6vw, 82px)", lineHeight: .9 }}>
          <LocalizedText id="privacy.title" />
        </h1>
        <p style={{ maxWidth: 650, color: "var(--muted)", lineHeight: 1.8 }}>
          <LocalizedText id="privacy.description" />
        </p>
      </main>
      <Footer />
    </>
  );
}
