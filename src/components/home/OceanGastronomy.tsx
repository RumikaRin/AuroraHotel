import Image from "next/image";

export function OceanGastronomy() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500" id="gastronomy">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">ẨM THỰC BẢN ĐỊA & HẦM RƯỢU TỰ NHIÊN</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-12">
          Hương vị tinh hoa biển miền Trung
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[480px] rounded-lg overflow-hidden border border-[var(--brass-hairline)] shadow-2xl">
            <Image
              src="/images/aurora/executive-suite.jpg"
              alt="Nhà hàng Vách Đá Sa Thạch"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent-brass)] mb-2 font-medium">
              ẨM THỰC TỪ TRANG TRẠI ĐẾN BÀN ĂN
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-6">
              Nhà hàng Vách Đá Sa Thạch
            </h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6">
              Nguyên liệu tươi ngon đánh bắt trong ngày từ ngư dân Sơn Trà, kết hợp cùng các loại thảo mộc rừng bản địa và kỹ thuật chế biến đương đại của bếp trưởng quốc tế.
            </p>
            <ul className="space-y-4 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Bò Wagyu ủ khô trên than củi gỗ đước tự nhiên</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Hải sản vịnh Đà Nẵng hấp sả chanh và lá giang Sơn Trà</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[var(--accent-brass)]">—</span>
                <span>Hầm rượu vách đá tự nhiên lưu trữ hơn 450 nhãn rượu vang danh tiếng thế giới</span>
              </li>
            </ul>

            <a
              href="#suites"
              className="inline-flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-[var(--accent-brass)] hover:text-[var(--accent-brass-bright)] font-semibold"
            >
              Đặt bàn bữa tối ngắm hoàng hôn <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
