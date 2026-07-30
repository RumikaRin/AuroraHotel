"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Header } from "../../../components/layout/Header.tsx";
import { Footer } from "../../../components/layout/Footer.tsx";

const ROOM_DETAILS: Record<string, {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  areaSqM: number;
  bedConfig: string;
  images: string[];
  features: string[];
  ratePlans: Array<{ id: string; name: string; multiplier: number; cancellation: string; inclusions: string }>;
}> = {
  "deluxe-ocean-king": {
    id: "cat-deluxe-king",
    name: "Deluxe Ocean King",
    nameEn: "Deluxe Ocean King Suite",
    description: "Phòng Deluxe cao cấp hướng biển với giường King sang trọng, ban công riêng biệt ngắm bình minh trên vịnh. Thiết kế tinh tế kết hợp hài hòa giữa chất liệu gỗ tự nhiên và màu sắc trầm ấm của phong cách đương đại Việt Nam.",
    basePrice: 2500000,
    maxOccupancy: 2,
    areaSqM: 45,
    bedConfig: "1 King Bed",
    images: ["/images/aurora/deluxe-king.jpg", "/images/aurora/hero-1.jpg", "/images/aurora/hero-2.jpg"],
    features: [
      "Ban công riêng hướng đại dương",
      "Phòng tắm đá cẩm thạch với bồn tắm nằm riêng",
      "Máy pha cà phê Espresso & trà thượng hạng",
      "Wi-Fi tốc độ cao & TV thông minh 55 inch",
      "Áo bố & sản phẩm tắm thảo mộc độc quyền",
    ],
    ratePlans: [
      {
        id: "rp-flex",
        name: "Linh Hoạt Huỷ Phòng (Flexible Rate)",
        multiplier: 1.0,
        cancellation: "Miễn phí huỷ phòng trước 48 giờ",
        inclusions: "Bao gồm ăn sáng tự chọn cho 2 người lớn & đồ uống chào mừng",
      },
      {
        id: "rp-non-ref",
        name: "Ưu Đãi Đặt Phải Không Hoàn Huỷ (Non-Refundable)",
        multiplier: 0.85,
        cancellation: "Không hoàn huỷ sau khi thanh toán thành công",
        inclusions: "Bao gồm ăn sáng & giảm 15% dịch vụ Spa",
      },
    ],
  },
  "executive-bay-suite": {
    id: "cat-executive-suite",
    name: "Executive Bay Suite",
    nameEn: "Executive Bay Suite",
    description: "Không gian sang trọng bậc nhất với phòng khách riêng biệt, tầm nhìn 180 độ ra đại dương và quyền lợi Club Lounge độc quyền.",
    basePrice: 4200000,
    maxOccupancy: 3,
    areaSqM: 75,
    bedConfig: "1 Super King Bed",
    images: ["/images/aurora/executive-suite.jpg", "/images/aurora/hero-2.jpg"],
    features: [
      "Quyền vào Executive Club Lounge & Tiệc trà chiều",
      "Phòng khách riêng biệt trang bị sofa da cao cấp",
      "Bồn Jacuzzi ngắm biển",
      "Dịch vụ quản gia 24/7 theo yêu cầu",
    ],
    ratePlans: [
      {
        id: "rp-flex",
        name: "Linh Hoạt Huỷ Phòng (Flexible Rate)",
        multiplier: 1.0,
        cancellation: "Miễn phí huỷ phòng trước 48 giờ",
        inclusions: "Bao gồm ăn sáng Club Lounge & Tiệc Cocktail chiều",
      },
    ],
  },
};

export default function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const room = ROOM_DETAILS[slug] || ROOM_DETAILS["deluxe-ocean-king"];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(room.ratePlans[0]?.id || "rp-flex");
  const [selectedImage, setSelectedImage] = useState<string>(room.images[0] || "");

  const selectedPlan = room.ratePlans.find((p) => p.id === selectedPlanId) || room.ratePlans[0];
  const finalPrice = Math.round(room.basePrice * (selectedPlan?.multiplier || 1));

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="text-xs text-[#355B4B] space-x-2">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link href="/rooms" className="hover:underline">Phòng & Biệt Thự</Link>
          <span>/</span>
          <span className="text-[#17211D] font-semibold">{room.name}</span>
        </div>

        {/* Gallery & Main info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Photo Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="h-[420px] rounded-3xl bg-[#17211D] overflow-hidden relative shadow-md">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${selectedImage || room.images[0]})` }}
              />
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {room.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? "border-[#C5A46D] scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Room Details & Pricing Sidebar */}
          <div className="lg:col-span-5 bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#C5A46D] uppercase tracking-widest">
                AURORA ROOM DETAILS
              </span>
              <h1 className="font-serif-display text-3xl text-[#17211D] font-medium">
                {room.name}
              </h1>
              <div className="flex items-center space-x-4 text-xs font-medium text-[#355B4B]">
                <span>Diện tích: {room.areaSqM} m²</span>
                <span>•</span>
                <span>{room.bedConfig}</span>
                <span>•</span>
                <span>Tối đa {room.maxOccupancy} khách</span>
              </div>
              <p className="text-sm text-[#242826]/80 leading-relaxed pt-2 border-t border-[#DADDD8]/60">
                {room.description}
              </p>
            </div>

            {/* Rate Plan Selector */}
            <div className="space-y-3 pt-4 border-t border-[#DADDD8]">
              <span className="text-xs font-semibold text-[#17211D]">Chọn Gói Gía & Chính Sách:</span>
              <div className="space-y-2">
                {room.ratePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlanId === plan.id
                        ? "border-[#C5A46D] bg-[#F7F4ED]/60 shadow-sm"
                        : "border-[#DADDD8] hover:border-[#C5A46D]/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#17211D]">{plan.name}</span>
                      <span className="text-xs font-bold text-[#355B4B]">
                        {Math.round(room.basePrice * plan.multiplier).toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2E7D5A] mt-1 font-medium">{plan.cancellation}</p>
                    <p className="text-[11px] text-[#242826]/70 mt-0.5">{plan.inclusions}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-4 border-t border-[#DADDD8] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#242826]/60">Tổng giá mỗi đêm</span>
                <div className="text-2xl font-bold text-[#17211D]">
                  {finalPrice.toLocaleString("vi-VN")} <span className="text-xs font-normal">VND</span>
                </div>
              </div>
              <Link
                href={`/booking?roomCategoryId=${room.id}&ratePlanId=${selectedPlanId}`}
                className="px-6 py-3 rounded-xl bg-[#C5A46D] text-[#17211D] text-sm font-semibold hover:bg-[#b0905b] transition-all shadow-md"
              >
                Đặt Ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Room Amenities Section */}
        <section className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#DADDD8] space-y-4">
          <h3 className="font-serif-display text-xl text-[#17211D]">Tiện Nghi Hạng Phòng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-[#242826]/80">
            {room.features.map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-[#F7F4ED] p-3 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-[#C5A46D]" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
