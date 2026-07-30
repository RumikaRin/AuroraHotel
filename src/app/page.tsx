import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default async function HomePage() {
  let roomCategories: Array<{ id: string; name: string; slug: string; basePrice: number; description: string; images: unknown }> = [];
  try {
    const queryPromise = db.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500),
    );
    roomCategories = (await Promise.race([queryPromise, timeoutPromise])) as typeof roomCategories;
  } catch {
    roomCategories = [
      { id: "cat-1", name: "Deluxe Ocean View", slug: "deluxe-ocean-view", basePrice: 2500000, description: "Phòng Deluxe sang trọng với tầm nhìn hướng biển tuyệt đẹp.", images: [] },
      { id: "cat-2", name: "Executive Suite", slug: "executive-suite", basePrice: 4500000, description: "Căn hộ Suite đẳng cấp dành cho doanh nhân và gia đình.", images: [] },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4ED] text-[#17211D]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#17211D] text-[#F7F4ED] py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-[#C5A46D]/20 overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">
            Contemporary Oceanfront Luxury
          </span>
          <h1 className="font-serif-display text-4xl sm:text-6xl font-normal leading-tight tracking-tight text-[#F7F4ED]">
            Trải Nghiệm Nghỉ Dưỡng Thượng Lưu
          </h1>
          <p className="text-sm sm:text-base text-[#DADDD8] max-w-2xl mx-auto font-light leading-relaxed">
            Không gian sang trọng tĩnh lặng bên bờ biển thơ mộng. Nơi mỗi kỳ nghỉ trở thành kỷ niệm khó quên.
          </p>

          {/* Search Console */}
          <div className="mt-10 bg-[#FFFDF8] text-[#17211D] p-6 rounded-2xl shadow-xl max-w-3xl mx-auto border border-[#C5A46D]/30">
            <form action="/rooms" method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div>
                <label htmlFor="checkIn" className="block text-xs font-semibold uppercase text-[#355B4B] mb-1">
                  Nhận phòng
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  aria-label="Nhận phòng"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full text-sm p-2.5 rounded-lg border border-[#DADDD8] bg-[#F7F4ED] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                />
              </div>
              <div>
                <label htmlFor="checkOut" className="block text-xs font-semibold uppercase text-[#355B4B] mb-1">
                  Trả phòng
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  aria-label="Trả phòng"
                  defaultValue={new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)}
                  className="w-full text-sm p-2.5 rounded-lg border border-[#DADDD8] bg-[#F7F4ED] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-sm font-semibold bg-[#17211D] text-[#C5A46D] hover:bg-[#242826] transition-all shadow-md"
                >
                  Tìm phòng trống
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Room Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center mb-12">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-[#17211D]">
            Phòng & Suite Thượng Lưu
          </h2>
          <p className="text-xs sm:text-sm text-[#355B4B] mt-2">
            Tuyển chọn các hạng phòng nghỉ dưỡng sang trọng với tầm nhìn hướng biển tuyệt mỹ.
          </p>
        </div>

        {roomCategories.length === 0 ? (
          <p className="text-center text-sm text-[#B84A4A] py-12">
            Đang cập nhật danh sách phòng...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roomCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#FFFDF8] rounded-2xl overflow-hidden border border-[#DADDD8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A46D]">
                    {cat.type}
                  </span>
                  <h3 className="font-serif-display text-xl font-semibold text-[#17211D] mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#242826] mt-2 line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(Array.isArray(cat.amenities) ? (cat.amenities as string[]) : []).slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#F7F4ED] text-[#355B4B] px-2 py-0.5 rounded border border-[#DADDD8]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#F7F4ED] mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#355B4B] block">Giá chỉ từ</span>
                    <span className="text-base font-semibold text-[#17211D]">
                      {formatVND(cat.basePrice)}
                    </span>
                    <span className="text-[10px] text-[#355B4B]"> / đêm</span>
                  </div>
                  <Link
                    href={`/rooms/${cat.slug}`}
                    className="px-4 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs font-semibold rounded-lg bg-[#C5A46D] text-[#17211D] hover:bg-[#b0905b] transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
