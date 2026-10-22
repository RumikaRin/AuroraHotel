import Image from "next/image";
import Link from "next/link";

export function CuratedJourneys() {
  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="packages">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">HÀNH TRÌNH ĐẶC BIỆT THEO MÙA</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Những kỳ nghỉ thiết kế riêng
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mb-12">
          Các gói trải nghiệm trọn gói kết hợp lưu trú thượng lưu, ẩm thực tinh hoa và các hoạt động khám phá bản địa.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Signature 4D3N Journey */}
          <div className="lg:col-span-7 bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="relative h-72 sm:h-80 w-full">
              <Image
                src="/images/aurora/presidential-villa.jpg"
                alt="Signature Journey"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface-card)] via-transparent to-transparent" />
            </div>

            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] mb-2 block font-medium">
                  GÓI NGHỈ DƯỠNG TRỌN GÓI 4 NGÀY 3 ĐÊM
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[var(--text-primary)] mb-4">
                  Hành Trình Tĩnh Tại Sơn Trà & Dạ Tiệc Bờ Sóng
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  Nghỉ dưỡng tại Biệt thự Biển riêng, hải trình du thuyền ngắm hoàng hôn, tiệc tối 5 món của bếp trưởng trên bãi cát và liệu trình chăm sóc spa mỗi ngày.
                </p>

                <ul className="space-y-3 border-t border-[var(--brass-hairline)] pt-6 text-sm text-[var(--text-primary)] mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>3 đêm lưu trú tại Presidential Beachfront Villa</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>Bữa sáng buffet thượng hạng và tiệc tối riêng tư trên bãi biển</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[var(--accent-brass)]">—</span>
                    <span>Dịch vụ xe Limousine đưa đón hai chiều sân bay Đà Nẵng</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-[var(--brass-hairline)] gap-4 tabular-nums">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--accent-brass)]">Trọn gói cho 2 khách</span>
                  <strong className="font-serif-luxury text-2xl sm:text-3xl text-[var(--text-primary)]">24.500.000 ₫</strong>
                </div>
                <Link
                  href="/rooms/presidential-suite"
                  className="px-6 py-3 bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-bright)] text-[var(--accent-brass-ink)] font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-lg"
                >
                  Khám phá hải trình →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Stays Ledger */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Ledger Card 1 */}
            <div className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between hover:border-[var(--accent-brass)] transition-colors">
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-[var(--brass-hairline)]">
                    <Image src="/images/aurora/executive-suite.jpg" alt="Trăng Mật" fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--accent-brass)] block mb-1">
                      3 NGÀY 2 ĐÊM · DÀNH CHO CẶP ĐÔI
                    </span>
                    <h4 className="font-serif-luxury text-xl sm:text-2xl text-[var(--text-primary)]">
                      Kỳ Nghỉ Trăng Mật Hoàng Hôn
                    </h4>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-6">
                  Nâng hạng Suite hướng biển lộng gió, hoa tươi đón chào, bữa tối lãng mạn dưới ánh nến và liệu trình phục hồi đôi tại Spa Mộc.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[var(--accent-brass)]">Trọn gói kỳ nghỉ</span>
                  <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">9.800.000 ₫</strong>
                </div>
                <Link href="/rooms/executive-suite" className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline font-medium">
                  Chi tiết gói →
                </Link>
              </div>
            </div>

            {/* Ledger Card 2 */}
            <div className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between hover:border-[var(--accent-brass)] transition-colors">
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-[var(--brass-hairline)]">
                    <Image src="/images/aurora/deluxe-king.jpg" alt="Đặc Quyền" fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--accent-brass)] block mb-1">
                      ƯU ĐÃI ĐẶT TRƯỚC 30 NGÀY · TỪ 2 ĐÊM
                    </span>
                    <h4 className="font-serif-luxury text-xl sm:text-2xl text-[var(--text-primary)]">
                      Đặc Quyền Mùa Tĩnh Lặng
                    </h4>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-6">
                  Ưu đãi 20% trên giá công bố trực tiếp, tặng kèm voucher 1.000.000 ₫ ẩm thực & spa, đặc quyền nhận phòng sớm từ 10:00 sáng.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--brass-hairline)] tabular-nums">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-[var(--accent-brass)]">Giá khởi điểm từ</span>
                  <strong className="font-serif-luxury text-xl text-[var(--text-primary)]">2.000.000 ₫ / đêm</strong>
                </div>
                <Link href="/rooms/deluxe-king" className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline font-medium">
                  Chi tiết gói →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
