import { BookingPageClient } from "@/components/booking/BookingPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Đặt Phòng Nghỉ Dưỡng | Aurora Hotel",
  description: "Trải nghiệm kỳ nghỉ dưỡng thượng lưu tại Aurora Hotel & Sanctuary.",
};

export default function BookingPage() {
  return <BookingPageClient />;
}
