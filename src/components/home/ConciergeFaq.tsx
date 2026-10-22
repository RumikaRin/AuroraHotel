"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Thời gian nhận phòng và trả phòng tại Aurora như thế nào?",
    a: "Thời gian nhận phòng tiêu chuẩn là 14:00 và trả phòng là 12:00 trưa. Khách đặt phòng trực tiếp qua website được ưu tiên nhận phòng sớm hoặc trả phòng muộn tùy thuộc vào tình trạng phòng trống mà không tính thêm phụ phí.",
  },
  {
    q: "Khu nghỉ dưỡng có dịch vụ đưa đón từ sân bay quốc tế Đà Nẵng không?",
    a: "Có, chúng tôi cung cấp dịch vụ xe Limousine riêng đưa đón từ Sân bay Quốc tế Đà Nẵng (thời gian di chuyển khoảng 25 phút). Miễn phí đưa đón 2 chiều cho khách đặt phòng hạng Executive Suite và Villa trở lên.",
  },
  {
    q: "Chính sách hủy phòng và đổi ngày lưu trú có linh hoạt không?",
    a: "Tất cả đặt phòng trực tiếp qua website của chúng tôi đều được hưởng chính sách hủy phòng miễn phí trước 7 ngày so với ngày nhận phòng tiêu chuẩn, và hỗ trợ đổi ngày lưu trú trong vòng 6 tháng.",
  },
  {
    q: "Resort có phù hợp cho gia đình có trẻ nhỏ không?",
    a: "Aurora là không gian tĩnh tại hướng đến thiên nhiên nhưng chúng tôi luôn chào đón các gia đình. Chúng tôi có các hoạt động khám phá thiên nhiên, lớp làm gốm và dịch vụ bảo mẫu chuyên nghiệp theo yêu cầu riêng.",
  },
];

export function ConciergeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="faq">
      <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="section-eyebrow">HỎI ĐÁP & CHUẨN BỊ KỲ NGHỈ</div>
          <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl text-[var(--text-primary)] mb-6">
            Thông tin chuẩn bị cho kỳ nghỉ của bạn
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Đội ngũ quản gia Aurora Concierge luôn túc trực 24/7 để đáp ứng mọi yêu cầu riêng biệt từ việc đón tiễn sân bay đến chuẩn bị hoa tươi trong phòng.
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-lg overflow-hidden bg-[var(--bg-surface-card)] transition-all duration-300 ${
                  isOpen ? "border-[var(--accent-brass)] shadow-xl" : "border-[var(--brass-hairline)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)]"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif-luxury text-lg sm:text-xl text-[var(--text-primary)] font-medium">
                    {faq.q}
                  </span>
                  <span
                    className={`faq-icon inline-flex items-center justify-center w-8 h-8 min-w-8 rounded-full border border-[var(--brass-hairline)] text-[var(--accent-brass)] transition-transform duration-500 ${
                      isOpen ? "rotate-45 bg-[var(--accent-brass)] text-[var(--accent-brass-ink)]" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Zero-Layout-Shift CSS Grid Fraction Height Transition */}
                <div
                  className="transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grid"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-6 pb-6 text-sm text-[var(--text-secondary)] leading-relaxed transition-all duration-300 ${
                        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                      }`}
                    >
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
