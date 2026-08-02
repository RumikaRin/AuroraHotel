import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Điều khoản sử dụng | Aurora Hotel",
  description: "Điều khoản sử dụng website và dịch vụ đặt phòng trực tiếp của Aurora Hotel.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="wrap" style={{ paddingBlock: "150px 96px" }}>
        <Link href="/" className="text-link">← Về trang chủ</Link>
        <p className="eyebrow" style={{ marginTop: 48 }}>Aurora Hotel · Chính sách</p>
        <h1 className="display" style={{ maxWidth: 760, marginBottom: 24, fontSize: "clamp(44px, 6vw, 82px)", lineHeight: .9 }}>
          Điều khoản sử dụng
        </h1>
        <p style={{ maxWidth: 650, color: "var(--muted)", lineHeight: 1.8 }}>
          Trang này tóm tắt các điều kiện sử dụng website, đặt phòng, thanh toán và quản lý booking. Điều kiện cụ thể của từng rate plan luôn được hiển thị trước khi xác nhận.
        </p>
      </main>
      <Footer />
    </>
  );
}
