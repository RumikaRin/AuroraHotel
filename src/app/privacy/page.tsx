import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Quyền riêng tư | Aurora Hotel",
  description: "Thông tin về cách Aurora Hotel xử lý dữ liệu đặt phòng và liên hệ của khách hàng.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="wrap" style={{ paddingBlock: "150px 96px" }}>
        <Link href="/" className="text-link">← Về trang chủ</Link>
        <p className="eyebrow" style={{ marginTop: 48 }}>Aurora Hotel · Chính sách</p>
        <h1 className="display" style={{ maxWidth: 760, marginBottom: 24, fontSize: "clamp(44px, 6vw, 82px)", lineHeight: .9 }}>
          Quyền riêng tư
        </h1>
        <p style={{ maxWidth: 650, color: "var(--muted)", lineHeight: 1.8 }}>
          Trang này mô tả dữ liệu cần thiết cho việc tìm phòng, xác nhận và quản lý đặt phòng. Aurora chỉ sử dụng dữ liệu theo mục đích được thông báo và chính sách hiện hành.
        </p>
      </main>
      <Footer />
    </>
  );
}
