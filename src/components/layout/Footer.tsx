import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#17211D] text-[#F7F4ED] border-t border-[#C5A46D]/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif-display text-xl text-[#C5A46D] mb-4">AURORA HOTEL</h3>
            <p className="text-xs text-[#DADDD8] leading-relaxed">
              Where Every Stay Becomes a Memory. Contemporary luxury hospitality experience with oceanfront tranquility.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F7F4ED] mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-[#DADDD8]">
              <li><Link href="/rooms" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Rooms & Suites</Link></li>
              <li><Link href="/dining" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Fine Dining</Link></li>
              <li><Link href="/spa" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Spa & Wellness</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F7F4ED] mb-3">Staff Operations</h4>
            <ul className="space-y-2 text-xs text-[#DADDD8]">
              <li><Link href="/reception" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Reception Desk</Link></li>
              <li><Link href="/housekeeping" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Housekeeping</Link></li>
              <li><Link href="/admin" className="hover:text-[#C5A46D] min-h-[44px] inline-flex items-center">Management Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F7F4ED] mb-3">Contact</h4>
            <p className="text-xs text-[#DADDD8]">123 Luxury Coastal Boulevard, Da Nang, Vietnam</p>
            <p className="text-xs text-[#DADDD8] mt-1">Phone: +84 236 399 9999</p>
            <p className="text-xs text-[#DADDD8] mt-1">Email: reservations@aurorahotel.com</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#242826] text-center text-[11px] text-[#DADDD8]">
          &copy; {new Date().getFullYear()} Aurora Hotel. All rights reserved. Built with precision and care.
        </div>
      </div>
    </footer>
  );
}
