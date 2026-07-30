export type Language = "vi" | "en";

export const translations: Record<Language, Record<string, string>> = {
  vi: {
    "nav.brand": "Aurora Hotel",
    "nav.slogan": "Nơi Mỗi Kỳ Nghỉ Trở Thành Kỷ Niệm",
    "nav.rooms": "Phòng & Suites",
    "nav.experience": "Trải Nghiệm",
    "nav.dining": "Ẩm Thực",
    "nav.offers": "Ưu Đãi",
    "nav.myBookings": "Đặt Phòng Của Tôi",
    "nav.bookNow": "Đặt Phòng",
    "nav.reception": "Lễ Tân",
    "nav.housekeeping": "Buồng Phòng",
    "hero.title": "Trải Nghiệm Nghỉ Dưỡng Thượng Lưu",
    "hero.subtitle": "Không gian sang trọng tĩnh lặng bên bờ biển thơ mộng.",
    "search.checkIn": "Ngày nhận phòng",
    "search.checkOut": "Ngày trả phòng",
    "search.guests": "Số khách",
    "search.submit": "Tìm phòng trống",
    "status.DRAFT": "Nháp",
    "status.PENDING_PAYMENT": "Chờ thanh toán",
    "status.CONFIRMED": "Đã xác nhận",
    "status.CHECKED_IN": "Đã nhận phòng",
    "status.CHECKED_OUT": "Đã trả phòng",
    "status.CANCELLED": "Đã hủy",
    "status.NO_SHOW": "Vắng mặt",
  },
  en: {
    "nav.brand": "Aurora Hotel",
    "nav.slogan": "Where Every Stay Becomes a Memory",
    "nav.rooms": "Rooms & Suites",
    "nav.experience": "Experiences",
    "nav.dining": "Dining",
    "nav.offers": "Special Offers",
    "nav.myBookings": "My Bookings",
    "nav.bookNow": "Book Now",
    "nav.reception": "Reception Desk",
    "nav.housekeeping": "Housekeeping",
    "hero.title": "Contemporary Luxury Hospitality",
    "hero.subtitle": "Tranquil oceanfront elegance crafted for unforgettable moments.",
    "search.checkIn": "Check-in Date",
    "search.checkOut": "Check-out Date",
    "search.guests": "Guests",
    "search.submit": "Search Availability",
    "status.DRAFT": "Draft",
    "status.PENDING_PAYMENT": "Pending Payment",
    "status.CONFIRMED": "Confirmed",
    "status.CHECKED_IN": "Checked In",
    "status.CHECKED_OUT": "Checked Out",
    "status.CANCELLED": "Cancelled",
    "status.NO_SHOW": "No Show",
  },
};

export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key] ?? translations["vi"]?.[key] ?? key;
}

export function translateBookingStatus(status: string, lang: Language): string {
  return getTranslation(lang, `status.${status}`);
}
