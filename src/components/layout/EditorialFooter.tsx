import Link from "next/link";

export function EditorialFooter() {
  return (
    <footer className="relative bg-[var(--bg-surface-deep)] text-[var(--text-secondary)] pt-32 pb-12 px-6 sm:px-12 md:px-16 overflow-hidden border-t border-[var(--brass-hairline)]">
      {/* Giant Typography Watermark Background */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 font-serif-luxury text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] tracking-[0.25em] text-[var(--brass-glow)] whitespace-nowrap pointer-events-none select-none font-light opacity-60"
        aria-hidden="true"
      >
        A U R O R A
      </div>

      <div className="relative z-10 max-w-[1380px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[var(--brass-hairline)]">
          <div className="lg:col-span-5">
            <h4 className="font-serif-luxury text-3xl text-[var(--text-primary)] mb-4 tracking-wider">
              A U R O R A
            </h4>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Khu nghỉ dưỡng biệt lập vách đá bán đảo Sơn Trà. Nơi thiên nhiên nguyên sơ giao hòa cùng nghệ thuật kiến trúc tĩnh tại.
            </p>
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <div>Tọa độ: 16°07′12″B · 108°17′06″Đ</div>
              <div>Bãi Bụt, Bán đảo Sơn Trà, TP. Đà Nẵng, Việt Nam</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              KHÁM PHÁ
            </h5>
            <ul className="space-y-3 text-xs">
              <li><Link href="/rooms" className="hover:text-[var(--text-primary)] transition-colors">Bộ sưu tập Suites & Villas</Link></li>
              <li><Link href="/experiences" className="hover:text-[var(--text-primary)] transition-colors">Ẩm thực vách đá & Trải nghiệm</Link></li>
              <li><Link href="/offers" className="hover:text-[var(--text-primary)] transition-colors">Đặc quyền lưu trú theo mùa</Link></li>
              <li><Link href="/#masterplan" className="hover:text-[var(--text-primary)] transition-colors">Sơ đồ phân khu bán đảo</Link></li>
              <li><Link href="/#manifesto" className="hover:text-[var(--text-primary)] transition-colors">Triết lý kiến trúc</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              THÔNG TIN & QUẢN LÝ
            </h5>
            <ul className="space-y-3 text-xs">
              <li><Link href="/my-bookings" className="hover:text-[var(--text-primary)] transition-colors">Tra cứu & Quản lý đặt phòng</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Chính sách bảo mật dữ liệu</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Điều khoản dịch vụ lưu trú</Link></li>
              <li><Link href="/#faq" className="hover:text-[var(--text-primary)] transition-colors">Hỏi đáp dịch vụ thường gặp</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent-brass)] font-semibold mb-4">
              LIÊN HỆ QUẢN GIA
            </h5>
            <div className="text-xs space-y-2">
              <div>Hotline 24/7: +84 (0) 236 399 8888</div>
              <div>Email: concierge@aurora-resort.vn</div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block text-[11px] text-[var(--accent-brass)] hover:underline"
                >
                  Cổng đăng nhập khách hàng & nhân viên ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--text-muted)] gap-4">
          <div>© 2026 Aurora Hotel & Sanctuary. Bản quyền đã được bảo lưu.</div>
          <div className="flex items-center gap-6">
            <span>Bán Đảo Sơn Trà, Đà Nẵng</span>
            <span>·</span>
            <span>Awwwards Site of the Day Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
