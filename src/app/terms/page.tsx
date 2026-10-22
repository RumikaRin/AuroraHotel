import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = {
  title: "Điều khoản sử dụng | Aurora Hotel",
  description: "Điều khoản sử dụng website và dịch vụ đặt phòng trực tiếp của Aurora Hotel.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="wrap legal-wrap">
        <Link href="/" className="text-link"><LocalizedText id="policies.backHome" /></Link>
        <p className="eyebrow legal-eyebrow"><LocalizedText id="policies.eyebrow" /></p>
        <h1 className="display legal-title">
          <LocalizedText id="terms.title" />
        </h1>
        <p className="legal-desc">
          <LocalizedText id="terms.description" />
        </p>
      </main>
      <Footer />
    </>
  );
}
