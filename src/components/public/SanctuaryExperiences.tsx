import Link from "next/link";

interface ExperienceItem {
  id: string;
  tagline: string;
  title: string;
  description: string;
  features: string[];
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "culinary",
    tagline: "Fine Dining & Seafood",
    title: "Ẩm Thực Thượng Hạng Bên Bờ Biển",
    description: "Hành trình khám phá hương vị hải sản tươi ngon kết hợp cùng nghệ thuật ẩm thực đương đại do các đầu bếp ngôi sao chế biến.",
    features: ["Thực Đơn Omakase Hải Sản", "Hầm Rượu Vang Đẳng Cấp", "Bàn Tiệc Hoàng Hôn Trên Cát"],
  },
  {
    id: "wellness",
    tagline: "Holistic Wellness & Spa",
    title: "Tái Tạo Năng Lượng Tại Aurora Spa",
    description: "Liệu trình trị liệu độc quyền kết hợp thảo dược thiên nhiên Việt Nam và kỹ thuật bấm huyệt chuyên sâu giải tỏa mọi căng thẳng.",
    features: ["Liệu Trình Đá Nóng Thảo Dược", "Phòng Xông Hơi Muối Hồng", "Yoga Bình Minh Bên Bờ Biển"],
  },
  {
    id: "private-beach",
    tagline: "Private Oceanfront Oasis",
    title: "Bãi Biển Biệt Lập & Bể Bơi Vô Cực",
    description: "Thả mình trong làn nước trong xanh riêng biệt, tận hưởng ly cocktail nhiệt đới và không gian yên bình tuyệt đối.",
    features: ["Cabana Riêng Sang Trọng", "Bể Bơi Vô Cực Nước Mặn", "Dịch Vụ Phục Vụ Tại Giường Nắng"],
  },
  {
    id: "butler-service",
    tagline: "Tailored Butler Care",
    title: "Quản Gia Cá Nhân Hóa 24/7",
    description: "Đội ngũ quản gia chuyên nghiệp tận tâm phục vụ mọi nhu cầu cá nhân từ soạn hành lý, đặt lịch trải nghiệm đến bữa ăn riêng tại phòng.",
    features: ["Quản Gia Riêng 24/7", "Đưa Đón Bằng Xe Hạng Sang", "Chuẩn Bị Bồn Tắm Thảo Dược"],
  },
];

export function SanctuaryExperiences() {
  return (
    <section className="bg-[#17211D] text-[#F7F4ED] py-24 px-4 sm:px-6 lg:px-8 border-t border-b border-[#C5A46D]/20">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A46D]">
            Trải Nghiệm Nghỉ Dưỡng Trọn Vẹn
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl text-[#F7F4ED]">
            Hệ Sinh Thái Dịch Vụ Đẳng Cấp
          </h2>
          <p className="text-sm text-[#DADDD8] font-light leading-relaxed">
            Mỗi khoảnh khắc tại Aurora Hotel đều được thiết kế mang lại sự thư thái tuyệt đối và giá trị cảm xúc riêng biệt.
          </p>
        </div>

        {/* 2x2 Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXPERIENCES.map((item) => (
            <div
              key={item.id}
              className="bg-[#242826] p-8 rounded-3xl border border-[#C5A46D]/20 hover:border-[#C5A46D]/50 transition-all duration-300 space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A46D]">
                  {item.tagline}
                </span>
                <h3 className="font-serif-display text-2xl text-[#F7F4ED] group-hover:text-[#C5A46D] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#DADDD8] leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#17211D] space-y-2">
                {item.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#C5A46D]">
                    <span>✦</span>
                    <span className="text-[#F7F4ED] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="text-center pt-4">
          <Link
            href="/experiences"
            className="px-8 py-3.5 rounded-xl text-xs font-semibold bg-[#C5A46D] text-[#17211D] hover:bg-[#D4B57E] transition-all inline-flex items-center gap-2 shadow-lg min-h-[44px]"
          >
            <span>Khám Phá Tất Cả Trải Nghiệm</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
