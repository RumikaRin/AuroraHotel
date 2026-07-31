"use client";

import { useState } from "react";
import Link from "next/link";
import { BookingModal } from "./BookingModal";

export interface RoomCategoryData {
  id: string;
  slug: string;
  name: string;
  type?: string;
  description: string;
  basePrice: number;
  maxOccupancy?: number;
  sizeSqm?: number;
  bedConfiguration?: string;
  amenities?: string[] | unknown;
}

interface Props {
  categories: RoomCategoryData[];
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function SuiteSpotlight({ categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategoryData | null>(null);

  const fallbackCategories: RoomCategoryData[] = [
    {
      id: "deluxe-king",
      slug: "deluxe-king",
      name: "Deluxe Ocean King Suite",
      type: "DELUXE_KING",
      description: "Phòng Deluxe thiết kế tinh tế với giường King-size, ban công riêng thưởng ngoạn toàn cảnh đại dương xanh ngắt.",
      basePrice: 2500000,
      sizeSqm: 45,
      maxOccupancy: 2,
      bedConfiguration: "1 Giường King Lớn",
      amenities: ["Ban công Hướng Biển", "Ăn Sáng Buffet", "Bồn Tắm Cẩm Thạch", "Wifi Tốc Độ Cao"],
    },
    {
      id: "deluxe-twin",
      slug: "deluxe-twin",
      name: "Deluxe Ocean Twin Suite",
      type: "DELUXE_TWIN",
      description: "Phòng 2 giường đơn cao cấp dành cho bạn đồng hành hoặc đối tác, đầy đủ tiện nghi tiêu chuẩn 5 sao.",
      basePrice: 2800000,
      sizeSqm: 48,
      maxOccupancy: 2,
      bedConfiguration: "2 Giường Đơn Đôi",
      amenities: ["Ban công Hướng Biển", "Ăn Sáng Buffet", "Tủ Rượu Mini Bar", "Smart TV 65-inch"],
    },
    {
      id: "executive-suite",
      slug: "executive-suite",
      name: "Executive Oceanfront Suite",
      type: "EXECUTIVE_SUITE",
      description: "Căn hộ Suite sang trọng biệt lập với phòng khách riêng, phòng tắm sương mù và đặc quyền Executive Lounge.",
      basePrice: 4500000,
      sizeSqm: 75,
      maxOccupancy: 3,
      bedConfiguration: "1 Giường King + Sofa Bed",
      amenities: ["Đặc quyền Lounge", "Quản gia Cá nhân", "Bồn Tắm Jacuzzi", "Xe Đưa Đón Sân Bay"],
    },
    {
      id: "presidential-suite",
      slug: "presidential-suite",
      name: "Presidential Horizon Suite",
      type: "PRESIDENTIAL_SUITE",
      description: "Tuyệt tác nghỉ dưỡng tầng cao nhất với bể bơi vô cực riêng, phòng tiệc sang trọng và dịch vụ phục vụ tối thượng.",
      basePrice: 12500000,
      sizeSqm: 180,
      maxOccupancy: 4,
      bedConfiguration: "2 Phòng Ngủ King Super-size",
      amenities: ["Bể Bơi Vô Cực Riêng", "Đầu Bếp Riêng Tại Gia", "Sauna & Spa Tại Phòng", "Trực Thăng Đưa Đón"],
    },
  ];

  const displayList = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A46D]">
          Tuyển Chọn Nghỉ Dưỡng Đặc Quyền
        </span>
        <h2 className="font-serif-display text-3xl sm:text-5xl text-[#17211D] leading-tight">
          Phòng & Suite Thượng Lưu
        </h2>
        <p className="text-sm sm:text-base text-[#355B4B] font-light leading-relaxed">
          Tất cả hạng phòng đều mang phong cách kiến trúc đương đại kết hợp tinh tế cùng văn hóa nghỉ dưỡng biển Việt Nam.
        </p>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayList.map((cat) => {
          const amenitiesList = Array.isArray(cat.amenities) ? (cat.amenities as string[]) : [];

          return (
            <div
              key={cat.id}
              className="group bg-[#FFFDF8] rounded-3xl overflow-hidden border border-[#DADDD8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Banner Visual */}
              <div className="relative h-64 bg-[#17211D] p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#17211D] via-[#17211D]/40 to-transparent z-10" />
                
                {/* Decorative Pattern Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A46D_1px,transparent_1px)] [background-size:20px_20px]" />

                {/* Top Badges */}
                <div className="relative z-20 flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#C5A46D] text-[#17211D] px-3 py-1 rounded-full shadow-sm">
                    {cat.type || "SUITE HIGHLIGHT"}
                  </span>
                  <span className="text-xs text-[#F7F4ED] bg-[#17211D]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#F7F4ED]/20">
                    {cat.sizeSqm ? `${cat.sizeSqm} m²` : "45 m²"} • {cat.maxOccupancy ? `${cat.maxOccupancy} Khách` : "2 Khách"}
                  </span>
                </div>

                {/* Bottom Title on Image Frame */}
                <div className="relative z-20">
                  <span className="text-xs text-[#C5A46D] font-medium tracking-wide">
                    {cat.bedConfiguration || "Giường King Thượng Hạng"}
                  </span>
                  <h3 className="font-serif-display text-2xl font-normal text-[#F7F4ED] mt-1 group-hover:text-[#C5A46D] transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-[#242826] leading-relaxed font-light">
                  {cat.description}
                </p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {amenitiesList.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#F7F4ED] text-[#355B4B] px-2.5 py-1 rounded-lg border border-[#DADDD8] font-medium"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>

                {/* Price & Action Footer */}
                <div className="pt-4 border-t border-[#F7F4ED] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#355B4B] block">
                      Giá ưu đãi trực tiếp
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#17211D]">
                        {formatVND(cat.basePrice)}
                      </span>
                      <span className="text-xs text-[#355B4B]">/đêm</span>
                    </div>
                    <span className="text-[10px] text-[#2E7D5A] font-medium block mt-0.5">
                      ✓ Hủy miễn phí trước 3 ngày
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/rooms/${cat.slug}`}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-[#DADDD8] text-[#17211D] hover:bg-[#F7F4ED] transition-all min-h-[44px] inline-flex items-center justify-center"
                    >
                      Chi Tiết
                    </Link>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#17211D] text-[#C5A46D] hover:bg-[#242826] transition-all shadow-sm min-h-[44px] inline-flex items-center justify-center"
                    >
                      Đặt Ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Booking Modal */}
      {selectedCategory && (
        <BookingModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </section>
  );
}
