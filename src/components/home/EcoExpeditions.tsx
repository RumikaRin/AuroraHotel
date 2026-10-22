import Image from "next/image";

export function EcoExpeditions() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500" id="expeditions">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">HẢI TRÌNH & BẢO TỒN THIÊN NHIÊN</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-12">
          Khám phá hệ sinh thái di sản Sơn Trà
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent-brass)] mb-2 font-medium block">
              DI SẢN THIÊN NHIÊN QUỐC GIA
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-6">
              Voọc Chà Vá Chân Nâu — Nữ hoàng linh trưởng
            </h3>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6">
              Bán đảo Sơn Trà là ngôi nhà tự nhiên lớn nhất của loài linh trưởng quý hiếm bậc nhất thế giới. Cùng chuyên gia sinh thái của resort tham gia tour đi bộ tĩnh lặng trong rừng nguyên sinh vào lúc sáng sớm.
            </p>
            <div className="space-y-4 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent-brass)]">✦</span>
                <div>
                  <strong>Hải trình Catamaran riêng ngắm hoàng hôn vịnh:</strong> Du ngoạn quanh bán đảo, lặn ngắm san hô Bãi Bụt và thưởng thức cocktail chiều.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent-brass)]">✦</span>
                <div>
                  <strong>Cam kết bảo tồn & Du lịch tái tạo:</strong> Trích 5% doanh thu mỗi đêm lưu trú để đóng góp trực tiếp vào quỹ bảo tồn sinh cảnh Sơn Trà.
                </div>
              </div>
            </div>

            <a
              href="#suites"
              className="inline-flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-[var(--accent-brass)] hover:text-[var(--accent-brass-bright)] font-semibold"
            >
              Tìm hiểu lịch trình thám hiểm <span>→</span>
            </a>
          </div>

          <div className="relative h-[480px] rounded-lg overflow-hidden border border-[var(--brass-hairline)] shadow-2xl">
            <Image
              src="/images/epilogue-resort.png"
              alt="Hệ sinh thái bán đảo Sơn Trà"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
