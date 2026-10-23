import { MyBookingsPageClient } from "@/components/booking/MyBookingsPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tra Cứu Đặt Phòng | Aurora Hotel",
  description: "Tra cứu thông tin đặt phòng và quản lý kỳ nghỉ tại Aurora Hotel.",
};

export default function MyBookingsPage() {
  return <MyBookingsPageClient />;
}
