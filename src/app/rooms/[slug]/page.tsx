"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type RoomDetail = {
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
};

const ROOM_DETAILS: Record<string, RoomDetail> = {
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
      "Áo choàng & sản phẩm tắm thảo mộc độc quyền",
    ],
    ratePlans: [
      { id: "rp-flex", name: "Linh hoạt · Flexible rate", multiplier: 1, cancellation: "Miễn phí huỷ phòng trước 48 giờ", inclusions: "Ăn sáng tự chọn cho 2 người lớn & đồ uống chào mừng" },
      { id: "rp-non-ref", name: "Đặt sớm · Non-refundable", multiplier: .85, cancellation: "Không hoàn huỷ sau khi thanh toán thành công", inclusions: "Ăn sáng & giảm 15% dịch vụ Spa" },
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
      "Quyền vào Executive Club Lounge & tiệc trà chiều",
      "Phòng khách riêng biệt trang bị sofa da cao cấp",
      "Bồn Jacuzzi ngắm biển",
      "Dịch vụ quản gia theo yêu cầu",
    ],
    ratePlans: [
      { id: "rp-flex", name: "Linh hoạt · Flexible rate", multiplier: 1, cancellation: "Miễn phí huỷ phòng trước 48 giờ", inclusions: "Ăn sáng Club Lounge & tiệc cocktail chiều" },
    ],
  },
};

function dateQuery(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const key of ["checkIn", "checkOut", "guests"]) {
    const value = searchParams[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  return query;
}

export default function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = use(params);
  const query = use(searchParams);
  const room = ROOM_DETAILS[slug] || ROOM_DETAILS["deluxe-ocean-king"];
  const [selectedPlanId, setSelectedPlanId] = useState(room.ratePlans[0]?.id || "rp-flex");
  const [selectedImage, setSelectedImage] = useState(room.images[0] || "");
  const selectedPlan = room.ratePlans.find((plan) => plan.id === selectedPlanId) || room.ratePlans[0];
  const bookingParams = dateQuery(query);
  bookingParams.set("roomCategoryId", room.id);
  bookingParams.set("ratePlanId", selectedPlan?.id || "rp-flex");
  const bookingHref = `/booking?${bookingParams.toString()}`;

  return (
    <div className="room-detail-page">
      <Header />

      <main className="wrap room-detail-main">
        <nav className="room-breadcrumb" aria-label="Điều hướng mẩu tin">
          <Link href="/">Aurora</Link><span aria-hidden="true">/</span><Link href="/rooms">Rooms & suites</Link><span aria-hidden="true">/</span><strong>{room.name}</strong>
        </nav>

        <div className="room-detail-layout">
          <section className="room-detail-gallery" aria-label={`Thư viện ảnh ${room.name}`}>
            <div className="room-detail-main-image">
              <Image src={selectedImage} alt={`${room.name} · ảnh chính`} fill priority sizes="(max-width: 900px) 100vw, 62vw" className="room-detail-photo" />
              <span className="room-detail-image-label">{room.nameEn}</span>
            </div>
            <div className="room-detail-thumbs" aria-label="Các ảnh trong phòng">
              {room.images.map((image, index) => (
                <button key={image} type="button" className={selectedImage === image ? "active" : ""} onClick={() => setSelectedImage(image)} aria-label={`Chọn ảnh ${index + 1}`} aria-pressed={selectedImage === image}>
                  <Image src={image} alt="" fill sizes="120px" className="room-detail-thumb" />
                </button>
              ))}
            </div>
          </section>

          <aside className="room-detail-panel" aria-labelledby="room-detail-title">
            <p className="room-detail-eyebrow">Aurora room details</p>
            <h1 id="room-detail-title">{room.name}</h1>
            <p className="room-detail-meta">{room.areaSqM} m² <span>·</span> {room.bedConfig} <span>·</span> tối đa {room.maxOccupancy} khách</p>
            <p className="room-detail-description">{room.description}</p>

            <div className="room-plan-section">
              <div className="room-plan-heading"><h2>Chọn cách lưu trú</h2><span>Rate plan</span></div>
              <div className="room-plan-list" role="radiogroup" aria-label="Chọn rate plan">
                {room.ratePlans.map((plan) => (
                  <button key={plan.id} type="button" role="radio" aria-checked={selectedPlanId === plan.id} className={`room-plan-option ${selectedPlanId === plan.id ? "active" : ""}`} onClick={() => setSelectedPlanId(plan.id)}>
                    <span className="room-plan-radio" aria-hidden="true" />
                    <span className="room-plan-copy"><strong>{plan.name}</strong><small>{plan.cancellation}</small><em>{plan.inclusions}</em></span>
                    <span className="room-plan-price">{Math.round(room.basePrice * plan.multiplier).toLocaleString("vi-VN")} ₫<small>/ đêm</small></span>
                  </button>
                ))}
              </div>
            </div>

            <div className="room-detail-cta">
              <div><small>Giá tham khảo từ</small><strong>{Math.round(room.basePrice * (selectedPlan?.multiplier || 1)).toLocaleString("vi-VN")} ₫</strong></div>
              <Link href={bookingHref}>Chọn ngày & đặt phòng <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="room-quote-note">Giá và tổng tiền cuối cùng được xác nhận theo ngày lưu trú ở bước báo giá.</p>
          </aside>
        </div>

        <section className="room-detail-features" aria-labelledby="features-title">
          <div><p className="room-detail-eyebrow">The details</p><h2 id="features-title">Những điều đã được nghĩ đến</h2></div>
          <div className="room-feature-grid">{room.features.map((feature) => <span key={feature}><i aria-hidden="true">✦</i>{feature}</span>)}</div>
        </section>
      </main>

      <Footer />

      <style>{`
        .room-detail-page { min-height: 100vh; background: var(--warm-ivory); color: var(--espresso); }
        .room-detail-main { padding-block: 34px 120px; }
        .room-breadcrumb { display: flex; align-items: center; gap: 10px; color: var(--taupe); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
        .room-breadcrumb a:hover { color: var(--muted-terracotta); }
        .room-breadcrumb strong { color: var(--espresso); font-weight: 700; }
        .room-detail-layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(360px, .9fr); gap: 54px; align-items: start; padding-top: 34px; }
        .room-detail-main-image { position: relative; height: min(66vw, 670px); min-height: 480px; overflow: hidden; background: var(--walnut); }
        .room-detail-photo { object-fit: cover; }
        .room-detail-image-label { position: absolute; left: 24px; bottom: 22px; padding: 9px 12px; background: rgba(25,21,18,.72); color: var(--warm-ivory); font-size: 9px; letter-spacing: .16em; text-transform: uppercase; backdrop-filter: blur(8px); }
        .room-detail-thumbs { display: flex; gap: 10px; overflow-x: auto; padding-top: 12px; }
        .room-detail-thumbs button { position: relative; width: 106px; height: 76px; flex: 0 0 auto; overflow: hidden; border: 1px solid transparent; opacity: .58; }
        .room-detail-thumbs button.active, .room-detail-thumbs button:hover { border-color: var(--antique-brass); opacity: 1; }
        .room-detail-thumb { object-fit: cover; }
        .room-detail-panel { padding-top: 28px; }
        .room-detail-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .room-detail-panel h1 { margin: 0; font: 500 clamp(54px, 6vw, 88px)/.84 var(--font-display); letter-spacing: -.05em; }
        .room-detail-meta { display: flex; gap: 10px; margin: 22px 0 0; color: var(--walnut); font-size: 11px; font-weight: 600; }
        .room-detail-meta span { color: var(--antique-brass); }
        .room-detail-description { margin: 28px 0 0; padding-top: 22px; border-top: 1px solid var(--line); color: var(--taupe); font-size: 13px; line-height: 1.9; }
        .room-plan-section { margin-top: 42px; }
        .room-plan-heading { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
        .room-plan-heading h2 { margin: 0; font: 500 28px/1 var(--font-display); }
        .room-plan-heading span { color: var(--taupe); font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
        .room-plan-list { display: grid; gap: 10px; padding-top: 12px; }
        .room-plan-option { display: grid; grid-template-columns: 16px 1fr auto; gap: 12px; align-items: start; width: 100%; padding: 17px 15px; border: 1px solid #d9cfc3; background: transparent; color: var(--espresso); text-align: left; }
        .room-plan-option:hover, .room-plan-option.active { border-color: var(--antique-brass); background: rgba(181,154,107,.12); }
        .room-plan-radio { width: 14px; height: 14px; margin-top: 2px; border: 1px solid var(--taupe); border-radius: 50%; }
        .room-plan-option.active .room-plan-radio { border: 4px solid var(--antique-brass); }
        .room-plan-copy { display: grid; gap: 5px; }
        .room-plan-copy strong { font-size: 12px; font-weight: 700; }
        .room-plan-copy small { color: var(--muted-terracotta); font-size: 10px; }
        .room-plan-copy em { color: var(--taupe); font-size: 10px; font-style: normal; line-height: 1.45; }
        .room-plan-price { white-space: nowrap; color: var(--walnut); font-size: 12px; font-weight: 700; }
        .room-plan-price small { color: var(--taupe); font-size: 9px; font-weight: 400; }
        .room-detail-cta { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--line); }
        .room-detail-cta div { display: grid; gap: 6px; }
        .room-detail-cta small { color: var(--taupe); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .room-detail-cta strong { font: 600 25px/1 var(--font-display); }
        .room-detail-cta a { min-height: 48px; display: inline-flex; align-items: center; gap: 10px; padding: 0 16px; border-radius: 6px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
        .room-detail-cta a:hover { background: var(--walnut); }
        .room-quote-note { margin: 12px 0 0; color: var(--taupe); font-size: 10px; line-height: 1.5; }
        .room-detail-features { display: grid; grid-template-columns: .7fr 1.3fr; gap: 70px; margin-top: 90px; padding-top: 36px; border-top: 1px solid var(--line); }
        .room-detail-features h2 { margin: 0; font: 500 clamp(36px, 4vw, 58px)/.9 var(--font-display); letter-spacing: -.04em; }
        .room-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; }
        .room-feature-grid span { display: flex; gap: 10px; padding-block: 16px; border-bottom: 1px solid var(--line); color: var(--walnut); font-size: 12px; line-height: 1.5; }
        .room-feature-grid i { color: var(--antique-brass); font-style: normal; }
        @media (max-width: 900px) { .room-detail-layout, .room-detail-features { grid-template-columns: 1fr; gap: 34px; } .room-detail-panel { padding-top: 0; } .room-detail-main-image { height: min(92vw, 620px); min-height: 380px; } .room-detail-features { margin-top: 60px; } }
        @media (max-width: 560px) { .room-detail-main { padding-block: 24px 72px; } .room-breadcrumb { overflow-x: auto; white-space: nowrap; } .room-detail-panel h1 { font-size: 64px; } .room-detail-meta { flex-wrap: wrap; } .room-plan-option { grid-template-columns: 16px 1fr; } .room-plan-price { grid-column: 2; } .room-detail-cta { align-items: start; flex-direction: column; } .room-detail-cta a { width: 100%; justify-content: center; } .room-feature-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
