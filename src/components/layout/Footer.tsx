import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-aurora-midnight text-aurora-ivory border-t border-aurora-gold/15 py-14 lg:py-20">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-2xl text-aurora-gold tracking-wide">
              AURORA HOTEL
            </h3>
            <p className="text-xs text-aurora-mist leading-relaxed mt-3 max-w-xs">
              Where Every Stay Becomes a Memory. Contemporary luxury hospitality
              experience with oceanfront tranquility in Da Nang, Vietnam.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-aurora-ivory mb-4 uppercase tracking-wider">
              Khám Phá
            </h4>
            <ul className="space-y-1 text-sm text-aurora-mist">
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  Phòng & Suites
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  Trải Nghiệm
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  Ưu Đãi Đặc Biệt
                </Link>
              </li>
            </ul>
          </div>

          {/* Staff Operations */}
          <div>
            <h4 className="text-sm font-semibold text-aurora-ivory mb-4 uppercase tracking-wider">
              Vận Hành
            </h4>
            <ul className="space-y-1 text-sm text-aurora-mist">
              <li>
                <Link
                  href="/admin"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  Quản Trị
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  Đăng Nhập
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-aurora-ivory mb-4 uppercase tracking-wider">
              Liên Hệ
            </h4>
            <address className="not-italic space-y-2 text-sm text-aurora-mist">
              <p>123 Luxury Coastal Boulevard</p>
              <p>Da Nang, Vietnam</p>
              <p className="mt-3">
                <a
                  href="tel:+842363999999"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  +84 236 399 9999
                </a>
              </p>
              <p>
                <a
                  href="mailto:reservations@aurorahotel.com"
                  className="hover:text-aurora-gold min-h-[44px] inline-flex items-center transition-colors duration-200"
                >
                  reservations@aurorahotel.com
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-aurora-charcoal text-center text-xs text-aurora-mist/70">
          &copy; {new Date().getFullYear()} Aurora Hotel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
