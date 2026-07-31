"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const ROOM_CATEGORIES = [
  {
    id: "cat-deluxe-king",
    slug: "deluxe-ocean-king",
    name: "Deluxe Ocean King",
    nameEn: "Deluxe Ocean King Suite",
    description: "Phòng Deluxe cao cấp hướng biển với giường King sang trọng, ban công riêng biệt ngắm bình minh trên vịnh.",
    descriptionEn: "Luxury oceanview Deluxe suite with plush King bed, private balcony overlooking the sunrise.",
    basePrice: 2500000,
    maxOccupancy: 2,
    areaSqM: 45,
    bedConfig: "1 King Bed",
    image: "/images/aurora/deluxe-king.jpg",
    amenities: ["Ocean View", "Private Balcony", "High-speed Wi-Fi", "Espresso Machine", "Marble Bathroom"],
  },
  {
    id: "cat-executive-suite",
    slug: "executive-bay-suite",
    name: "Executive Bay Suite",
    nameEn: "Executive Bay Suite",
    description: "Không gian sang trọng bậc nhất với phòng khách riêng biệt, tầm nhìn 180 độ ra đại dương và dịch vụ Club Lounge.",
    descriptionEn: "Panoramic 180-degree oceanview suite with separate living area and exclusive Club Lounge access.",
    basePrice: 4200000,
    maxOccupancy: 3,
    areaSqM: 75,
    bedConfig: "1 Super King Bed",
    image: "/images/aurora/executive-suite.jpg",
    amenities: ["Panaroma Ocean View", "Living Room", "Club Lounge Access", "Jacuzzi", "24/7 Butler"],
  },
  {
    id: "cat-family-villa",
    slug: "family-garden-villa",
    name: "Family Garden Villa",
    nameEn: "Family Garden Villa",
    description: "Biệt thự sân vườn yên bình thiết kế riêng cho gia đình, hồ bơi tràn bờ riêng biệt và khu vực BBQ ngoài trời.",
    descriptionEn: "Tranquil garden villa designed for families featuring private plunge pool and outdoor lounge.",
    basePrice: 6500000,
    maxOccupancy: 4,
    areaSqM: 120,
    bedConfig: "2 King Beds",
    image: "/images/aurora/family-villa.jpg",
    amenities: ["Private Pool", "Garden View", "Outdoor Dining", "Full Kitchenette", "Family Concierge"],
  },
  {
    id: "cat-presidential-villa",
    slug: "presidential-oceanfront-villa",
    name: "Presidential Oceanfront Villa",
    nameEn: "Presidential Oceanfront Villa",
    description: "Dinh thự bên bờ biển riêng biệt đỉnh cao nghỉ dưỡng, 3 phòng ngủ, sân trực thăng riêng và đầu bếp cá nhân.",
    descriptionEn: "Ultra-luxury oceanfront estate with 3 bedrooms, private beachfront, and personal chef service.",
    basePrice: 15500000,
    maxOccupancy: 6,
    areaSqM: 280,
    bedConfig: "3 King Suites",
    image: "/images/aurora/presidential-villa.jpg",
    amenities: ["Private Beachfront", "Infinite Pool", "Personal Chef", "Spa Room", "Helipad Access"],
  },
];

export default function RoomsPage() {
  const [guestsFilter, setGuestsFilter] = useState<number>(1);

  const filteredCategories = ROOM_CATEGORIES.filter(
    (c) => c.maxOccupancy >= guestsFilter
  );

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242826] flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#17211D] text-[#F7F4ED] py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[#C5A46D] text-xs font-semibold uppercase tracking-widest">
            AURORA HOSPITALITY COLLECTION
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-light tracking-wide text-[#F7F4ED]">
            Phòng & Biệt Thự Nghỉ Dưỡng
          </h1>
          <p className="text-[#DADDD8] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Khám phá không gian nghỉ dưỡng đương đại giữa thiên nhiên nhiệt đới thanh bình, nơi từng chi tiết kiến trúc tôn vinh sự thư thái tuyệt đối.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 -mt-6 z-10">
        <div className="bg-[#FFFDF8] rounded-2xl p-6 shadow-md border border-[#DADDD8] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-[#17211D]">Sức chứa tối thiểu:</span>
            <select
              value={guestsFilter}
              onChange={(e) => setGuestsFilter(Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-[#DADDD8] bg-[#F7F4ED] text-sm text-[#17211D] focus:outline-none focus:border-[#C5A46D]"
            >
              <option value={1}>1+ Khách</option>
              <option value={2}>2+ Khách</option>
              <option value={3}>3+ Khách</option>
              <option value={4}>4+ Khách</option>
            </select>
          </div>
          <span className="text-xs text-[#355B4B] font-medium">
            Hiển thị {filteredCategories.length} hạng phòng đáp ứng tiêu chuẩn
          </span>
        </div>
      </section>

      {/* Room Showcase Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {filteredCategories.map((category, idx) => (
          <div
            key={category.id}
            className={`bg-[#FFFDF8] rounded-3xl overflow-hidden shadow-sm border border-[#DADDD8] grid grid-cols-1 lg:grid-cols-12 transition-all hover:shadow-lg ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Image Section */}
            <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px] bg-[#17211D]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${category.image}), linear-gradient(to bottom, rgba(23,33,29,0.2), rgba(23,33,29,0.7))`,
                }}
              />
              <div className="absolute top-4 left-4 bg-[#17211D]/80 backdrop-blur-sm text-[#C5A46D] px-3 py-1 rounded-lg text-xs font-medium">
                {category.areaSqM} m² • {category.bedConfig}
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#355B4B] uppercase tracking-wider">
                  Tối đa {category.maxOccupancy} người lớn
                </span>
                <h2 className="font-serif-display text-2xl sm:text-3xl text-[#17211D] font-medium">
                  {category.name}
                </h2>
                <p className="text-sm text-[#242826]/80 leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Amenities Badges */}
              <div className="flex flex-wrap gap-2">
                {category.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="bg-[#F7F4ED] text-[#355B4B] text-xs px-2.5 py-1 rounded-md border border-[#DADDD8]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="pt-4 border-t border-[#DADDD8]/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#242826]/60">Giá trung bình từ</span>
                  <div className="text-xl font-bold text-[#17211D]">
                    {category.basePrice.toLocaleString("vi-VN")} <span className="text-xs font-normal">VND / đêm</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/rooms/${category.slug}`}
                    className="px-4 py-2.5 rounded-xl border border-[#17211D] text-[#17211D] text-xs font-semibold hover:bg-[#17211D] hover:text-[#F7F4ED] transition-all"
                  >
                    Chi Tiết
                  </Link>
                  <Link
                    href={`/booking?roomCategoryId=${category.id}`}
                    className="px-5 py-2.5 rounded-xl bg-[#C5A46D] text-[#17211D] text-xs font-semibold hover:bg-[#b0905b] transition-all shadow-sm"
                  >
                    Đặt Phòng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
