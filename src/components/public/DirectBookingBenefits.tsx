interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: "💎",
    title: "Cam Kết Giá Tốt Nhất",
    description: "Đảm bảo mức giá ưu đãi trực tiếp nhất cùng mã giảm giá 10% độc quyền khi đặt phòng qua website chính thức.",
  },
  {
    icon: "🍳",
    title: "Miễn Phí Bữa Sáng Buffet",
    description: "Thưởng thức bữa sáng sang trọng chuẩn quốc tế kết hợp đặc sản biển Việt Nam mỗi ngày lưu trú.",
  },
  {
    icon: "🛡️",
    title: "Hủy Phòng Linh Hoạt",
    description: "Hoàn toàn chủ động thay đổi hoặc hủy phòng miễn phí trước 3 ngày nhận phòng không tính thêm phụ phí.",
  },
  {
    icon: "🌅",
    title: "Ưu Tiên Nhận Phòng Sớm",
    description: "Tận hưởng ưu tiên nhận phòng sớm hoặc trả phòng muộn linh hoạt dựa trên tình trạng phòng sẵn có.",
  },
];

export function DirectBookingBenefits() {
  return (
    <section className="bg-[#F7F4ED] text-[#17211D] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#355B4B]">
            Đặc Quyền Khách Hàng Trực Tiếp
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl text-[#17211D]">
            Vì Sao Nên Đặt Phòng Tại AuroraHotel.com?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, idx) => (
            <div
              key={idx}
              className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DADDD8] space-y-3 hover:border-[#C5A46D] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F7F4ED] text-2xl flex items-center justify-center border border-[#DADDD8]">
                {b.icon}
              </div>
              <h3 className="font-serif-display text-lg font-semibold text-[#17211D]">
                {b.title}
              </h3>
              <p className="text-xs text-[#242826] leading-relaxed font-light">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
